import Fuse from 'fuse.js';
import { MagicItem, MagicItemSearchFilters, MagicItemType, MagicItemRarity } from '@/types/magic-items';

// Configuration for Fuse.js fuzzy search
const fuseConfig: Fuse.IFuseOptions<MagicItem> = {
  keys: [
    {
      name: 'name',
      weight: 0.6,
    },
    {
      name: 'description',
      weight: 0.3,
    },
    {
      name: 'traits.name',
      weight: 0.2,
    },
    {
      name: 'traits.description',
      weight: 0.1,
    },
  ],
  threshold: 0.4, // Lower = more strict matching
  distance: 100,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
  findAllMatches: true,
};

export interface SearchResult<T> {
  item: T;
  score?: number;
  matches?: Fuse.FuseResultMatch[];
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'name' | 'type' | 'rarity';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Advanced search utility class that combines fuzzy search with filtering
 */
export class MagicItemSearchEngine {
  private fuse: Fuse<MagicItem>;
  private allItems: MagicItem[];

  constructor(items: MagicItem[]) {
    this.allItems = Array.isArray(items) ? items : [];
    this.fuse = new Fuse(this.allItems, fuseConfig);
  }

  /**
   * Update the search index with new items
   */
  updateItems(items: MagicItem[]) {
    this.allItems = Array.isArray(items) ? items : [];
    this.fuse = new Fuse(this.allItems, fuseConfig);
  }

  /**
   * Perform a comprehensive search with query and filters
   */
  search(
    query?: string,
    filters?: MagicItemSearchFilters,
    options?: SearchOptions
  ): {
    results: SearchResult<MagicItem>[];
    total: number;
  } {
    let results: SearchResult<MagicItem>[];

    // Step 1: Text search
    if (query && query.trim()) {
      const fuseResults = this.fuse.search(query.trim());
      results = fuseResults.map(result => ({
        item: result.item,
        score: result.score,
        matches: result.matches,
      }));
    } else {
      // No query, return all items with default score
      results = this.allItems.map(item => ({
        item,
        score: 0,
      }));
    }

    // Step 2: Apply filters
    if (filters) {
      results = this.applyFilters(results, filters);
    }

    // Step 3: Sort results
    results = this.sortResults(results, options?.sortBy, options?.sortOrder);

    const total = results.length;

    // Step 4: Apply pagination
    if (options?.limit || options?.offset) {
      const offset = options.offset || 0;
      const limit = options.limit || results.length;
      results = results.slice(offset, offset + limit);
    }

    return { results, total };
  }

