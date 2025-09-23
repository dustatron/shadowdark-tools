export interface MagicItemTrait {
  name: string;
  description: string;
}

export interface MagicItem {
  name: string;
  slug: string;
  description: string;
  traits: MagicItemTrait[];
  // Derived fields for filtering and search
  type?: MagicItemType;
  rarity?: MagicItemRarity;
  category?: string;
}

// These types are inferred from the item names and descriptions
// since the JSON doesn't have explicit type/rarity fields
export type MagicItemType =
  | 'weapon'
  | 'armor'
  | 'accessory'
  | 'consumable'
  | 'artifact'
  | 'unknown';

export type MagicItemRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'very-rare'
  | 'legendary'
  | 'artifact'
  | 'unknown';

export interface MagicItemSearchFilters {
  search?: string;
  type?: MagicItemType;
  rarity?: MagicItemRarity;
}

export interface MagicItemSearchResult {
  data: MagicItem[];
  total: number;
}

// Magic item with additional metadata for lists/favorites
export interface MagicItemWithMetadata extends MagicItem {
  addedAt?: string;
  sortOrder?: number;
  isFavorite?: boolean;
}

// Utility type for using slug as ID in database operations
export type MagicItemId = string; // This will be the slug field