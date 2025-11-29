'use client';

import { useState, useEffect } from 'react';
import { Recipe, RecipeFormData } from '@/types/recipe';
import { Icons } from '@/components/Icons';
import { ImageUpload } from './recipe-form/ImageUpload';
import { DynamicList } from './recipe-form/DynamicList';

interface RecipeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: RecipeFormData) => Promise<void>;
  recipe?: Recipe | null;
}

const INITIAL_FORM_STATE: RecipeFormData = {
  title: '',
  description: '',
  image: '',
  ingredients: [],
  instructions: [],
  categories: [],
  notes: '',
  sourceUrl: '',
  sourceAuthor: '',
  prepTime: '',
  cookTime: '',
  totalTime: '',
  servings: '',
  difficulty: '',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
};

export function RecipeForm({ isOpen, onClose, onSave, recipe }: RecipeFormProps) {
  const [formData, setFormData] = useState<RecipeFormData>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'ingredients' | 'instructions' | 'details'>('basic');

  useEffect(() => {
    if (recipe) {
      setFormData({
        title: recipe.title,
        description: recipe.description || '',
        image: recipe.image || '',
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        categories: recipe.categories,
        notes: recipe.notes || '',
        sourceUrl: recipe.sourceUrl || '',
        sourceAuthor: recipe.sourceAuthor || '',
        prepTime: recipe.prepTime || '',
        cookTime: recipe.cookTime || '',
        totalTime: recipe.totalTime || '',
        servings: recipe.servings || '',
        difficulty: recipe.difficulty || '',
        calories: recipe.calories || 0,
        protein: recipe.protein || 0,
        carbs: recipe.carbs || 0,
        fat: recipe.fat || 0,
        fiber: recipe.fiber || 0,
        sugar: recipe.sugar || 0,
        sodium: recipe.sodium || 0,
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
  }, [recipe, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving recipe:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'ingredients', label: 'Ingredients' },
    { id: 'instructions', label: 'Instructions' },
    { id: 'details', label: 'Details & Nutrition' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">
            {recipe ? 'Edit Recipe' : 'New Recipe'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Icons.X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <ImageUpload
                  image={formData.image}
                  onImageChange={handleImageChange}
                  onRemoveImage={() => setFormData(prev => ({ ...prev, image: '' }))}
                />

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Recipe Title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief description of the recipe"
                    />
                  </div>

                  <DynamicList
                    label="Categories"
                    items={formData.categories}
                    onAdd={(item) => setFormData(prev => ({ ...prev, categories: [...prev.categories, item] }))}
                    onRemove={(index) => setFormData(prev => ({ ...prev, categories: prev.categories.filter((_, i) => i !== index) }))}
                    placeholder="Add category (e.g., Dinner, Italian)"
                  />
                </div>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <DynamicList
                label="Ingredients"
                items={formData.ingredients}
                onAdd={(item) => setFormData(prev => ({ ...prev, ingredients: [...prev.ingredients, item] }))}
                onRemove={(index) => setFormData(prev => ({ ...prev, ingredients: prev.ingredients.filter((_, i) => i !== index) }))}
                placeholder="Add ingredient (e.g., 2 cups flour)"
              />
            )}

            {activeTab === 'instructions' && (
              <DynamicList
                label="Instructions"
                type="textarea"
                items={formData.instructions}
                onAdd={(item) => setFormData(prev => ({ ...prev, instructions: [...prev.instructions, item] }))}
                onRemove={(index) => setFormData(prev => ({ ...prev, instructions: prev.instructions.filter((_, i) => i !== index) }))}
                placeholder="Add instruction step..."
              />
            )}

            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time</label>
                    <input
                      type="text"
                      value={formData.prepTime || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, prepTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="e.g., 15 mins"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cook Time</label>
                    <input
                      type="text"
                      value={formData.cookTime || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, cookTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="e.g., 30 mins"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
                    <input
                      type="text"
                      value={formData.servings || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, servings: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="e.g., 4 people"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                    <select
                      value={formData.difficulty || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select...</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Nutrition (per serving)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { key: 'calories', label: 'Calories' },
                      { key: 'protein', label: 'Protein (g)' },
                      { key: 'carbs', label: 'Carbs (g)' },
                      { key: 'fat', label: 'Fat (g)' },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                        <input
                          type="number"
                          value={formData[key as keyof RecipeFormData] as number || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Source</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Source URL</label>
                      <input
                        type="url"
                        value={formData.sourceUrl || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, sourceUrl: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                      <input
                        type="text"
                        value={formData.sourceAuthor || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, sourceAuthor: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Original author"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Recipe'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
