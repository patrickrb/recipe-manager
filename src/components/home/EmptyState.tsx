'use client';

import { Icons } from '@/components/Icons';

interface EmptyStateProps {
    type: 'no-recipes' | 'no-results';
    onCreate?: () => void;
    onClearFilters?: () => void;
}

export function EmptyState({ type, onCreate, onClearFilters }: EmptyStateProps) {
    if (type === 'no-recipes') {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center">
                <Icons.Empty className="w-24 h-24 text-gray-300 mb-6" />
                <h2 className="text-2xl font-semibold text-gray-600 mb-4">No recipes yet</h2>
                <p className="text-gray-500 mb-6 max-w-md">
                    Start building your recipe collection by creating your first recipe
                </p>
                <button
                    onClick={onCreate}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Icons.Plus className="w-5 h-5" />
                    Create Your First Recipe
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-96 text-center">
            <Icons.Search className="w-24 h-24 text-gray-300 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">No recipes found</h2>
            <p className="text-gray-500 mb-6 max-w-md">
                No recipes match your current filters. Try adjusting your search or category.
            </p>
            <button
                onClick={onClearFilters}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                Clear All Filters
            </button>
        </div>
    );
}
