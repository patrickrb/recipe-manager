import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/recipes - List all recipes
export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
    });
    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

// POST /api/recipes - Create a new recipe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, ingredients, instructions, categories, notes } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const recipe = await prisma.recipe.create({
      data: {
        title,
        description: description || null,
        ingredients: ingredients || [],
        instructions: instructions || [],
        categories: categories || [],
        notes: notes || null,
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    );
  }
}
