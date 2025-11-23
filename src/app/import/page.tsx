'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecipeFormData } from '@/types/recipe';

interface ScrapedRecipe {
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  categories: string[];
  notes?: string;
  image?: string;
  images: string[];
}

export default function ImportRecipe() {
  const router = useRouter();
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [scrapedData, setScrapedData] = useState<ScrapedRecipe | null>(null);
  const [formData, setFormData] = useState<RecipeFormData>({
    title: '',
    description: '',
    image: '',
    ingredients: [],
    instructions: [],
    categories: [],
    notes: '',
  });
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [currentInstruction, setCurrentInstruction] = useState('');
  const [currentCategory, setCurrentCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [imageObjectFit, setImageObjectFit] = useState<'cover' | 'contain' | 'fill'>('cover');

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to scrape recipe');
      }

      const data: ScrapedRecipe = await response.json();
      console.log('Scraped data received:', data);
      console.log('Images found:', data.images?.length || 0);
      if (data.images && data.images.length > 0) {
        console.log('First 3 images:', data.images.slice(0, 3));
      }
      setScrapedData(data);
      setFormData({
        title: data.title,
        description: data.description || '',
        image: data.image || '',
        ingredients: data.ingredients,
        instructions: data.instructions,
        categories: data.categories || [],
        notes: data.notes || '',
      });
      setStep('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scrape recipe');
    } finally {
      setIsLoading(false);
    }
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

  const handleSave = async () => {
    setIsSaving(true);
    setError('');

    try {
      let finalImageUrl = formData.image;

      // If there's an image URL, download it and upload to Azure Blob Storage
      if (formData.image && formData.image.trim()) {
        console.log('Downloading and uploading image to Azure...');
        try {
          const imageResponse = await fetch('/api/download-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: formData.image }),
          });

          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            finalImageUrl = imageData.url;
            console.log('Image uploaded to Azure:', finalImageUrl);
          } else {
            console.warn('Failed to upload image to Azure, using original URL');
            // Continue with original URL if upload fails
          }
        } catch (imageError) {
          console.warn('Error uploading image to Azure:', imageError);
          // Continue with original URL if upload fails
        }
      }

      // Save the recipe with the final image URL
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          image: finalImageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save recipe');
      }

      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recipe');
    } finally {
      setIsSaving(false);
    }
  };

  if (step === 'input') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-3xl mx-auto px-4 py-12">
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
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Import Recipe from URL
            </h1>
            <p className="text-gray-600 mt-2">
              Paste a recipe URL and we'll extract the ingredients, instructions, and images for you.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-8">
            <form onSubmit={handleScrape} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent !text-gray-900 placeholder:text-gray-400"
                  placeholder="https://example.com/recipe"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  Enter the URL of a recipe from any website
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Scraping recipe...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Import Recipe
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Review step
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <button
            onClick={() => setStep('input')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to URL
          </button>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            Review &amp; Edit Recipe
          </h1>
          <p className="text-gray-600 mt-2">
            Review the imported recipe and make any necessary edits before saving.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent !text-gray-900 placeholder:text-gray-400"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent !text-gray-900 placeholder:text-gray-400"
              rows={3}
            />
          </div>

          {/* Image Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipe Image
            </label>

            {/* Manual Image URL Input */}
            <div className="mb-4">
              <input
                type="url"
                value={formData.image || ''}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent !text-gray-900 placeholder:text-gray-400"
                placeholder="Enter image URL or select from images below"
              />
            </div>

            {/* Current/Selected Image Preview */}
            {formData.image && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-600">Current Image:</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setImageObjectFit('cover')}
                      className={`px-3 py-1 text-xs rounded ${
                        imageObjectFit === 'cover'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      title="Crop to fill (may cut edges)"
                    >
                      Fill
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageObjectFit('contain')}
                      className={`px-3 py-1 text-xs rounded ${
                        imageObjectFit === 'contain'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      title="Show entire image"
                    >
                      Fit
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageObjectFit('fill')}
                      className={`px-3 py-1 text-xs rounded ${
                        imageObjectFit === 'fill'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      title="Stretch to fill"
                    >
                      Stretch
                    </button>
                  </div>
                </div>
                <div className={`relative w-full h-64 rounded-lg overflow-hidden border border-gray-300 ${
                  imageObjectFit === 'contain' ? 'bg-gray-100' : ''
                }`}>
                  <img
                    src={formData.image}
                    alt="Selected recipe"
                    className={`w-full h-full object-${imageObjectFit}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '';
                      (e.target as HTMLImageElement).alt = 'Failed to load image';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Image Selection Grid */}
            {scrapedData && scrapedData.images && scrapedData.images.length > 0 ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Or select from {scrapedData.images.length} image{scrapedData.images.length !== 1 ? 's' : ''} found on the page:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {scrapedData.images.slice(0, 12).map((img, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData({ ...formData, image: img })}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        formData.image === img
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Option ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      {formData.image === img && (
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No images found on the page. You can paste an image URL above.
              </p>
            )}
          </div>

          {/* Categories */}
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
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent !text-gray-900 placeholder:text-gray-400"
                placeholder="Add category"
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

          {/* Ingredients */}
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
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent !text-gray-900 placeholder:text-gray-400"
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
                  <div className="flex-1 text-sm p-3 bg-gray-50 rounded-lg text-gray-900">
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

          {/* Instructions */}
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
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent !text-gray-900 placeholder:text-gray-400"
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
                  <div className="flex-1 text-sm p-3 bg-gray-50 rounded-lg text-gray-900">
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

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent !text-gray-900 placeholder:text-gray-400"
              rows={3}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!formData.title.trim() || isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Recipe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
