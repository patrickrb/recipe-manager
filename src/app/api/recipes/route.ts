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
    const {
      title, description, image, ingredients, instructions, categories, notes,
      sourceUrl, sourceAuthor, prepTime, cookTime, totalTime, servings, difficulty,
      calories, protein, carbs, fat, fiber, sugar, sodium
    } = body;

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
        image: image || null,
        ingredients: ingredients || [],
        instructions: instructions || [],
        categories: categories || [],
        notes: notes || null,
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

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    );
  }
}
