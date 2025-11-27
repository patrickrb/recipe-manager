export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  ingredients: string[];
  instructions: string[];
  categories: string[];
  notes: string | null;
  rating: number | null;
  sourceUrl: string | null;
  sourceAuthor: string | null;
  prepTime: string | null;
  cookTime: string | null;
  totalTime: string | null;
  servings: string | null;
  difficulty: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  user?: {
    id: string;
    username: string;
    avatar: string | null;
  };
}

export interface RecipeFormData {
  title: string;
  description?: string;
  image?: string;
  ingredients: string[];
  instructions: string[];
  categories: string[];
  notes?: string;
  sourceUrl?: string;
  sourceAuthor?: string;
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
