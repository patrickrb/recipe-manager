import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

interface ScrapedRecipe {
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  categories: string[];
  notes?: string;
  image?: string;
  images: string[]; // All images found on the page
}

function extractRecipeSchema($: cheerio.CheerioAPI): Partial<ScrapedRecipe> | null {
  // Look for JSON-LD Recipe schema
  const jsonLdScripts = $('script[type="application/ld+json"]');

  for (let i = 0; i < jsonLdScripts.length; i++) {
    try {
      const content = $(jsonLdScripts[i]).html();
      if (!content) continue;

      const data = JSON.parse(content);
      const recipe = Array.isArray(data)
        ? data.find((item: any) => item['@type'] === 'Recipe')
        : data['@type'] === 'Recipe' ? data : null;

      if (recipe) {
        // Extract categories from recipeCategory or keywords
        let categories: string[] = [];
        if (recipe.recipeCategory) {
          if (typeof recipe.recipeCategory === 'string') {
            categories = [recipe.recipeCategory];
          } else if (Array.isArray(recipe.recipeCategory)) {
            categories = recipe.recipeCategory;
          }
        }
        if (recipe.keywords) {
          const keywords = typeof recipe.keywords === 'string'
            ? recipe.keywords.split(',').map((k: string) => k.trim())
            : Array.isArray(recipe.keywords) ? recipe.keywords : [];
          categories = [...categories, ...keywords];
        }

        // Get primary image
        let primaryImage = '';
        if (recipe.image) {
          if (typeof recipe.image === 'string') {
            primaryImage = recipe.image;
          } else if (recipe.image.url) {
            primaryImage = recipe.image.url;
          } else if (Array.isArray(recipe.image)) {
            primaryImage = recipe.image[0]?.url || recipe.image[0] || '';
          }
        }

        return {
          title: recipe.name || '',
          description: recipe.description || '',
          ingredients: Array.isArray(recipe.recipeIngredient)
            ? recipe.recipeIngredient
            : typeof recipe.recipeIngredient === 'string'
            ? [recipe.recipeIngredient]
            : [],
          instructions: extractInstructions(recipe),
          categories: categories.filter(Boolean).slice(0, 5), // Limit to 5 categories
          image: primaryImage,
        };
      }
    } catch (e) {
      // Continue to next script tag
    }
  }

  return null;
}

function extractInstructions(recipe: any): string[] {
  if (!recipe.recipeInstructions) return [];

  if (Array.isArray(recipe.recipeInstructions)) {
    return recipe.recipeInstructions.map((instruction: any) => {
      if (typeof instruction === 'string') return instruction;
      if (instruction.text) return instruction.text;
      if (instruction.name) return instruction.name;
      return '';
    }).filter(Boolean);
  }

  if (typeof recipe.recipeInstructions === 'string') {
    return [recipe.recipeInstructions];
  }

  return [];
}

function extractRecipeFromHTML($: cheerio.CheerioAPI): Partial<ScrapedRecipe> {
  const result: Partial<ScrapedRecipe> = {
    ingredients: [],
    instructions: [],
    categories: [],
  };

  // Try to find title
  result.title = $('h1').first().text().trim() ||
                 $('title').text().trim() ||
                 '';

  // Try to find description
  result.description = $('meta[name="description"]').attr('content') ||
                       $('meta[property="og:description"]').attr('content') ||
                       $('p').first().text().trim();

  // Try to extract categories from meta tags and content
  const categories = new Set<string>();

  // Check article tags
  $('meta[property="article:tag"]').each((_, el) => {
    const tag = $(el).attr('content');
    if (tag) categories.add(tag);
  });

  // Check keywords
  const keywords = $('meta[name="keywords"]').attr('content');
  if (keywords) {
    keywords.split(',').forEach(k => {
      const trimmed = k.trim();
      if (trimmed && trimmed.length < 30) categories.add(trimmed);
    });
  }

  // Common category/tag selectors
  $('.recipe-category, .category, .tag, [rel="category tag"]').each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length < 30) categories.add(text);
  });

  result.categories = Array.from(categories).slice(0, 5);

  // Try to find ingredients - look for common selectors
  const ingredientSelectors = [
    '.ingredient',
    '.recipe-ingredient',
    '[itemprop="recipeIngredient"]',
    '.ingredients li',
    '.ingredient-list li',
  ];

  for (const selector of ingredientSelectors) {
    const items = $(selector);
    if (items.length > 0) {
      items.each((_, el) => {
        const text = $(el).text().trim();
        if (text) result.ingredients?.push(text);
      });
      if (result.ingredients && result.ingredients.length > 0) break;
    }
  }

  // Try to find instructions
  const instructionSelectors = [
    '.instruction',
    '.recipe-instruction',
    '[itemprop="recipeInstructions"]',
    '.instructions li',
    '.instruction-list li',
    '.steps li',
    '.directions li',
  ];

  for (const selector of instructionSelectors) {
    const items = $(selector);
    if (items.length > 0) {
      items.each((_, el) => {
        const text = $(el).text().trim();
        if (text) result.instructions?.push(text);
      });
      if (result.instructions && result.instructions.length > 0) break;
    }
  }

  // If instructions are in paragraphs
  if (result.instructions?.length === 0) {
    const instructionText = $('[itemprop="recipeInstructions"]').text().trim();
    if (instructionText) {
      // Split by numbers or periods
      result.instructions = instructionText
        .split(/\d+\.|Step \d+/i)
        .map(s => s.trim())
        .filter(s => s.length > 10);
    }
  }

  return result;
}

