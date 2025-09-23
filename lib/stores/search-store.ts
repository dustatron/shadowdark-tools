import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MagicItem, MagicItemType, MagicItemRarity, MagicItemSearchFilters } from '@/types/magic-items';

export interface SearchState {
  // Search query
  query: string;

  // Filters
  filters: MagicItemSearchFilters;

  // Search results
  results: MagicItem[];
  totalResults: number;

  // Pagination
  currentPage: number;
  itemsPerPage: number;

  // Search state
  isSearching: boolean;
  hasSearched: boolean;
  searchError?: string;

  // Recent searches
  recentSearches: string[];

  // Sorting
  sortBy: 'relevance' | 'name' | 'type' | 'rarity';
  sortOrder: 'asc' | 'desc';

  // Quick filters for common searches
  quickFilters: {
    showWeapons: boolean;
    showArmor: boolean;
    showAccessories: boolean;
    showConsumables: boolean;
    showArtifacts: boolean;
  };

  // Actions
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<MagicItemSearchFilters>) => void;
  clearFilters: () => void;
  setResults: (results: MagicItem[], total: number) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  setSearching: (isSearching: boolean) => void;
  setSearchError: (error?: string) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  setSorting: (sortBy: SearchState['sortBy'], sortOrder: SearchState['sortOrder']) => void;
  setQuickFilters: (filters: Partial<SearchState['quickFilters']>) => void;
  resetSearch: () => void;

  // Computed getters
  getTotalPages: () => number;
  getDisplayedItems: () => MagicItem[];
  getActiveFiltersCount: () => number;
  hasActiveFilters: () => boolean;
}

const initialFilters: MagicItemSearchFilters = {
  search: undefined,
  type: undefined,
  rarity: undefined,
};

const initialQuickFilters = {
  showWeapons: false,
  showArmor: false,
  showAccessories: false,
  showConsumables: false,
  showArtifacts: false,
};

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      // Initial state
      query: '',
      filters: initialFilters,
      results: [],
      totalResults: 0,
      currentPage: 1,
      itemsPerPage: 20,
      isSearching: false,
      hasSearched: false,
      searchError: undefined,
      recentSearches: [],
      sortBy: 'relevance',
      sortOrder: 'desc',
      quickFilters: initialQuickFilters,

      // Actions
      setQuery: (query) => {
        set({
          query,
          currentPage: 1, // Reset to first page when query changes
        });
      },

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          currentPage: 1, // Reset to first page when filters change
        }));
      },

      clearFilters: () => {
        set({
          filters: initialFilters,
          quickFilters: initialQuickFilters,
          currentPage: 1,
        });
      },

      setResults: (results, total) => {
        set({
          results,
          totalResults: total,
          hasSearched: true,
          isSearching: false,
          searchError: undefined,
        });
      },

      setCurrentPage: (page) => set({ currentPage: page }),

      setItemsPerPage: (count) => {
        set({
          itemsPerPage: count,
          currentPage: 1, // Reset to first page when page size changes
        });
      },

      setSearching: (isSearching) => set({ isSearching }),

      setSearchError: (error) => {
        set({
          searchError: error,
          isSearching: false,
        });
      },

      addRecentSearch: (query) => {
        if (!query.trim()) return;

        set((state) => {
          const trimmedQuery = query.trim();
          const filtered = state.recentSearches.filter(s => s !== trimmedQuery);
          return {
            recentSearches: [trimmedQuery, ...filtered].slice(0, 10), // Keep last 10 searches
          };
        });
      },

      clearRecentSearches: () => set({ recentSearches: [] }),

      setSorting: (sortBy, sortOrder) => {
        set({ sortBy, sortOrder });
      },

      setQuickFilters: (newQuickFilters) => {
        set((state) => {
          const updatedQuickFilters = { ...state.quickFilters, ...newQuickFilters };

          // Convert quick filters to actual filters
          const types: MagicItemType[] = [];
          if (updatedQuickFilters.showWeapons) types.push('weapon');
          if (updatedQuickFilters.showArmor) types.push('armor');
          if (updatedQuickFilters.showAccessories) types.push('accessory');
          if (updatedQuickFilters.showConsumables) types.push('consumable');
          if (updatedQuickFilters.showArtifacts) types.push('artifact');

          return {
            quickFilters: updatedQuickFilters,
            filters: {
              ...state.filters,
              type: types.length === 1 ? types[0] : undefined,
            },
            currentPage: 1,
          };
        });
      },

      resetSearch: () => {
        set({
          query: '',
          filters: initialFilters,
          results: [],
          totalResults: 0,
          currentPage: 1,
          isSearching: false,
          hasSearched: false,
          searchError: undefined,
          quickFilters: initialQuickFilters,
          sortBy: 'relevance',
          sortOrder: 'desc',
        });
      },

      // Computed getters
      getTotalPages: () => {
        const state = get();
        return Math.ceil(state.totalResults / state.itemsPerPage);
      },

      getDisplayedItems: () => {
        const state = get();
        const startIndex = (state.currentPage - 1) * state.itemsPerPage;
        const endIndex = startIndex + state.itemsPerPage;
        return state.results.slice(startIndex, endIndex);
      },

      getActiveFiltersCount: () => {
        const state = get();
        let count = 0;

        if (state.filters.type) count++;
        if (state.filters.rarity) count++;
        if (state.query) count++;

        return count;
      },

      hasActiveFilters: () => {
        const state = get();
        return (
          !!state.filters.type ||
          !!state.filters.rarity ||
          !!state.query ||
          Object.values(state.quickFilters).some(Boolean)
        );
      },
    }),
    {
      name: 'shadowdark-search-store',
      // Persist user preferences and recent searches, but not current search state
      partialize: (state) => ({
        recentSearches: state.recentSearches,
        itemsPerPage: state.itemsPerPage,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
    }
  )
);

// Convenience hooks for common search patterns
export const useSearchFilters = () => {
  const {
    filters,
    quickFilters,
    setFilters,
    setQuickFilters,
    clearFilters,
    getActiveFiltersCount,
    hasActiveFilters,
  } = useSearchStore();

  const setType = (type?: MagicItemType) => setFilters({ type });
  const setRarity = (rarity?: MagicItemRarity) => setFilters({ rarity });

  const toggleQuickFilter = (filterKey: keyof SearchState['quickFilters']) => {
    setQuickFilters({ [filterKey]: !quickFilters[filterKey] });
  };

  return {
    filters,
    quickFilters,
    setFilters,
    setType,
    setRarity,
    setQuickFilters,
    toggleQuickFilter,
    clearFilters,
    activeFiltersCount: getActiveFiltersCount(),
    hasActiveFilters: hasActiveFilters(),
  };
};

export const useSearchResults = () => {
  const {
    results,
    totalResults,
    currentPage,
    itemsPerPage,
    isSearching,
    hasSearched,
    searchError,
    getTotalPages,
    getDisplayedItems,
    setCurrentPage,
  } = useSearchStore();

  return {
    results,
    displayedItems: getDisplayedItems(),
    totalResults,
    currentPage,
    totalPages: getTotalPages(),
    itemsPerPage,
    isSearching,
    hasSearched,
    searchError,
    setCurrentPage,
  };
};

export const useSearchQuery = () => {
  const {
    query,
    recentSearches,
    setQuery,
    addRecentSearch,
    clearRecentSearches,
  } = useSearchStore();

  const performSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    addRecentSearch(searchQuery);
  };

  return {
    query,
    recentSearches,
    setQuery,
    performSearch,
    clearRecentSearches,
  };
};