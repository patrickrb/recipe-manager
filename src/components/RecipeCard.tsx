'use client';

import { Recipe } from '@/types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
}

export function RecipeCard({ recipe, onEdit, onDelete }: RecipeCardProps) {
  return (
    <div
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-200 cursor-pointer border border-gray-100"
      onClick={() => onEdit(recipe)}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{recipe.title}</h3>
        <div className="flex gap-2">
          <button
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(recipe);
            }}
            aria-label="Edit recipe"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(recipe.id);
            }}
            aria-label="Delete recipe"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {recipe.description && (
        <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>
      )}

      {recipe.categories.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          {recipe.categories.map((category, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
            >
              {category}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-between text-sm text-gray-500 border-t border-gray-100 pt-4">
        <span>{recipe.ingredients.length} ingredients</span>
        <span>{recipe.instructions.length} steps</span>
      </div>
    </div>
  );
}
