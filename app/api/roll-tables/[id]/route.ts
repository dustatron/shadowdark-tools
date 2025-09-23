import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getRollTableById, updateRollTable, deleteRollTable } from '@/lib/services/roll-tables';
import { UpdateRollTableRequest, RollTableData } from '@/types/tables';
import { HttpStatus } from '@/types/api';

// Define props interface for Next.js 15 async params
interface RouteProps {
  params: Promise<{ id: string }>;
}

// GET /api/roll-tables/[id] - Get specific roll table
export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check if accessing via share token (public access)
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (token) {
      // Public access via share token - handled by shared endpoint
      // This endpoint requires authentication, redirect to shared endpoint logic
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Use /api/roll-tables/shared/{token} for public access'
        },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required'
        },
        { status: HttpStatus.UNAUTHORIZED }
      );
    }

    // Get roll table with user permission check
    const rollTable = await getRollTableById(id, user.id);

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
    console.error('Error fetching roll table:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch roll table'
      },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}

// PUT /api/roll-tables/[id] - Update roll table
export async function PUT(request: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required'
        },
        { status: HttpStatus.UNAUTHORIZED }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, dieSize, tableData } = body as UpdateRollTableRequest;

    // Validate input (at least one field should be provided)
    if (name === undefined && dieSize === undefined && tableData === undefined) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'At least one field (name, dieSize, tableData) must be provided'
        },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
        return NextResponse.json(
          {
            error: 'Bad Request',
            message: 'name must be a string between 1 and 100 characters'
          },
          { status: HttpStatus.BAD_REQUEST }
        );
      }
    }

    // Validate dieSize if provided
    if (dieSize !== undefined) {
      if (typeof dieSize !== 'number' || dieSize < 1 || dieSize > 10000) {
        return NextResponse.json(
          {
            error: 'Bad Request',
            message: 'dieSize must be a number between 1 and 10000'
          },
          { status: HttpStatus.BAD_REQUEST }
        );
      }
    }

    // Validate tableData if provided
    if (tableData !== undefined) {
      if (typeof tableData !== 'object' || !tableData) {
        return NextResponse.json(
          {
            error: 'Bad Request',
            message: 'tableData must be an object'
          },
          { status: HttpStatus.BAD_REQUEST }
        );
      }

      const validatedTableData = tableData as RollTableData;

      if (!validatedTableData.rolls || !Array.isArray(validatedTableData.rolls)) {
        return NextResponse.json(
          {
            error: 'Bad Request',
            message: 'tableData.rolls is required and must be an array'
          },
          { status: HttpStatus.BAD_REQUEST }
        );
      }

      if (!validatedTableData.metadata || typeof validatedTableData.metadata !== 'object') {
        return NextResponse.json(
          {
            error: 'Bad Request',
            message: 'tableData.metadata is required and must be an object'
          },
          { status: HttpStatus.BAD_REQUEST }
        );
      }

      // Validate rolls
      for (const roll of validatedTableData.rolls) {
        if (typeof roll.roll !== 'number' || roll.roll < 1) {
          return NextResponse.json(
            {
              error: 'Bad Request',
              message: 'Each roll must have a valid roll number >= 1'
            },
            { status: HttpStatus.BAD_REQUEST }
          );
        }
      }

      // Validate metadata
      if (!validatedTableData.metadata.generatedAt || !validatedTableData.metadata.fillStrategy) {
        return NextResponse.json(
          {
            error: 'Bad Request',
            message: 'tableData.metadata must include generatedAt and fillStrategy'
          },
          { status: HttpStatus.BAD_REQUEST }
        );
      }

      if (!['auto', 'manual', 'blank'].includes(validatedTableData.metadata.fillStrategy)) {
        return NextResponse.json(
          {
            error: 'Bad Request',
            message: 'tableData.metadata.fillStrategy must be one of: auto, manual, blank'
          },
          { status: HttpStatus.BAD_REQUEST }
        );
      }
    }

    // Update roll table
    try {
      const updatedRollTable = await updateRollTable(id, user.id, {
        name: name?.trim(),
        dieSize,
        tableData,
      });

      return NextResponse.json(
        { data: updatedRollTable },
        { status: HttpStatus.OK }
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found or access denied')) {
        return NextResponse.json(
          {
            error: 'Not Found',
            message: 'Roll table not found'
          },
          { status: HttpStatus.NOT_FOUND }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error updating roll table:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to update roll table'
      },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}

// DELETE /api/roll-tables/[id] - Delete roll table
export async function DELETE(request: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required'
        },
        { status: HttpStatus.UNAUTHORIZED }
      );
    }

    // Delete roll table
    await deleteRollTable(id, user.id);

    return NextResponse.json(
      null,
      { status: HttpStatus.NO_CONTENT }
    );
  } catch (error) {
    console.error('Error deleting roll table:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to delete roll table'
      },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}