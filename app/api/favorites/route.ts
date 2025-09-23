import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserFavoritesWithItems, addToFavorites, removeFromFavorites } from '@/lib/services/favorites';
import { getMagicItemBySlug } from '@/lib/services/magic-items';
import { HttpStatus } from '@/types/api';

// GET /api/favorites - Get user's favorites
export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: HttpStatus.UNAUTHORIZED }
      );
    }

    // Get user's favorites with magic item details
    const favorites = await getUserFavoritesWithItems(user.id);

    return NextResponse.json(
      { data: favorites },
      { status: HttpStatus.OK }
    );
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch favorites'
      },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}

// POST /api/favorites - Add to favorites
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: HttpStatus.UNAUTHORIZED }
      );
    }

    // Parse request body
    const body = await request.json();
    const { magicItemId } = body;

    // Validate input
    if (!magicItemId || typeof magicItemId !== 'string') {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'magicItemId is required and must be a string'
        },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Verify magic item exists
    const magicItem = await getMagicItemBySlug(magicItemId);
    if (!magicItem) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Magic item not found'
        },
        { status: HttpStatus.NOT_FOUND }
      );
    }

    // Add to favorites
    try {
      const favorite = await addToFavorites(user.id, magicItemId);

      return NextResponse.json(
        { data: favorite },
        { status: HttpStatus.CREATED }
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes('already favorited')) {
        return NextResponse.json(
          {
            error: 'Conflict',
            message: 'Item already favorited'
          },
          { status: HttpStatus.CONFLICT }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to add to favorites'
      },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}

// DELETE /api/favorites - Remove from favorites
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: HttpStatus.UNAUTHORIZED }
      );
    }

    // Get magicItemId from query parameters
    const { searchParams } = new URL(request.url);
    const magicItemId = searchParams.get('magicItemId');

    // Validate input
    if (!magicItemId) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'magicItemId query parameter is required'
        },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Remove from favorites
    await removeFromFavorites(user.id, magicItemId);

    return NextResponse.json(
      null,
      { status: HttpStatus.NO_CONTENT }
    );
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to remove from favorites'
      },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}