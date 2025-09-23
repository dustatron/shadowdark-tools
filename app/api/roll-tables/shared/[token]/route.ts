import { NextRequest, NextResponse } from 'next/server';
import { getRollTableByShareToken } from '@/lib/services/roll-tables';
import { HttpStatus } from '@/types/api';

// Define props interface for Next.js 15 async params
interface RouteProps {
  params: Promise<{ token: string }>;
}

// GET /api/roll-tables/shared/[token] - Get shared roll table (public endpoint)
export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const { token } = await params;

    // Validate token parameter
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Valid share token is required'
        },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Get roll table by share token (public access)
    const rollTable = await getRollTableByShareToken(token.trim());

    if (!rollTable) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Roll table not found'
        },
        { status: HttpStatus.NOT_FOUND }
      );
    }

    return NextResponse.json(
      { data: rollTable },
      { status: HttpStatus.OK }
    );
  } catch (error) {
    console.error('Error fetching shared roll table:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch shared roll table'
      },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}