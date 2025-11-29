import { RecipeInput } from './validations';
import { Recipe } from '@/types/recipe';

class ApiError extends Error {
    constructor(public message: string, public status?: number) {
        super(message);
    }
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(errorData.error || 'An error occurred', response.status);
    }
    return response.json();
}

export const api = {
    recipes: {
        list: async (): Promise<Recipe[]> => {
            const res = await fetch('/api/recipes');
            return handleResponse<Recipe[]>(res);
        },
        create: async (data: RecipeInput): Promise<Recipe> => {
            const res = await fetch('/api/recipes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return handleResponse<Recipe>(res);
        },
        update: async (id: string, data: RecipeInput): Promise<Recipe> => {
            const res = await fetch(`/api/recipes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return handleResponse<Recipe>(res);
        },
        delete: async (id: string): Promise<void> => {
            const res = await fetch(`/api/recipes/${id}`, {
                method: 'DELETE',
            });
            return handleResponse<void>(res);
        },
        get: async (id: string): Promise<Recipe> => {
            const res = await fetch(`/api/recipes/${id}`);
            return handleResponse<Recipe>(res);
        },
    },
};
