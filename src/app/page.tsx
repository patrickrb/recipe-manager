'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Recipe, RecipeFormData } from '@/types/recipe';
import { RecipeForm } from '@/components/RecipeForm';
import { useSession } from '@/hooks/useSession';
import { useRecipes } from '@/hooks/useRecipes';
import { useToast } from '@/contexts/ToastContext';
import { RecipeFilters } from '@/components/home/RecipeFilters';
import { RecipeList } from '@/components/home/RecipeList';
import { EmptyState } from '@/components/home/EmptyState';
import { Icons } from '@/components/Icons';

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
    const editId = searchParams.get('edit');
    if (editId && recipes.length > 0) {
      const recipe = recipes.find(r => r.id === editId);
      if (recipe) {
        onEditRecipe(recipe);
        router.replace('/');
      }
    }
  }, [searchParams, recipes, onEditRecipe, router]);

  return null;
}

function HomeContent() {
  const router = useRouter();
  const { isAdmin } = useSession();
  const { recipes, isLoading, createRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const { showToast } = useToast();

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'recent' | 'rating'>('name');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Restore scroll position and search state
  useEffect(() => {
    if (!isLoading && recipes.length > 0) {
      const savedScrollPos = sessionStorage.getItem('homeScrollPos');
      const savedSearchQuery = sessionStorage.getItem('homeSearchQuery');
      const savedSortBy = sessionStorage.getItem('homeSortBy');
      const savedFilterCategory = sessionStorage.getItem('homeFilterCategory');

      if (savedSearchQuery !== null) {
        setSearchQuery(savedSearchQuery);
        sessionStorage.removeItem('homeSearchQuery');
      }

      if (savedSortBy) {
        setSortBy(savedSortBy as 'name' | 'recent' | 'rating');
        sessionStorage.removeItem('homeSortBy');
      }

      if (savedFilterCategory) {
        setFilterCategory(savedFilterCategory);
        sessionStorage.removeItem('homeFilterCategory');
      }

      if (savedScrollPos) {
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(savedScrollPos));
          sessionStorage.removeItem('homeScrollPos');
        });
      }
    }
  }, [isLoading, recipes.length]);

  const handleOpenForm = (recipe?: Recipe) => {
    setSelectedRecipe(recipe || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedRecipe(null);
    setIsFormOpen(false);
  };

  const handleSaveRecipe = async (recipeData: RecipeFormData) => {
    try {
      if (selectedRecipe) {
        await updateRecipe(selectedRecipe.id, recipeData);
        showToast('Recipe updated successfully!', 'success');
      } else {
        await createRecipe(recipeData);
        showToast('Recipe created successfully!', 'success');
      }
    } catch (error) {
      showToast(
        selectedRecipe ? 'Error updating recipe' : 'Error creating recipe',
        'error'
      );
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    try {
      await deleteRecipe(id);
      showToast('Recipe deleted successfully!', 'success');
    } catch (error) {
      showToast('Error deleting recipe', 'error');
    }
  };

  const allCategories = useMemo(() =>
    Array.from(new Set(recipes.flatMap(recipe => recipe.categories))).sort(),
    [recipes]
  );

  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = recipes;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(query) ||
        recipe.description?.toLowerCase().includes(query) ||
        recipe.ingredients.some(ing => ing.toLowerCase().includes(query))
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(recipe =>
        recipe.categories.includes(filterCategory)
      );
    }

    return [...filtered].sort((a, b) => {
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
  }, [recipes, searchQuery, filterCategory, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            Recipe Manager
          </h1>
          <div className="flex gap-3">
            {isAdmin && (
              <>
                <button
                  onClick={() => router.push('/import')}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <Icons.Import className="w-5 h-5" />
                  <span className="hidden sm:inline">Import Recipe</span>
                </button>
                <button
                  onClick={() => handleOpenForm()}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <Icons.Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">New Recipe</span>
                </button>
              </>
            )}
          </div>
        </div>

        {recipes.length > 0 && (
          <RecipeFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            filterCategory={filterCategory}
            onCategoryChange={setFilterCategory}
            categories={allCategories}
            totalRecipes={recipes.length}
            filteredCount={filteredAndSortedRecipes.length}
          />
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          </div>
        ) : recipes.length === 0 ? (
          <EmptyState type="no-recipes" onCreate={() => handleOpenForm()} />
        ) : filteredAndSortedRecipes.length === 0 ? (
          <EmptyState
            type="no-results"
            onClearFilters={() => {
              setSearchQuery('');
              setFilterCategory('all');
            }}
          />
        ) : (
          <RecipeList
            recipes={filteredAndSortedRecipes}
            onEdit={handleOpenForm}
            onDelete={handleDeleteRecipe}
            searchQuery={searchQuery}
            sortBy={sortBy}
            filterCategory={filterCategory}
          />
        )}

        <RecipeForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSave={handleSaveRecipe}
          recipe={selectedRecipe}
        />
      </div>

      <Suspense fallback={null}>
        <SearchParamsHandler recipes={recipes} onEditRecipe={handleOpenForm} />
      </Suspense>
    </div>
  );
}

export default function Home() {
  return <HomeContent />;
}

