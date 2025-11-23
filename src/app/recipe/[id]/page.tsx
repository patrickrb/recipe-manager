'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Recipe } from '@/types/recipe';

export default function RecipeView() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchRecipe();
    }
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const response = await fetch(`/api/recipes/${id}`);
      if (!response.ok) throw new Error('Failed to fetch recipe');
      const data = await response.json();
      setRecipe(data);
    } catch (err) {
      setError('Failed to load recipe');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/?edit=${id}`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;

    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete recipe');

      router.push('/');
    } catch (err) {
      alert('Failed to delete recipe. Please try again.');
      console.error(err);
    }
  };

  const handleRating = async (newRating: number) => {
    if (!recipe) return;

    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...recipe,
          rating: newRating,
        }),
      });

      if (!response.ok) throw new Error('Failed to update rating');

      const updatedRecipe = await response.json();
      setRecipe(updatedRecipe);
    } catch (err) {
      alert('Failed to update rating. Please try again.');
      console.error(err);
    }
  };

  const StarRating = ({ rating, onRate }: { rating: number; onRate: (rating: number) => void }) => {
    const [hover, setHover] = useState(0);

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRate(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-colors"
          >
            <svg
              className={`w-8 h-8 ${
                star <= (hover || rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 fill-gray-300'
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error || 'Recipe not found'}
          </div>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            ← Back to recipes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header with back button and actions */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Recipes
          </button>

          <div className="flex justify-between items-start">
            <h1 className="text-4xl font-bold text-gray-900">{recipe.title}</h1>
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Image */}
          {recipe.image && (
            <div className="w-full h-96 overflow-hidden">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            {/* Rating */}
            <div className="mb-8">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Rate this recipe:</span>
                <StarRating rating={recipe.rating || 0} onRate={handleRating} />
                {recipe.rating ? (
                  <span className="text-sm text-gray-600">({recipe.rating}/5)</span>
                ) : (
                  <span className="text-sm text-gray-500 italic">Not rated yet</span>
                )}
              </div>
            </div>

            {/* Recipe Metadata */}
            {(recipe.prepTime || recipe.cookTime || recipe.totalTime || recipe.servings || recipe.difficulty) && (
              <div className="mb-8 grid grid-cols-2 sm:grid-cols-5 gap-4">
                {recipe.prepTime && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Prep Time</div>
                    <div className="text-sm font-semibold text-gray-900">{recipe.prepTime}</div>
                  </div>
                )}
                {recipe.cookTime && (
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Cook Time</div>
                    <div className="text-sm font-semibold text-gray-900">{recipe.cookTime}</div>
                  </div>
                )}
                {recipe.totalTime && (
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Total Time</div>
                    <div className="text-sm font-semibold text-gray-900">{recipe.totalTime}</div>
                  </div>
                )}
                {recipe.servings && (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Servings</div>
                    <div className="text-sm font-semibold text-gray-900">{recipe.servings}</div>
                  </div>
                )}
                {recipe.difficulty && (
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Difficulty</div>
                    <div className="text-sm font-semibold text-gray-900">{recipe.difficulty}</div>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {recipe.description && (
              <div className="mb-8">
                <p className="text-lg text-gray-700">{recipe.description}</p>
              </div>
            )}

            {/* Categories */}
            {recipe.categories.length > 0 && (
              <div className="mb-8">
                <div className="flex gap-2 flex-wrap">
                  {recipe.categories.map((category, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Nutrition */}
            {(recipe.calories || recipe.protein || recipe.carbs || recipe.fat) && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Nutrition Information
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {recipe.calories && (
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{recipe.calories}</div>
                      <div className="text-sm text-gray-600">Calories</div>
                    </div>
                  )}
                  {recipe.protein && (
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{recipe.protein}g</div>
                      <div className="text-sm text-gray-600">Protein</div>
                    </div>
                  )}
                  {recipe.carbs && (
                    <div className="bg-yellow-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-600">{recipe.carbs}g</div>
                      <div className="text-sm text-gray-600">Carbs</div>
                    </div>
                  )}
                  {recipe.fat && (
                    <div className="bg-orange-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">{recipe.fat}g</div>
                      <div className="text-sm text-gray-600">Fat</div>
                    </div>
                  )}
                  {recipe.fiber && (
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">{recipe.fiber}g</div>
                      <div className="text-sm text-gray-600">Fiber</div>
                    </div>
                  )}
                  {recipe.sugar && (
                    <div className="bg-pink-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-pink-600">{recipe.sugar}g</div>
                      <div className="text-sm text-gray-600">Sugar</div>
                    </div>
                  )}
                  {recipe.sodium && (
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">{recipe.sodium}mg</div>
                      <div className="text-sm text-gray-600">Sodium</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ingredients */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Ingredients ({recipe.ingredients.length})
              </h2>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-700">
                    <span className="text-blue-600 font-bold mt-1">•</span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Instructions ({recipe.instructions.length} steps)
              </h2>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <p className="text-gray-700 pt-1">{instruction}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Notes */}
            {recipe.notes && (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Notes
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap">{recipe.notes}</p>
              </div>
            )}

            {/* Source */}
            {(recipe.sourceUrl || recipe.sourceAuthor) && (
              <div className={`${recipe.notes ? '' : 'border-t'} border-gray-200 pt-6`}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Source
                </h2>
                <div className="space-y-2">
                  {recipe.sourceAuthor && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 font-medium">Author:</span>
                      <span className="text-gray-700">{recipe.sourceAuthor}</span>
                    </div>
                  )}
                  {recipe.sourceUrl && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 font-medium">URL:</span>
                      <a
                        href={recipe.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline break-all"
                      >
                        {recipe.sourceUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