  /**
   * Get suggestions for autocomplete based on partial query
   */
  getSuggestions(query: string, limit = 5): string[] {
    if (!query || query.length < 2) return [];

    const results = this.fuse.search(query, { limit: limit * 2 });
    const suggestions = new Set<string>();

    results.forEach(result => {
      const item = result.item;

      // Add item name if it matches
      if (item.name.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(item.name);
      }

      // Add trait names if they match
      item.traits.forEach(trait => {
        if (trait.name.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(trait.name);
        }
      });
    });

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Find similar items based on an existing item
   */
  findSimilar(item: MagicItem, limit = 5): SearchResult<MagicItem>[] {
    // Create a search query from the item's characteristics
    const searchTerms = [
      item.name,
      ...item.traits.map(trait => trait.name),
    ].join(' ');

    const results = this.fuse.search(searchTerms, { limit: limit + 1 });

    // Filter out the original item and return results
    return results
      .filter(result => result.item.slug !== item.slug)
      .slice(0, limit)
      .map(result => ({
        item: result.item,
        score: result.score,
        matches: result.matches,
      }));
  }

  /**
   * Get facet counts for filters
   */
  getFacetCounts(query?: string): {
    types: Record<MagicItemType, number>;
    rarities: Record<MagicItemRarity, number>;
  } {
    let items = this.allItems;

    // If there's a query, filter by search results first
    if (query && query.trim()) {
      const searchResults = this.fuse.search(query.trim());
      items = searchResults.map(result => result.item);
    }

    const typeCounts: Record<string, number> = {};
    const rarityCounts: Record<string, number> = {};

    items.forEach(item => {
      // Count types
      const type = this.inferItemType(item);
      typeCounts[type] = (typeCounts[type] || 0) + 1;

      // Count rarities
      const rarity = this.inferItemRarity(item);
      rarityCounts[rarity] = (rarityCounts[rarity] || 0) + 1;
    });

    return {
      types: typeCounts as Record<MagicItemType, number>,
      rarities: rarityCounts as Record<MagicItemRarity, number>,
    };
  }

  /**
   * Apply filters to search results
   */
  private applyFilters(
    results: SearchResult<MagicItem>[],
    filters: MagicItemSearchFilters
  ): SearchResult<MagicItem>[] {
    return results.filter(result => {
      const item = result.item;

      // Type filter
      if (filters.type) {
        const itemType = this.inferItemType(item);
        if (itemType !== filters.type) return false;
      }

      // Rarity filter
      if (filters.rarity) {
        const itemRarity = this.inferItemRarity(item);
        if (itemRarity !== filters.rarity) return false;
      }

      return true;
    });
  }

  /**
   * Sort search results
   */
  private sortResults(
    results: SearchResult<MagicItem>[],
    sortBy?: SearchOptions['sortBy'],
    sortOrder: SearchOptions['sortOrder'] = 'asc'
  ): SearchResult<MagicItem>[] {
    const sortedResults = [...results];

    sortedResults.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.item.name.localeCompare(b.item.name);
          break;
        case 'type':
          const typeA = this.inferItemType(a.item);
          const typeB = this.inferItemType(b.item);
          comparison = typeA.localeCompare(typeB);
          break;
        case 'rarity':
          const rarityOrder = ['common', 'uncommon', 'rare', 'very-rare', 'legendary', 'artifact', 'unknown'];
          const rarityA = this.inferItemRarity(a.item);
          const rarityB = this.inferItemRarity(b.item);
          comparison = rarityOrder.indexOf(rarityA) - rarityOrder.indexOf(rarityB);
          break;
        case 'relevance':
        default:
          // Sort by score (lower score = more relevant in Fuse.js)
          comparison = (a.score || 0) - (b.score || 0);
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return sortedResults;
  }

  /**
   * Infer item type from name and description
   */
  private inferItemType(item: MagicItem): MagicItemType {
    if (item.type) return item.type;

    const text = `${item.name} ${item.description}`.toLowerCase();

    // Weapon keywords
    if (text.match(/\b(sword|blade|dagger|axe|mace|hammer|bow|crossbow|staff|wand|spear|lance|weapon)\b/)) {
      return 'weapon';
    }

    // Armor keywords
    if (text.match(/\b(armor|armour|shield|helm|helmet|gauntlet|boot|plate|mail|leather|robe)\b/)) {
      return 'armor';
    }

    // Consumable keywords
    if (text.match(/\b(potion|scroll|elixir|draught|brew|tonic|philter|consume|drink|eat)\b/)) {
      return 'consumable';
    }

    // Artifact keywords
    if (text.match(/\b(artifact|relic|ancient|legendary|divine|god|goddess)\b/)) {
      return 'artifact';
    }

    // Accessory keywords (rings, amulets, etc.)
    if (text.match(/\b(ring|amulet|necklace|bracelet|cloak|cape|belt|circlet|crown|tiara)\b/)) {
      return 'accessory';
    }

    return 'unknown';
  }

  /**
   * Infer item rarity from name and description
   */
  private inferItemRarity(item: MagicItem): MagicItemRarity {
    if (item.rarity) return item.rarity;

    const text = `${item.name} ${item.description}`.toLowerCase();

    // Explicit rarity mentions
    if (text.includes('legendary')) return 'legendary';
    if (text.includes('artifact')) return 'artifact';
    if (text.includes('very rare')) return 'very-rare';
    if (text.includes('rare')) return 'rare';
    if (text.includes('uncommon')) return 'uncommon';
    if (text.includes('common')) return 'common';

    // Infer from descriptive words
    if (text.match(/\b(ancient|divine|god|goddess|eternal|ultimate|supreme)\b/)) {
      return 'artifact';
    }

    if (text.match(/\b(legendary|fabled|mythical|epic)\b/)) {
      return 'legendary';
    }

    if (text.match(/\b(powerful|mighty|greater|superior|masterwork|exquisite)\b/)) {
      return 'very-rare';
    }

    if (text.match(/\b(magical|enchanted|blessed|cursed|minor)\b/)) {
      return 'rare';
    }

    if (text.match(/\b(simple|basic|lesser|weak)\b/)) {
      return 'common';
    }

    return 'unknown';
  }
}

/**
 * Create a search engine instance
 */
export function createSearchEngine(items: MagicItem[]): MagicItemSearchEngine {
  return new MagicItemSearchEngine(items);
}

/**
 * Highlight search matches in text
 */
export function highlightMatches(
  text: string,
  matches?: Fuse.FuseResultMatch[]
): string {
  if (!matches || matches.length === 0) return text;

  let highlightedText = text;
  const replacements: Array<{ start: number; end: number; text: string }> = [];

  matches.forEach(match => {
    if (match.indices) {
      match.indices.forEach(([start, end]) => {
        replacements.push({
          start,
          end,
          text: text.slice(start, end + 1),
        });
      });
    }
  });

  // Sort replacements by start position (descending) to avoid index shifting
  replacements.sort((a, b) => b.start - a.start);

  replacements.forEach(replacement => {
    const before = highlightedText.slice(0, replacement.start);
    const highlighted = `<mark>${replacement.text}</mark>`;
    const after = highlightedText.slice(replacement.end + 1);
    highlightedText = before + highlighted + after;
  });

  return highlightedText;
}

/**
 * Extract search terms from a query string
 */
export function extractSearchTerms(query: string): string[] {
  return query
    .trim()
    .split(/\s+/)
    .filter(term => term.length > 0)
    .map(term => term.toLowerCase());
}

/**
 * Build a search query from multiple terms
 */
export function buildSearchQuery(terms: string[]): string {
  return terms.filter(term => term.trim()).join(' ');
}