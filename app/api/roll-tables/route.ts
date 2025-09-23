import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserRollTables, createRollTable } from '@/lib/services/roll-tables';
import { CreateRollTableRequest, RollTableData } from '@/types/tables';
import { HttpStatus } from '@/types/api';

// GET /api/roll-tables - Get user's roll tables
export async function GET() {
  try {
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

    // Get user's roll tables
    const rollTables = await getUserRollTables(user.id);

    return NextResponse.json(
      { data: rollTables },
      { status: HttpStatus.OK }
    );
  } catch (error) {
    console.error('Error fetching roll tables:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch roll tables'
      },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}

// POST /api/roll-tables - Create roll table
export async function POST(request: NextRequest) {
  try {
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
    const { name, dieSize, sourceListId, tableData } = body as CreateRollTableRequest;

    // Validate required fields
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'name is required and must be a string'
        },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    if (!dieSize || typeof dieSize !== 'number') {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'dieSize is required and must be a number'
        },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    if (!tableData || typeof tableData !== 'object') {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'tableData is required and must be an object'
        },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Validate dieSize range
    if (dieSize < 1 || dieSize > 10000) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'dieSize must be between 1 and 10000'
        },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Validate name length
    if (name.trim().length === 0 || name.length > 100) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'name must be between 1 and 100 characters'
        },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Validate tableData structure
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

    // Create roll table
    try {
      const rollTable = await createRollTable(user.id, {
        name: name.trim(),
        dieSize,
        sourceListId: sourceListId || null,
        tableData: validatedTableData,
      });

      return NextResponse.json(
        { data: rollTable },
        { status: HttpStatus.CREATED }
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes('Max allowed is 100')) {
        return NextResponse.json(
          {
            error: 'Conflict',
            message: 'Max allowed is 100'
          },
          { status: HttpStatus.CONFLICT }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error creating roll table:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to create roll table'
      },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}