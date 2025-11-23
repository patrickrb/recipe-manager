import { NextRequest, NextResponse } from 'next/server';
import { BlobServiceClient, StorageSharedKeyCredential, BlobSASPermissions, generateBlobSASQueryParameters } from '@azure/storage-blob';

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const accountKey = process.env.AZURE_STORAGE_ACCESS_KEY!;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'recipe-images';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    console.log('Downloading image from:', imageUrl);

    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error('Failed to download image:', imageResponse.statusText);
      return NextResponse.json(
        { error: 'Failed to download image from URL' },
        { status: 400 }
      );
    }

    // Get content type
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // Validate it's an image
    if (!contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'URL does not point to an image' },
        { status: 400 }
      );
    }

    // Convert to buffer
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (buffer.length > maxSize) {
      return NextResponse.json(
        { error: 'Image size must be less than 10MB' },
        { status: 400 }
      );
    }

    console.log(`Image downloaded: ${buffer.length} bytes, type: ${contentType}`);

    // Create blob service client
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      sharedKeyCredential
    );

    // Get container client
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Create container if it doesn't exist
    await containerClient.createIfNotExists();

    // Generate unique blob name
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = contentType.split('/')[1]?.split(';')[0] || 'jpg';
    const blobName = `imported-${timestamp}-${randomString}.${extension}`;

    console.log('Uploading to Azure Blob Storage as:', blobName);

    // Get blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload to Azure
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: contentType,
      },
    });

    // Generate SAS token (valid for 10 years)
    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse('r'),
        startsOn: new Date(),
        expiresOn: new Date(new Date().valueOf() + 1000 * 60 * 60 * 24 * 365 * 10),
      },
      sharedKeyCredential
    ).toString();

    // Return the blob URL with SAS token
    const azureImageUrl = `${blockBlobClient.url}?${sasToken}`;
    console.log('Image uploaded successfully to Azure');

    return NextResponse.json({ url: azureImageUrl }, { status: 200 });
  } catch (error) {
    console.error('Error downloading and uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
