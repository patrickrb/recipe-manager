'use client';

import { Icons } from '@/components/Icons';

interface RecipeFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    sortBy: 'name' | 'recent' | 'rating';
    onSortChange: (sort: 'name' | 'recent' | 'rating') => void;
    filterCategory: string;
    onCategoryChange: (category: string) => void;
    categories: string[];
    totalRecipes: number;
    filteredCount: number;
}

export function RecipeFilters({
    searchQuery,
    onSearchChange,
    sortBy,
    onSortChange,
    filterCategory,
    onCategoryChange,
    categories,
    totalRecipes,
    filteredCount,
}: RecipeFiltersProps) {
    return (
        <div className="mb-8 bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-col gap-4">
                {/* Search Bar */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icons.Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search recipes by title, description, or ingredients..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            <Icons.X className="w-5 h-5" />
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
                                onChange={(e) => onSortChange(e.target.value as 'name' | 'recent' | 'rating')}
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
                                onChange={(e) => onCategoryChange(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                            >
                                <option value="all">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="text-sm text-gray-600">
                        Showing {filteredCount} of {totalRecipes} recipe{totalRecipes !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>
        </div>
    );
}
