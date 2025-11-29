import { useState, useEffect, useCallback } from 'react';
import { Recipe, RecipeFormData } from '@/types/recipe';
import { api } from '@/lib/api';

export function useRecipes() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRecipes = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await api.recipes.list();
            setRecipes(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch recipes');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createRecipe = async (data: RecipeFormData) => {
        try {
            const newRecipe = await api.recipes.create(data);
            setRecipes((prev) => [newRecipe, ...prev]);
            return newRecipe;
        } catch (err) {
            throw err;
        }
    };

    const updateRecipe = async (id: string, data: RecipeFormData) => {
        try {
            const updatedRecipe = await api.recipes.update(id, data);
            setRecipes((prev) => prev.map((r) => (r.id === id ? updatedRecipe : r)));
            return updatedRecipe;
        } catch (err) {
            throw err;
        }
    };

    const deleteRecipe = async (id: string) => {
        try {
            await api.recipes.delete(id);
            setRecipes((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            throw err;
        }
    };

    useEffect(() => {
        fetchRecipes();
    }, [fetchRecipes]);

    return {
        recipes,
        isLoading,
        error,
        createRecipe,
        updateRecipe,
        deleteRecipe,
        refreshRecipes: fetchRecipes,
    };
}
