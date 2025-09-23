import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { addItemToList, removeItemFromList } from '@/lib/services/lists';
import { getMagicItemBySlug } from '@/lib/services/magic-items';
import { HttpStatus } from '@/types/api';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { message: 'Authentication required' } },
        { status: HttpStatus.UNAUTHORIZED }
      );
    }

    const { id } = await context.params;

    // Validate UUID format for list ID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: { message: 'Invalid list ID format' } },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.magicItemId || typeof body.magicItemId !== 'string') {
      return NextResponse.json(
        { error: { message: 'magicItemId is required and must be a string' } },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Validate that the magic item exists
    const magicItem = await getMagicItemBySlug(body.magicItemId);
    if (!magicItem) {
      return NextResponse.json(
        { error: { message: 'Magic item not found' } },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    try {
      const listItem = await addItemToList(id, user.id, {
        magicItemId: body.magicItemId
      });

      return NextResponse.json(
        { data: listItem },
        { status: HttpStatus.CREATED }
      );
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : 'Unknown error';

      if (errorMessage === 'List not found or access denied') {
        return NextResponse.json(
          { error: { message: 'List not found or access denied' } },
          { status: HttpStatus.NOT_FOUND }
        );
      }

      if (errorMessage === 'Item already in list') {
        return NextResponse.json(
          { error: { message: 'Item is already in this list' } },
          { status: HttpStatus.CONFLICT }
        );
      }

      throw serviceError;
    }
  } catch (error) {
    console.error('Error adding item to list:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { message: 'Authentication required' } },
        { status: HttpStatus.UNAUTHORIZED }
      );
    }

    const { id } = await context.params;

    // Validate UUID format for list ID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: { message: 'Invalid list ID format' } },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    const { searchParams } = new URL(request.url);
    const magicItemId = searchParams.get('magicItemId');

    // Validate required query parameter
    if (!magicItemId || typeof magicItemId !== 'string') {
      return NextResponse.json(
        { error: { message: 'magicItemId query parameter is required' } },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    try {
      await removeItemFromList(id, user.id, magicItemId);

      return new NextResponse(null, { status: HttpStatus.NO_CONTENT });
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : 'Unknown error';

      if (errorMessage === 'List not found or access denied') {
        return NextResponse.json(
          { error: { message: 'List not found or access denied' } },
          { status: HttpStatus.NOT_FOUND }
        );
      }

      // If the item wasn't found in the list, we can consider it a successful removal
      // since the desired state (item not in list) is achieved
      if (errorMessage.includes('not found')) {
        return new NextResponse(null, { status: HttpStatus.NO_CONTENT });
      }

      throw serviceError;
    }
  } catch (error) {
    console.error('Error removing item from list:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}