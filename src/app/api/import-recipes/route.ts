import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import * as cheerio from 'cheerio';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { isAdmin } from '@/lib/auth';
import { deserializeRecipe } from '@/lib/recipe-adapter';

interface ParsedRecipe {
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  categories: string[];
  rating: number;
  sourceUrl?: string;
  sourceAuthor?: string;
  imageUrl?: string;
  notes?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  servings?: string;
  difficulty?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

async function parseRecipeHTML(html: string): Promise<ParsedRecipe | null> {
  const $ = cheerio.load(html);

  // Extract title
  const title = $('[itemprop="name"]').first().text().trim();
  if (!title) {
    return null;
  }

  // Extract rating
  const ratingText = $('.rating').attr('value') || '0';
  const rating = parseInt(ratingText) || 0;

  // Extract categories
  const categoriesText = $('[itemprop="recipeCategory"]').text().trim();
  const categories = categoriesText
    ? categoriesText.split(',').map(c => c.trim()).filter(Boolean)
    : [];

  // Extract source URL and author
  const sourceUrl = $('[itemprop="url"]').attr('href');
  const sourceAuthor = $('[itemprop="author"]').text().trim() || undefined;

  // Extract ingredients
  const ingredients: string[] = [];
  $('[itemprop="recipeIngredient"]').each((_, el) => {
    const text = $(el).text().trim();
    if (text) ingredients.push(text);
  });

  // Extract instructions
  const instructions: string[] = [];
  $('[itemprop="recipeInstructions"] p.line').each((_, el) => {
    const text = $(el).text().trim();
    if (text) instructions.push(text);
  });

  // If no paragraph-based instructions, try to get the full text and split
  if (instructions.length === 0) {
    const fullInstructions = $('[itemprop="recipeInstructions"]').text().trim();
    if (fullInstructions) {
      const split = fullInstructions.split(/\n+/).map(s => s.trim()).filter(Boolean);
      instructions.push(...split);
    }
  }

  // Extract notes
  const notes = $('[itemprop="comment"]').text().trim() || undefined;

  // Extract metadata from text labels
  const prepTime = $('b:contains("Prep Time:")').next('span').text().trim() || undefined;
  const cookTime = $('b:contains("Cook Time:")').next('span').text().trim() || undefined;
  const totalTime = $('b:contains("Total Time:")').next('span').text().trim() || undefined;
  const servings = $('b:contains("Servings:")').next('span').text().trim() || undefined;
  const difficulty = $('b:contains("Difficulty:")').next('span').text().trim() || undefined;

  // Extract nutrition information
  const nutritionText = $('[itemprop="nutrition"]').text();
  let calories: number | undefined;
  let protein: number | undefined;
  let carbs: number | undefined;
  let fat: number | undefined;
  let fiber: number | undefined;
  let sugar: number | undefined;
  let sodium: number | undefined;

  if (nutritionText) {
    // Try to parse different nutrition formats
    // Format 1: "Calories: 57kcal, Carbohydrates: 14g, Protein: 1g..."
    const caloriesMatch = nutritionText.match(/Calories[:\s]+(\d+)/i);
    if (caloriesMatch) calories = parseInt(caloriesMatch[1]);

    const proteinMatch = nutritionText.match(/Protein[:\s]+(\d+)/i);
    if (proteinMatch) protein = parseInt(proteinMatch[1]);

    const carbsMatch = nutritionText.match(/Carb(?:ohydrate)?s?[:\s]+(\d+)/i);
    if (carbsMatch) carbs = parseInt(carbsMatch[1]);

    const fatMatch = nutritionText.match(/Fat Total[:\s]+(\d+)|Fat[:\s]+(\d+)/i);
    if (fatMatch) fat = parseInt(fatMatch[1] || fatMatch[2]);

    const fiberMatch = nutritionText.match(/Fiber[:\s]+(\d+)/i);
    if (fiberMatch) fiber = parseInt(fiberMatch[1]);

    const sugarMatch = nutritionText.match(/Sugar(?:s)?[:\s]+(\d+)/i);
    if (sugarMatch) sugar = parseInt(sugarMatch[1]);

    const sodiumMatch = nutritionText.match(/Sodium[:\s]+(\d+)/i);
    if (sodiumMatch) sodium = parseInt(sodiumMatch[1]);
  }

  return {
    title,
    ingredients,
    instructions,
    categories,
    rating,
    sourceUrl,
    sourceAuthor,
    notes,
    prepTime,
    cookTime,
    totalTime,
    servings,
    difficulty,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    sugar,
    sodium,
  };
}

async function scrapeImageFromUrl(url: string): Promise<string | undefined> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RecipeManager/1.0)',
      },
    });

    if (!response.ok) return undefined;

    const html = await response.text();
    const $ = cheerio.load(html);

    // Try Open Graph image first
    let imageUrl = $('meta[property="og:image"]').attr('content');

    // Try Twitter card image
    if (!imageUrl) {
      imageUrl = $('meta[name="twitter:image"]').attr('content');
    }

    // Try schema.org image
    if (!imageUrl) {
      imageUrl = $('[itemprop="image"]').attr('src') || $('[itemprop="image"]').attr('content');
    }

    if (imageUrl) {
      // Make sure it's an absolute URL
      if (imageUrl.startsWith('//')) {
        imageUrl = 'https:' + imageUrl;
      } else if (imageUrl.startsWith('/')) {
        const urlObj = new URL(url);
        imageUrl = urlObj.origin + imageUrl;
      }
      return imageUrl;
    }

    return undefined;
  } catch (error) {
    return undefined;
  }
}

