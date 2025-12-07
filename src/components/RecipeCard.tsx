'use client';

import { Recipe } from '@/types/recipe';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import Image from 'next/image';
import { Icons } from './Icons';

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  searchQuery: string;
  sortBy: 'name' | 'recent' | 'rating';
  filterCategory: string;
}

export function RecipeCard({ recipe, onEdit, onDelete, searchQuery, sortBy, filterCategory }: RecipeCardProps) {
  const router = useRouter();
  const { isAdmin } = useSession();

  const handleCardClick = () => {
    // Save current scroll position and search state before navigating
    sessionStorage.setItem('homeScrollPos', window.scrollY.toString());
    sessionStorage.setItem('homeSearchQuery', searchQuery);
    sessionStorage.setItem('homeSortBy', sortBy);
    sessionStorage.setItem('homeFilterCategory', filterCategory);
    router.push(`/recipe/${recipe.id}`);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 cursor-pointer border border-gray-100 overflow-hidden group"
      onClick={handleCardClick}
    >
      <div className="w-full h-48 overflow-hidden bg-gray-200 relative">
        {recipe.image ? (
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icons.Placeholder className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-800 line-clamp-1" title={recipe.title}>
            {recipe.title}
          </h3>
          {isAdmin && (
            <div className="flex gap-2 shrink-0 ml-2">
              <button
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(recipe);
                }}
                aria-label="Edit recipe"
              >
                <Icons.Edit className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(recipe.id);
                }}
                aria-label="Delete recipe"
              >
                <Icons.Delete className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {recipe.description && (
          <p className="text-gray-600 mb-4 line-clamp-2 h-10">{recipe.description}</p>
        )}

        <div className="flex gap-2 flex-wrap mb-4 h-6 overflow-hidden">
          {recipe.categories.slice(0, 3).map((category, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
            >
              {category}
            </span>
          ))}
          {recipe.categories.length > 3 && (
            <span className="px-2 py-1 text-gray-500 text-xs">+{recipe.categories.length - 3}</span>
          )}
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 border-t border-gray-100 pt-4">
          <div className="flex gap-4">
            <span>{recipe.ingredients.length} ingredients</span>
            <span>{recipe.instructions.length} steps</span>
          </div>
          {recipe.rating ? (
            <div className="flex items-center gap-1">
              <Icons.Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-gray-700 font-medium">{recipe.rating}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
