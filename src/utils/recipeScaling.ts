export interface ScaledIngredient {
  original: string;
  scaled: string;
}

// Common fractions used in recipes
const FRACTIONS: Record<string, number> = {
  '¼': 0.25,
  '½': 0.5,
  '¾': 0.75,
  '⅓': 1/3,
  '⅔': 2/3,
  '⅕': 0.2,
  '⅖': 0.4,
  '⅗': 0.6,
  '⅘': 0.8,
  '⅙': 1/6,
  '⅚': 5/6,
  '⅛': 0.125,
  '⅜': 0.375,
  '⅝': 0.625,
  '⅞': 0.875,
  '1/4': 0.25,
  '1/2': 0.5,
  '3/4': 0.75,
  '1/3': 1/3,
  '2/3': 2/3,
  '1/5': 0.2,
  '2/5': 0.4,
  '3/5': 0.6,
  '4/5': 0.8,
  '1/6': 1/6,
  '5/6': 5/6,
  '1/8': 0.125,
  '3/8': 0.375,
  '5/8': 0.625,
  '7/8': 0.875,
};

const REVERSE_FRACTIONS: Record<string, string> = {
  '0.25': '¼',
  '0.5': '½',
  '0.75': '¾',
  '0.333': '⅓',
  '0.667': '⅔',
  '0.2': '⅕',
  '0.4': '⅖',
  '0.6': '⅗',
  '0.8': '⅘',
  '0.167': '⅙',
  '0.833': '⅚',
  '0.125': '⅛',
  '0.375': '⅜',
  '0.625': '⅝',
  '0.875': '⅞',
};

export function numberToFraction(num: number): string {
  const whole = Math.floor(num);
  const decimal = num - whole;

  if (decimal === 0) {
    return whole.toString();
  }

  // Round to 3 decimal places for lookup
  const roundedDecimal = Math.round(decimal * 1000) / 1000;
  const fraction = REVERSE_FRACTIONS[roundedDecimal.toString()];

  if (fraction) {
    return whole > 0 ? `${whole} ${fraction}` : fraction;
  }

  // If no exact match, check if close to common fractions
  const tolerance = 0.02;
  for (const [decimalStr, frac] of Object.entries(REVERSE_FRACTIONS)) {
    if (Math.abs(parseFloat(decimalStr) - decimal) < tolerance) {
      return whole > 0 ? `${whole} ${frac}` : frac;
    }
  }

  // Round to 2 decimal places if no fraction found
  return num.toFixed(2).replace(/\.?0+$/, '');
}

export function parseIngredientQuantity(ingredient: string): {
  quantity: number | null;
  unit: string;
  ingredient: string;
  prefix: string;
} {
  // Match patterns like: "2 cups flour" or "1/2 tsp salt" or "1 ½ cups milk"
  const patterns = [
    // Matches: "2 1/2 cups" or "2 ½ cups" or "2.5 cups"
    /^(\d+(?:\s+[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|\s+\d+\/\d+)?|\d*[¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|\d+\/\d+|\d+\.\d+)\s+/,
    // Matches just the fraction at the start
    /^([¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|\d+\/\d+)\s+/,
  ];

  for (const pattern of patterns) {
    const match = ingredient.match(pattern);
    if (match) {
      const quantityStr = match[1].trim();
      let quantity = 0;

      // Handle mixed numbers (e.g., "2 1/2" or "2 ½")
      const mixedMatch = quantityStr.match(/^(\d+)\s+([¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|\d+\/\d+)$/);
      if (mixedMatch) {
        quantity = parseInt(mixedMatch[1]);
        const fractionPart = mixedMatch[2];
        quantity += FRACTIONS[fractionPart] || 0;
      } else if (FRACTIONS[quantityStr]) {
        quantity = FRACTIONS[quantityStr];
      } else if (quantityStr.includes('/')) {
        const [num, denom] = quantityStr.split('/').map(Number);
        quantity = num / denom;
      } else {
        quantity = parseFloat(quantityStr);
      }

      const remainder = ingredient.slice(match[0].length);
      return {
        quantity,
        unit: '',
        ingredient: remainder,
        prefix: match[0],
      };
    }
  }

  return {
    quantity: null,
    unit: '',
    ingredient,
    prefix: '',
  };
}

export function scaleIngredient(ingredient: string, scaleFactor: number): string {
  const parsed = parseIngredientQuantity(ingredient);

  if (parsed.quantity === null) {
    return ingredient;
  }

  const scaledQuantity = parsed.quantity * scaleFactor;
  const formattedQuantity = numberToFraction(scaledQuantity);

  return `${formattedQuantity} ${parsed.ingredient}`;
}

export function scaleRecipe(
  ingredients: string[],
  originalServings: string | null,
  newServings: number
): {
  scaledIngredients: string[];
  scaleFactor: number;
} {
  // Try to parse servings number
  const servingsMatch = originalServings?.match(/(\d+)/);
  const originalServingsNum = servingsMatch ? parseInt(servingsMatch[1]) : null;

  if (!originalServingsNum) {
    return {
      scaledIngredients: ingredients,
      scaleFactor: 1,
    };
  }

  const scaleFactor = newServings / originalServingsNum;
  const scaledIngredients = ingredients.map(ing => scaleIngredient(ing, scaleFactor));

  return {
    scaledIngredients,
    scaleFactor,
  };
}