async function downloadAndUploadImage(imageUrl: string, baseUrl: string): Promise<string | undefined> {
  try {
    const response = await fetch(`${baseUrl}/api/download-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) return undefined;

    const data = await response.json();
    return data.url;
  } catch (error) {
    return undefined;
  }
}

export async function POST(request: NextRequest) {
  // Require admin authentication
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (!isAdmin(session.user.role)) {
    return NextResponse.json(
      { error: 'Forbidden: Only admins can import recipes' },
      { status: 403 }
    );
  }

  const recipesDir = join(process.cwd(), 'recipes');
  const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  const results = {
    total: 0,
    imported: 0,
    skipped: 0,
    errors: 0,
    details: [] as string[],
  };

  try {
    const files = await readdir(recipesDir);
    const htmlFiles = files.filter(f => f.endsWith('.html'));
    results.total = htmlFiles.length;

    for (const file of htmlFiles) {
      try {
        results.details.push(`Processing: ${file}`);
        const filePath = join(recipesDir, file);
        const html = await readFile(filePath, 'utf-8');

        const parsed = await parseRecipeHTML(html);
        if (!parsed) {
          results.details.push(`  Skipped (no title)`);
          results.skipped++;
          continue;
        }

        // Check if recipe already exists
        const existing = await prisma.recipe.findFirst({
          where: { title: parsed.title }
        });

        if (existing) {
          results.details.push(`  Already exists, skipping`);
          results.skipped++;
          continue;
        }

        // Try to get image from source URL
        let imageUrl = parsed.imageUrl;
        if (!imageUrl && parsed.sourceUrl) {
          results.details.push(`  Scraping image from: ${parsed.sourceUrl}`);
          const scrapedImage = await scrapeImageFromUrl(parsed.sourceUrl);
          if (scrapedImage) {
            results.details.push(`  Found image: ${scrapedImage}`);
            imageUrl = await downloadAndUploadImage(scrapedImage, baseUrl);
            if (imageUrl) {
              results.details.push(`  Image uploaded to Azure`);
            }
          }
        }

        // Create recipe in database
        await prisma.recipe.create({
          data: {
            title: parsed.title,
            description: parsed.description || null,
            ingredients: parsed.ingredients,
            instructions: parsed.instructions,
            categories: parsed.categories,
            notes: parsed.notes || null,
            rating: parsed.rating > 0 ? parsed.rating : null,
            sourceUrl: parsed.sourceUrl || null,
            sourceAuthor: parsed.sourceAuthor || null,
            prepTime: parsed.prepTime || null,
            cookTime: parsed.cookTime || null,
            totalTime: parsed.totalTime || null,
            servings: parsed.servings || null,
            difficulty: parsed.difficulty || null,
            calories: parsed.calories || null,
            protein: parsed.protein || null,
            carbs: parsed.carbs || null,
            fat: parsed.fat || null,
            fiber: parsed.fiber || null,
            sugar: parsed.sugar || null,
            sodium: parsed.sodium || null,
            image: imageUrl || null,
          },
        });

        results.details.push(`  ✓ Imported successfully`);
        results.imported++;

        // Small delay to avoid overwhelming
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        results.details.push(`  ✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        results.errors++;
      }
    }

    return NextResponse.json(results);

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to import recipes', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
