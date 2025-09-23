import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getListById, updateList, deleteList } from '@/lib/services/lists';
import { HttpStatus } from '@/types/api';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
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

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: { message: 'Invalid list ID format' } },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    const list = await getListById(id, user.id);

    if (!list) {
      return NextResponse.json(
        { error: { message: 'List not found or access denied' } },
        { status: HttpStatus.NOT_FOUND }
      );
    }

    return NextResponse.json(
      { data: list },
      { status: HttpStatus.OK }
    );
  } catch (error) {
    console.error('Error fetching list:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
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

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: { message: 'Invalid list ID format' } },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    const body = await request.json();

    // Validate at least one field is provided
    if (!body.name && body.description === undefined) {
      return NextResponse.json(
        { error: { message: 'At least one field (name or description) must be provided' } },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Validate field types and lengths
    if (body.name !== undefined) {
      if (typeof body.name !== 'string') {
        return NextResponse.json(
          { error: { message: 'Name must be a string' } },
          { status: HttpStatus.BAD_REQUEST }
        );
      }

      if (body.name.length > 100) {
        return NextResponse.json(
          { error: { message: 'Name must be 100 characters or less' } },
          { status: HttpStatus.BAD_REQUEST }
        );
      }
    }

    if (body.description !== undefined) {
      if (body.description !== null && typeof body.description !== 'string') {
        return NextResponse.json(
          { error: { message: 'Description must be a string or null' } },
          { status: HttpStatus.BAD_REQUEST }
        );
      }

      if (body.description && body.description.length > 500) {
        return NextResponse.json(
          { error: { message: 'Description must be 500 characters or less' } },
          { status: HttpStatus.BAD_REQUEST }
        );
      }
    }

    try {
      const updatedList = await updateList(id, user.id, {
        name: body.name?.trim(),
        description: body.description?.trim()
      });

      return NextResponse.json(
        { data: updatedList },
        { status: HttpStatus.OK }
      );
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : 'Unknown error';

      if (errorMessage === 'A list with this name already exists') {
        return NextResponse.json(
          { error: { message: 'A list with this name already exists' } },
          { status: HttpStatus.CONFLICT }
        );
      }

      if (errorMessage.includes('not found') || errorMessage.includes('access denied')) {
        return NextResponse.json(
          { error: { message: 'List not found or access denied' } },
          { status: HttpStatus.NOT_FOUND }
        );
      }

      throw serviceError;
    }
  } catch (error) {
    console.error('Error updating list:', error);
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

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: { message: 'Invalid list ID format' } },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // First check if the list exists and belongs to the user
    const existingList = await getListById(id, user.id);
    if (!existingList) {
      return NextResponse.json(
        { error: { message: 'List not found or access denied' } },
        { status: HttpStatus.NOT_FOUND }
      );
    }

    await deleteList(id, user.id);

    return new NextResponse(null, { status: HttpStatus.NO_CONTENT });
  } catch (error) {
    console.error('Error deleting list:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}