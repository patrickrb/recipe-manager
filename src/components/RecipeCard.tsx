'use client';

import { Recipe } from '@/types/recipe';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
}

export function RecipeCard({ recipe, onEdit, onDelete }: RecipeCardProps) {
  const router = useRouter();
  const { isAdmin } = useSession();

  const handleCardClick = () => {
    // Save current scroll position before navigating
    sessionStorage.setItem('homeScrollPos', window.scrollY.toString());
    router.push(`/recipe/${recipe.id}`);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 cursor-pointer border border-gray-100 overflow-hidden"
      onClick={handleCardClick}
    >
      <div className="w-full h-48 overflow-hidden bg-gray-200">
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{recipe.title}</h3>
          {isAdmin && (
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
          )}
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

        <div className="flex justify-between items-center text-sm text-gray-500 border-t border-gray-100 pt-4">
          <div className="flex gap-4">
            <span>{recipe.ingredients.length} ingredients</span>
            <span>{recipe.instructions.length} steps</span>
          </div>
          {recipe.rating ? (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-yellow-400 fill-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span className="text-gray-700 font-medium">{recipe.rating}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
