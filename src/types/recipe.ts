export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  ingredients: string[];
  instructions: string[];
  categories: string[];
  notes: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface RecipeFormData {
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  categories: string[];
  notes?: string;
}
