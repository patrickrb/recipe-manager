'use client';

import { useState, useEffect } from 'react';
import { Recipe, RecipeFormData } from '@/types/recipe';
import { useToast } from '@/contexts/ToastContext';

interface RecipeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: RecipeFormData) => Promise<void>;
  recipe?: Recipe | null;
}

export function RecipeForm({ isOpen, onClose, onSave, recipe }: RecipeFormProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<RecipeFormData>({
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
    calories: undefined,
    protein: undefined,
    carbs: undefined,
    fat: undefined,
    fiber: undefined,
    sugar: undefined,
    sodium: undefined,
  });
  
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [currentInstruction, setCurrentInstruction] = useState('');
  const [currentCategory, setCurrentCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

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
        calories: recipe.calories || undefined,
        protein: recipe.protein || undefined,
        carbs: recipe.carbs || undefined,
        fat: recipe.fat || undefined,
        fiber: recipe.fiber || undefined,
        sugar: recipe.sugar || undefined,
        sodium: recipe.sodium || undefined,
      });
      setImagePreview(recipe.image || '');
      setImageFile(null);
    } else {
      setFormData({
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
        calories: undefined,
        protein: undefined,
        carbs: undefined,
        fat: undefined,
        fiber: undefined,
        sugar: undefined,
        sodium: undefined,
      });
      setImagePreview('');
      setImageFile(null);
    }
  }, [recipe, isOpen]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be less than 5MB', 'error');
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, image: data.url }));
      setImageFile(null);
    } catch (error) {
      console.error('Error uploading image:', error);
      showToast('Failed to upload image. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleAddItem = (
    value: string,
    setter: (value: string) => void,
    field: 'ingredients' | 'instructions' | 'categories'
  ) => {
    if (value.trim()) {
      setFormData({
        ...formData,
        [field]: [...formData[field], value.trim()],
      });
      setter('');
    }
  };

  const handleRemoveItem = (
    index: number,
    field: 'ingredients' | 'instructions' | 'categories'
  ) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Upload image if there's a file that hasn't been uploaded yet
      let imageUrl = formData.image;
      if (imageFile && !formData.image) {
        setIsUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', imageFile);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (response.ok) {
          const data = await response.json();
          imageUrl = data.url;
        }
        setIsUploading(false);
      }

      await onSave({ ...formData, image: imageUrl });
      onClose();
    } catch (error) {
      console.error('Error saving recipe:', error);
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {recipe ? 'Edit Recipe' : 'Create New Recipe'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Recipe name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Brief description of the recipe"
              rows={3}
            />
          </div>

          {/* Recipe Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prep Time
              </label>
              <input
                type="text"
                value={formData.prepTime}
                onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="e.g., 15 min"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cook Time
              </label>
              <input
                type="text"
                value={formData.cookTime}
                onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="e.g., 30 min"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Time
              </label>
              <input
                type="text"
                value={formData.totalTime}
                onChange={(e) => setFormData({ ...formData, totalTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="e.g., 45 min"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Servings
              </label>
              <input
                type="text"
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="e.g., 4 servings"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="">Select difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipe Image
            </label>

            {imagePreview ? (
              <div className="space-y-3">
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300">
                  <img
                    src={imagePreview}
                    alt="Recipe preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                  >
                    Remove Image
                  </button>
                  {imageFile && !formData.image && (
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      disabled={isUploading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      {isUploading ? 'Uploading...' : 'Upload Image'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentCategory}
                onChange={(e) => setCurrentCategory(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddItem(currentCategory, setCurrentCategory, 'categories');
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Add category (e.g., Dinner, Dessert)"
              />
              <button
                type="button"
                onClick={() => handleAddItem(currentCategory, setCurrentCategory, 'categories')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <div className="flex gap-2 flex-wrap mt-2">
              {formData.categories.map((category, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2"
                >
                  {category}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index, 'categories')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ingredients
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentIngredient}
                onChange={(e) => setCurrentIngredient(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddItem(currentIngredient, setCurrentIngredient, 'ingredients');
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Add ingredient"
              />
              <button
                type="button"
                onClick={() => handleAddItem(currentIngredient, setCurrentIngredient, 'ingredients')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <div className="space-y-2 mt-2">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <div className="flex-1 text-sm p-3 bg-gray-50 rounded-lg">
                    {index + 1}. {ingredient}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index, 'ingredients')}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions
            </label>
            <div className="flex gap-2 items-start">
              <textarea
                value={currentInstruction}
                onChange={(e) => setCurrentInstruction(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    handleAddItem(currentInstruction, setCurrentInstruction, 'instructions');
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Add instruction step (Ctrl+Enter to add)"
                rows={2}
              />
              <button
                type="button"
                onClick={() => handleAddItem(currentInstruction, setCurrentInstruction, 'instructions')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <div className="space-y-2 mt-2">
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1 text-sm p-3 bg-gray-50 rounded-lg">
                    <strong>Step {index + 1}:</strong> {instruction}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index, 'instructions')}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Additional notes or tips"
              rows={3}
            />
          </div>

          {/* Nutrition Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Nutrition Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calories
                </label>
                <input
                  type="number"
                  value={formData.calories || ''}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="kcal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Protein (g)
                </label>
                <input
                  type="number"
                  value={formData.protein || ''}
                  onChange={(e) => setFormData({ ...formData, protein: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="grams"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  value={formData.carbs || ''}
                  onChange={(e) => setFormData({ ...formData, carbs: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="grams"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fat (g)
                </label>
                <input
                  type="number"
                  value={formData.fat || ''}
                  onChange={(e) => setFormData({ ...formData, fat: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="grams"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fiber (g)
                </label>
                <input
                  type="number"
                  value={formData.fiber || ''}
                  onChange={(e) => setFormData({ ...formData, fiber: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="grams"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sugar (g)
                </label>
                <input
                  type="number"
                  value={formData.sugar || ''}
                  onChange={(e) => setFormData({ ...formData, sugar: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="grams"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sodium (mg)
                </label>
                <input
                  type="number"
                  value={formData.sodium || ''}
                  onChange={(e) => setFormData({ ...formData, sodium: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="milligrams"
                />
              </div>
            </div>
          </div>

          {/* Source Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Source Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source URL
                </label>
                <input
                  type="url"
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="https://example.com/recipe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source Author
                </label>
                <input
                  type="text"
                  value={formData.sourceAuthor}
                  onChange={(e) => setFormData({ ...formData, sourceAuthor: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Author or website name"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim() || isLoading || isUploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : isLoading ? 'Saving...' : recipe ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
