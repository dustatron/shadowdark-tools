import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserLists, createList } from '@/lib/services/lists';
import { HttpStatus } from '@/types/api';

export async function GET() {
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

    const lists = await getUserLists(user.id);

    return NextResponse.json(
      { data: lists },
      { status: HttpStatus.OK }
    );
  } catch (error) {
    console.error('Error fetching user lists:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        { error: { message: 'Name is required and must be a string' } },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Validate field lengths
    if (body.name.length > 100) {
      return NextResponse.json(
        { error: { message: 'Name must be 100 characters or less' } },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    if (body.description && typeof body.description !== 'string') {
      return NextResponse.json(
        { error: { message: 'Description must be a string' } },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    if (body.description && body.description.length > 500) {
      return NextResponse.json(
        { error: { message: 'Description must be 500 characters or less' } },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    try {
      const list = await createList(user.id, {
        name: body.name.trim(),
        description: body.description?.trim()
      });

      return NextResponse.json(
        { data: list },
        { status: HttpStatus.CREATED }
      );
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : 'Unknown error';

      if (errorMessage === 'Max allowed is 100') {
        return NextResponse.json(
          { error: { message: 'Max allowed is 100' } },
          { status: HttpStatus.CONFLICT }
        );
      }

      if (errorMessage === 'A list with this name already exists') {
        return NextResponse.json(
          { error: { message: 'A list with this name already exists' } },
          { status: HttpStatus.CONFLICT }
        );
      }

      throw serviceError;
    }
  } catch (error) {
    console.error('Error creating list:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}