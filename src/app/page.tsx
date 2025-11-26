'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Recipe, RecipeFormData } from '@/types/recipe';
import { RecipeCard } from '@/components/RecipeCard';
import { RecipeForm } from '@/components/RecipeForm';

// Component to handle URL search params
function SearchParamsHandler({
  recipes,
  onEditRecipe
}: {
  recipes: Recipe[];
  onEditRecipe: (recipe: Recipe) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if we should open edit form for a specific recipe
    const editId = searchParams.get('edit');
    if (editId && recipes.length > 0) {
      const recipe = recipes.find(r => r.id === editId);
      if (recipe) {
        onEditRecipe(recipe);
        // Clear the query parameter
        router.replace('/');
      }
    }
  }, [searchParams, recipes, onEditRecipe, router]);

  return null;
}

function HomeContent() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'recent' | 'rating'>('recent');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleOpenForm = (recipe?: Recipe) => {
    setSelectedRecipe(recipe || null);
    setIsFormOpen(true);
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/recipes');
      if (!response.ok) throw new Error('Failed to fetch recipes');
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      showToast('Error fetching recipes. Please try again later.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRecipe = async (recipeData: RecipeFormData) => {
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData),
      });

      if (!response.ok) throw new Error('Failed to create recipe');

      const newRecipe = await response.json();
      setRecipes([newRecipe, ...recipes]);
      showToast('Recipe created successfully!', 'success');
    } catch (error) {
      showToast('Error creating recipe. Please try again.', 'error');
      throw error;
    }
  };

  const handleUpdateRecipe = async (recipeData: RecipeFormData) => {
    if (!selectedRecipe) return;

    try {
      const response = await fetch(`/api/recipes/${selectedRecipe.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData),
      });

      if (!response.ok) throw new Error('Failed to update recipe');

      const updatedRecipe = await response.json();
      setRecipes(recipes.map((r) => (r.id === updatedRecipe.id ? updatedRecipe : r)));
      showToast('Recipe updated successfully!', 'success');
    } catch (error) {
      showToast('Error updating recipe. Please try again.', 'error');
      throw error;
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;

    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete recipe');

      setRecipes(recipes.filter((r) => r.id !== id));
      showToast('Recipe deleted successfully!', 'success');
    } catch (error) {
      showToast('Error deleting recipe. Please try again.', 'error');
    }
  };

  const handleCloseForm = () => {
    setSelectedRecipe(null);
    setIsFormOpen(false);
  };

  const handleSaveRecipe = async (recipeData: RecipeFormData) => {
    if (selectedRecipe) {
      await handleUpdateRecipe(recipeData);
    } else {
      await handleCreateRecipe(recipeData);
    }
  };

  // Get all unique categories
  const allCategories = Array.from(
    new Set(recipes.flatMap(recipe => recipe.categories))
  ).sort();

  // Filter and sort recipes
  const getFilteredAndSortedRecipes = () => {
    let filtered = recipes;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(recipe => {
        // Search in title
        if (recipe.title.toLowerCase().includes(query)) return true;

        // Search in description
        if (recipe.description?.toLowerCase().includes(query)) return true;

        // Search in ingredients
        if (recipe.ingredients.some(ing => ing.toLowerCase().includes(query))) return true;

        return false;
      });
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(recipe =>
        recipe.categories.includes(filterCategory)
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return sorted;
  };

  const filteredAndSortedRecipes = getFilteredAndSortedRecipes();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`px-6 py-4 rounded-lg shadow-lg ${
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <p>{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            Recipe Manager
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/import')}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span className="hidden sm:inline">Import Recipe</span>
            </button>
            <button
              onClick={() => handleOpenForm()}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">New Recipe</span>
            </button>
          </div>
        </div>

        {/* Sorting and Filtering Controls */}
        {recipes.length > 0 && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search recipes by title, description, or ingredients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Sort and Filter Row */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  {/* Sort By */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="sort" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      Sort by:
                    </label>
                    <select
                      id="sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'name' | 'recent' | 'rating')}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                    >
                      <option value="recent">Recently Added</option>
                      <option value="name">Name (A-Z)</option>
                      <option value="rating">Top Rated</option>
                    </select>
                  </div>

                  {/* Filter by Category */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="category" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      Category:
                    </label>
                    <select
                      id="category"
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                    >
                      <option value="all">All Categories</option>
                      {allCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Results Count */}
                <div className="text-sm text-gray-600">
                  Showing {filteredAndSortedRecipes.length} of {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          </div>
        ) : recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <svg
              className="w-24 h-24 text-gray-300 mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">No recipes yet</h2>
            <p className="text-gray-500 mb-6 max-w-md">
              Start building your recipe collection by creating your first recipe
            </p>
            <button
              onClick={() => handleOpenForm()}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Recipe
            </button>
          </div>
        ) : filteredAndSortedRecipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <svg
              className="w-24 h-24 text-gray-300 mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">No recipes found</h2>
            <p className="text-gray-500 mb-6 max-w-md">
              No recipes match your current {searchQuery ? 'search' : 'filter'}. Try {searchQuery ? 'a different search term' : 'selecting a different category'}.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterCategory('all');
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onEdit={handleOpenForm}
                onDelete={handleDeleteRecipe}
              />
            ))}
          </div>
        )}

        <RecipeForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSave={handleSaveRecipe}
          recipe={selectedRecipe}
        />
      </div>

      {/* Handle search params for edit functionality */}
      <Suspense fallback={null}>
        <SearchParamsHandler recipes={recipes} onEditRecipe={handleOpenForm} />
      </Suspense>
    </div>
  );
}

export default function Home() {
  return <HomeContent />;
}

