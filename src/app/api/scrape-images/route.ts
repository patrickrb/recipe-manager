import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch URL' },
        { status: 400 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Collect all image URLs
    const images: Array<{ url: string; alt: string | null }> = [];
    const seenUrls = new Set<string>();

    // Find all img tags
    $('img').each((_, element) => {
      const src = $(element).attr('src');
      const alt = $(element).attr('alt') || null;

      if (src) {
        // Convert relative URLs to absolute
        let imageUrl: string;
        try {
          imageUrl = new URL(src, url).href;
        } catch {
          return; // Skip invalid URLs
        }

        // Filter out common non-recipe images
        const lowerUrl = imageUrl.toLowerCase();
        const lowerAlt = (alt || '').toLowerCase();

        // Skip if it's likely not a recipe image
        if (
          lowerUrl.includes('logo') ||
          lowerUrl.includes('icon') ||
          lowerUrl.includes('button') ||
          lowerUrl.includes('banner') ||
          lowerUrl.includes('ad') ||
          lowerUrl.includes('tracking') ||
          lowerUrl.includes('pixel') ||
          lowerAlt.includes('logo') ||
          lowerAlt.includes('icon')
        ) {
          return; // Skip this image
        }

        // Skip very small images (likely icons/buttons)
        const width = $(element).attr('width');
        const height = $(element).attr('height');
        if (width && height) {
          const w = parseInt(width);
          const h = parseInt(height);
          if (w < 100 || h < 100) {
            return; // Skip small images
          }
        }

        // Only add unique URLs
        if (!seenUrls.has(imageUrl)) {
          seenUrls.add(imageUrl);
          images.push({ url: imageUrl, alt });
        }
      }
    });

    // Also check for Open Graph images
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage) {
      try {
        const ogImageUrl = new URL(ogImage, url).href;
        if (!seenUrls.has(ogImageUrl)) {
          seenUrls.add(ogImageUrl);
          images.unshift({ url: ogImageUrl, alt: 'Open Graph Image' });
        }
      } catch {
        // Ignore invalid OG image URL
      }
    }

    // Check for Twitter card images
    const twitterImage = $('meta[name="twitter:image"]').attr('content');
    if (twitterImage) {
      try {
        const twitterImageUrl = new URL(twitterImage, url).href;
        if (!seenUrls.has(twitterImageUrl)) {
          seenUrls.add(twitterImageUrl);
          images.unshift({ url: twitterImageUrl, alt: 'Twitter Card Image' });
        }
      } catch {
        // Ignore invalid Twitter image URL
      }
    }

    return NextResponse.json({ images }, { status: 200 });
  } catch (error) {
    console.error('Error scraping images:', error);
    return NextResponse.json(
      { error: 'Failed to scrape images' },
      { status: 500 }
    );
  }
}
