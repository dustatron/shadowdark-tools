import { NextRequest, NextResponse } from 'next/server';
import { getMagicItemBySlug } from '@/lib/services/magic-items';
import { HttpStatus } from '@/types/api';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = context.params;

    // Validate ID parameter
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return NextResponse.json(
        { error: { message: 'Invalid or missing magic item ID' } },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Get magic item by slug
    const magicItem = await getMagicItemBySlug(id);

    if (!magicItem) {
      return NextResponse.json(
        { error: { message: 'Magic item not found' } },
        { status: HttpStatus.NOT_FOUND }
      );
    }

    return NextResponse.json(
      { data: magicItem },
      { status: HttpStatus.OK }
    );
  } catch (error) {
    console.error('Error fetching magic item:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}