import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { isAdmin } from '@/lib/auth';

// GET /api/recipes/[id] - Get a single recipe (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    );
  }
}

// PUT /api/recipes/[id] - Update a recipe (admins only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!isAdmin(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can update recipes' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const {
      title, description, image, ingredients, instructions, categories, notes, rating,
      sourceUrl, sourceAuthor, prepTime, cookTime, totalTime, servings, difficulty,
      calories, protein, carbs, fat, fiber, sugar, sodium
    } = body;

    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        title,
        description: description || null,
        image: image || null,
        ingredients: ingredients || [],
        instructions: instructions || [],
        categories: categories || [],
        notes: notes || null,
        rating: rating || null,
        sourceUrl: sourceUrl || null,
        sourceAuthor: sourceAuthor || null,
        prepTime: prepTime || null,
        cookTime: cookTime || null,
        totalTime: totalTime || null,
        servings: servings || null,
        difficulty: difficulty || null,
        calories: calories || null,
        protein: protein || null,
        carbs: carbs || null,
        fat: fat || null,
        fiber: fiber || null,
        sugar: sugar || null,
        sodium: sodium || null,
      },
    });

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to update recipe' },
      { status: 500 }
    );
  }
}

// DELETE /api/recipes/[id] - Delete a recipe (admins only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!isAdmin(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can delete recipes' },
        { status: 403 }
      );
    }

    const { id } = await params;
    await prisma.recipe.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    );
  }
}
