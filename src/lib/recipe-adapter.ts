import { Recipe as PrismaRecipe } from "@prisma/client";
import { Recipe } from "@/types/recipe";

export function serializeRecipe(recipe: Partial<Recipe>): any {
  return {
    ...recipe,
    ingredients: recipe.ingredients ? JSON.stringify(recipe.ingredients) : "[]",
    instructions: recipe.instructions ? JSON.stringify(recipe.instructions) : "[]",
    categories: recipe.categories ? JSON.stringify(recipe.categories) : "[]",
  };
}

export function deserializeRecipe(recipe: PrismaRecipe & { user?: any }): Recipe {
  return {
    ...recipe,
    ingredients: typeof recipe.ingredients === "string"
      ? JSON.parse(recipe.ingredients)
      : recipe.ingredients,
    instructions: typeof recipe.instructions === "string"
      ? JSON.parse(recipe.instructions)
      : recipe.instructions,
    categories: typeof recipe.categories === "string"
      ? JSON.parse(recipe.categories)
      : recipe.categories,
  } as Recipe;
}
