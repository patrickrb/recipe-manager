'use client';

import { useState, useEffect } from 'react';
import { Recipe, RecipeFormData } from '@/types/recipe';
import { RecipeCard } from '@/components/RecipeCard';
import { RecipeForm } from '@/components/RecipeForm';

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

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

  const handleOpenForm = (recipe?: Recipe) => {
    setSelectedRecipe(recipe || null);
    setIsFormOpen(true);
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
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
    </div>
  );
}

