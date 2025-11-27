import { NextRequest, NextResponse } from 'next/server';
import { BlobServiceClient, StorageSharedKeyCredential, BlobSASPermissions, generateBlobSASQueryParameters } from '@azure/storage-blob';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const accountKey = process.env.AZURE_STORAGE_ACCESS_KEY!;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'recipe-images';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin or super admin
    await requireAdmin();

    const { id } = await params;
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Fetch the image from the URL
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch image from URL' },
        { status: 400 }
      );
    }

    const contentType = imageResponse.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'URL does not point to a valid image' },
        { status: 400 }
      );
    }

    // Get the image data
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // Validate file size (max 10MB for scraped images)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (imageBuffer.length > maxSize) {
      return NextResponse.json(
        { error: 'Image size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Create blob service client
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      sharedKeyCredential
    );

    // Get container client
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Create container if it doesn't exist (private access)
    await containerClient.createIfNotExists();

    // Generate unique blob name
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = contentType.split('/')[1] || 'jpg';
    const blobName = `${timestamp}-${randomString}.${fileExtension}`;

    // Get blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload file
    await blockBlobClient.uploadData(imageBuffer, {
      blobHTTPHeaders: {
        blobContentType: contentType,
      },
    });

    // Generate SAS token for the blob (valid for 10 years)
    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse('r'), // Read permission
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + 1000 * 60 * 60 * 24 * 365 * 10), // 10 years
      },
      sharedKeyCredential
    ).toString();

    // Get the blob URL with SAS token
    const savedImageUrl = `${blockBlobClient.url}?${sasToken}`;

    // Update the recipe with the new image URL
    const recipe = await prisma.recipe.update({
      where: { id },
      data: { image: savedImageUrl },
    });

    return NextResponse.json({ recipe }, { status: 200 });
  } catch (error) {
    console.error('Error saving image:', error);
    return NextResponse.json(
      { error: 'Failed to save image' },
      { status: 500 }
    );
  }
}
