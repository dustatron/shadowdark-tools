import { MagicItem, MagicItemSearchFilters, MagicItemSearchResult, MagicItemType, MagicItemRarity } from '@/types/magic-items';
import { createClient } from '@/lib/supabase/server';
import Fuse from 'fuse.js';

// Cache for processed magic items
let processedMagicItems: MagicItem[] | null = null;
let fuseInstance: Fuse<MagicItem> | null = null;

// Type categorization based on item names and descriptions
const typeKeywords: Record<MagicItemType, string[]> = {
  weapon: ['sword', 'dagger', 'bow', 'arrow', 'blade', 'axe', 'mace', 'staff', 'wand', 'spear'],
  armor: ['armor', 'mail', 'plate', 'shield', 'helm', 'gauntlet', 'boot'],
  accessory: ['ring', 'amulet', 'cloak', 'belt', 'bracelet', 'necklace', 'pendant', 'crown'],
  consumable: ['potion', 'scroll', 'elixir', 'pill', 'draught', 'vial'],
  artifact: ['artifact', 'relic', 'ancient', 'legendary'],
  unknown: []
};

const rarityKeywords: Record<MagicItemRarity, string[]> = {
  common: ['common', 'simple', 'basic'],
  uncommon: ['uncommon', 'minor'],
  rare: ['rare', 'greater'],
  'very-rare': ['very rare', 'major', 'powerful'],
  legendary: ['legendary', 'epic', 'ultimate'],
  artifact: ['artifact', 'divine', 'cosmic'],
  unknown: []
};

interface RawMagicItem {
  name: string;
  slug: string;
  description: string;
  traits?: Array<{
    name: string;
    description: string;
  }>;
}

function inferItemType(item: RawMagicItem): MagicItemType {
  const searchText = `${item.name} ${item.description}`.toLowerCase();

  for (const [type, keywords] of Object.entries(typeKeywords)) {
    if (type === 'unknown') continue;
    if (keywords.some(keyword => searchText.includes(keyword))) {
      return type as MagicItemType;
    }
  }

  return 'unknown';
}

function inferItemRarity(item: RawMagicItem): MagicItemRarity {
  const searchText = `${item.name} ${item.description}`.toLowerCase();

  for (const [rarity, keywords] of Object.entries(rarityKeywords)) {
    if (rarity === 'unknown') continue;
    if (keywords.some(keyword => searchText.includes(keyword))) {
      return rarity as MagicItemRarity;
    }
  }

  return 'unknown';
}

async function loadMagicItemsFromDatabase(): Promise<MagicItem[]> {
  if (processedMagicItems) {
    return processedMagicItems;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('magic_items')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching magic items from database:', error);
    throw new Error('Failed to load magic items');
  }

  processedMagicItems = data.map((item) => ({
    name: item.name,
    slug: item.slug,
    description: item.description,
    traits: item.traits || [],
    // Since we stored the raw data, we still need to infer type/rarity
    type: inferItemType(item),
    rarity: inferItemRarity(item),
  }));

  return processedMagicItems;
}

async function getFuseInstance(): Promise<Fuse<MagicItem>> {
  if (!fuseInstance) {
    const items = await loadMagicItemsFromDatabase();
    fuseInstance = new Fuse(items, {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'traits.name', weight: 0.2 },
        { name: 'traits.description', weight: 0.1 },
      ],
      threshold: 0.4,
      includeScore: true,
    });
  }
  return fuseInstance;
}

export async function getAllMagicItems(): Promise<MagicItem[]> {
  return loadMagicItemsFromDatabase();
}

export async function getMagicItemBySlug(slug: string): Promise<MagicItem | null> {
  const items = await loadMagicItemsFromDatabase();
  return items.find(item => item.slug === slug) || null;
}

export async function searchMagicItems(filters: MagicItemSearchFilters = {}): Promise<MagicItemSearchResult> {
  let items = await loadMagicItemsFromDatabase();

  // Apply search
  if (filters.search) {
    const fuse = await getFuseInstance();
    const results = fuse.search(filters.search);
    items = results.map(result => result.item);
  }

  // Apply type filter
  if (filters.type) {
    items = items.filter(item => item.type === filters.type);
  }

  // Apply rarity filter
  if (filters.rarity) {
    items = items.filter(item => item.rarity === filters.rarity);
  }

  return {
    data: items,
    total: items.length,
  };
}

export async function getMagicItemsByIds(slugs: string[]): Promise<MagicItem[]> {
  const items = await loadMagicItemsFromDatabase();
  return items.filter(item => slugs.includes(item.slug));
}