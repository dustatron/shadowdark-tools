import { NextRequest, NextResponse } from 'next/server';
import { searchMagicItems } from '@/lib/services/magic-items';
import { MagicItemType, MagicItemRarity } from '@/types/magic-items';
import { HttpStatus } from '@/types/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract and validate query parameters
    const search = searchParams.get('search') || undefined;
    const type = searchParams.get('type') as MagicItemType | null;
    const rarity = searchParams.get('rarity') as MagicItemRarity | null;

    // Validate type parameter
    if (type && !['weapon', 'armor', 'accessory', 'consumable', 'artifact', 'unknown'].includes(type)) {
      return NextResponse.json(
        { error: { message: 'Invalid type parameter' } },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Validate rarity parameter
    if (rarity && !['common', 'uncommon', 'rare', 'very-rare', 'legendary', 'artifact', 'unknown'].includes(rarity)) {
      return NextResponse.json(
        { error: { message: 'Invalid rarity parameter' } },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Search magic items
    const result = await searchMagicItems({
      search,
      type: type || undefined,
      rarity: rarity || undefined,
    });

    return NextResponse.json(
      { data: result },
      { status: HttpStatus.OK }
    );
  } catch (error) {
    console.error('Error fetching magic items:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}