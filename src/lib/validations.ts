import { z } from 'zod';

export const recipeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  ingredients: z.array(z.string()).min(1, 'At least one ingredient is required'),
  instructions: z.array(z.string()).min(1, 'At least one instruction is required'),
  categories: z.array(z.string()).default([]),
  notes: z.string().optional().nullable(),
  sourceUrl: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
  sourceAuthor: z.string().optional().nullable(),
  prepTime: z.string().optional().nullable(),
  cookTime: z.string().optional().nullable(),
  totalTime: z.string().optional().nullable(),
  servings: z.string().optional().nullable(),
  difficulty: z.string().optional().nullable(),
  calories: z.number().int().nonnegative().optional().nullable(),
  protein: z.number().int().nonnegative().optional().nullable(),
  carbs: z.number().int().nonnegative().optional().nullable(),
  fat: z.number().int().nonnegative().optional().nullable(),
  fiber: z.number().int().nonnegative().optional().nullable(),
  sugar: z.number().int().nonnegative().optional().nullable(),
  sodium: z.number().int().nonnegative().optional().nullable(),
});

export type RecipeInput = z.infer<typeof recipeSchema>;