function extractAllImages($: cheerio.CheerioAPI, baseUrl: string): string[] {
  const priorityImages: string[] = [];
  const regularImages = new Set<string>();

  console.log('Extracting images from base URL:', baseUrl);

  // Priority 1: Open Graph image
  const ogImage = $('meta[property="og:image"]').attr('content');
  if (ogImage) {
    try {
      const url = new URL(ogImage, baseUrl).href;
      priorityImages.push(url);
      console.log('Found OG image:', url);
    } catch (e) {
      console.log('Failed to parse OG image URL:', ogImage);
    }
  }

  // Priority 2: Twitter card image
  const twitterImage = $('meta[name="twitter:image"]').attr('content');
  if (twitterImage && twitterImage !== ogImage) {
    try {
      const url = new URL(twitterImage, baseUrl).href;
      priorityImages.push(url);
      console.log('Found Twitter image:', url);
    } catch (e) {
      console.log('Failed to parse Twitter image URL:', twitterImage);
    }
  }

  // Get all images from the page
  $('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src');
    if (src) {
      try {
        // Convert relative URLs to absolute
        const absoluteUrl = new URL(src, baseUrl).href;

        // Skip data URLs and very small images
        if (src.startsWith('data:')) return;

        // Get dimensions if available
        const width = parseInt($(el).attr('width') || '0');
        const height = parseInt($(el).attr('height') || '0');

        // Skip only very small images (less than 50px)
        if ((width > 0 && width < 50) || (height > 0 && height < 50)) {
          return;
        }

        // Skip common icon/logo/sprite patterns in URL
        const lowerSrc = src.toLowerCase();
        if (
          lowerSrc.includes('logo') ||
          lowerSrc.includes('icon') ||
          lowerSrc.includes('sprite') ||
          lowerSrc.includes('avatar') ||
          lowerSrc.includes('badge') ||
          lowerSrc.includes('btn') ||
          lowerSrc.includes('button')
        ) {
          return;
        }

        regularImages.add(absoluteUrl);
      } catch (e) {
        // Skip invalid URLs
      }
    }
  });

  // Combine priority images with regular images, removing duplicates
  const allImages = [...priorityImages];
  for (const img of regularImages) {
    if (!allImages.includes(img)) {
      allImages.push(img);
    }
  }

  console.log(`Total images found: ${allImages.length} (${priorityImages.length} priority + ${regularImages.size} regular)`);

  return allImages;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      );
    }

    // Fetch the page with more complete headers to avoid being blocked
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    let response;
    try {
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        signal: controller.signal,
      });
    } catch (error: any) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout - the website took too long to respond' },
          { status: 408 }
        );
      }
      return NextResponse.json(
        { error: `Failed to fetch URL: ${error.message}` },
        { status: 500 }
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.statusText}` },
        { status: response.status }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract all images first
    const images = extractAllImages($, parsedUrl.origin);
    console.log(`Extracted ${images.length} images from ${url}`);
    if (images.length > 0) {
      console.log('First 3 images:', images.slice(0, 3));
    }

    // Try to extract recipe from JSON-LD schema first
    let scrapedData = extractRecipeSchema($);
    console.log('Schema extraction result:', scrapedData ? 'Found' : 'Not found');

    // If no schema found, try HTML parsing
    if (!scrapedData || !scrapedData.title) {
      scrapedData = extractRecipeFromHTML($);
      console.log('HTML parsing used');
    }

    // Combine the results
    const result: ScrapedRecipe = {
      title: scrapedData.title || '',
      description: scrapedData.description || '',
      ingredients: scrapedData.ingredients || [],
      instructions: scrapedData.instructions || [],
      categories: scrapedData.categories || [],
      notes: scrapedData.notes || '',
      image: scrapedData.image || images[0] || '',
      images,
    };

    console.log(`Final result: ${result.ingredients.length} ingredients, ${result.instructions.length} instructions, ${result.categories.length} categories, ${result.images.length} images`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error scraping recipe:', error);
    return NextResponse.json(
      { error: 'Failed to scrape recipe' },
      { status: 500 }
    );
  }
}
