"use client";

import { useState, useEffect, useMemo } from "react";
import { MagicItem, MagicItemSearchFilters, MagicItemType, MagicItemRarity } from "@/types/magic-items";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Filter, Grid, List as ListIcon, ChevronDown, Heart, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSearchStore, useSearchFilters, useSearchResults, useSearchQuery } from "@/lib/stores/search-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { createSearchEngine, MagicItemSearchEngine } from "@/lib/utils/search";
import { FavoriteButton } from "./favorite-button";
import { AddToListButton } from "./add-to-list-button";

const ITEMS_PER_PAGE = 12;

const typeLabels: Record<MagicItemType, string> = {
  weapon: "Weapons",
  armor: "Armor",
  accessory: "Accessories",
  consumable: "Consumables",
  artifact: "Artifacts",
  unknown: "Unknown",
};

const rarityLabels: Record<MagicItemRarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  "very-rare": "Very Rare",
  legendary: "Legendary",
  artifact: "Artifact",
  unknown: "Unknown",
};

const rarityColors: Record<MagicItemRarity, string> = {
  common: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  uncommon: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200",
  rare: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200",
  "very-rare": "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200",
  legendary: "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200",
  artifact: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200",
  unknown: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export function MagicItemBrowser() {
  const [allItems, setAllItems] = useState<MagicItem[]>([]);
  const [searchEngine, setSearchEngine] = useState<MagicItemSearchEngine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use Zustand stores
  const { viewMode, setViewMode } = useUIStore();
  const {
    query,
    filters,
    setQuery,
    setFilters,
    clearFilters,
    setResults,
    setSearching,
    setSearchError,
    performSearch
  } = useSearchStore();
  const {
    filters: searchFilters,
    setType,
    setRarity,
    hasActiveFilters,
    activeFiltersCount
  } = useSearchFilters();
  const {
    displayedItems,
    totalResults,
    currentPage,
    totalPages,
    isSearching,
    hasSearched,
    searchError: storeSearchError,
    setCurrentPage
  } = useSearchResults();

  // Fetch all items and initialize search engine
  useEffect(() => {
    async function fetchAllItems() {
      try {
        setLoading(true);
        const response = await fetch('/api/magic-items');
        if (!response.ok) throw new Error("Failed to fetch items");

        const data = await response.json();
        const items = data.data || [];
        setAllItems(items);

        // Initialize search engine
        const engine = createSearchEngine(items);
        setSearchEngine(engine);

        // Set initial results
        setResults(items, items.length);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        setSearchError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchAllItems();
  }, [setResults, setSearchError]);

  // Perform search when query or filters change
  useEffect(() => {
    if (!searchEngine || loading) return;

    const performSearchOperation = async () => {
      setSearching(true);

      try {
        const searchResults = searchEngine.search(
          query || undefined,
          {
            search: query || undefined,
            type: searchFilters.type,
            rarity: searchFilters.rarity,
          },
          {
            sortBy: 'relevance',
            sortOrder: 'asc',
          }
        );

        const items = searchResults.results.map(result => result.item);
        setResults(items, searchResults.total);
        setSearchError(undefined);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Search failed";
        setSearchError(errorMessage);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(performSearchOperation, 300);
    return () => clearTimeout(timeoutId);
  }, [query, searchFilters.type, searchFilters.rarity, searchEngine, loading, setResults, setSearching, setSearchError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Error loading magic items: {error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search magic items..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          {/* Type Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {searchFilters.type ? typeLabels[searchFilters.type] : "All Types"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setType(undefined)}>
                All Types
              </DropdownMenuItem>
              {Object.entries(typeLabels).map(([type, label]) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => setType(type as MagicItemType)}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Rarity Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                {searchFilters.rarity ? rarityLabels[searchFilters.rarity] : "All Rarities"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setRarity(undefined)}>
                All Rarities
              </DropdownMenuItem>
              {Object.entries(rarityLabels).map(([rarity, label]) => (
                <DropdownMenuItem
                  key={rarity}
                  onClick={() => setRarity(rarity as MagicItemRarity)}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode Toggle */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filters:</span>
          {query && (
            <Badge variant="secondary" className="gap-1">
              Search: {query}
              <button onClick={() => setQuery("")} className="ml-1 hover:text-destructive">×</button>
            </Badge>
          )}
          {searchFilters.type && (
            <Badge variant="secondary" className="gap-1">
              Type: {typeLabels[searchFilters.type]}
              <button onClick={() => setType(undefined)} className="ml-1 hover:text-destructive">×</button>
            </Badge>
          )}
          {searchFilters.rarity && (
            <Badge variant="secondary" className="gap-1">
              Rarity: {rarityLabels[searchFilters.rarity]}
              <button onClick={() => setRarity(undefined)} className="ml-1 hover:text-destructive">×</button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </div>
      )}

      {/* Results Count and Status */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {isSearching ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Searching...
            </div>
          ) : (
            <>
              {totalResults} item{totalResults !== 1 ? "s" : ""} found
              {activeFiltersCount > 0 && (
                <span className="ml-2 text-xs">
                  ({activeFiltersCount} filter{activeFiltersCount !== 1 ? "s" : ""} active)
                </span>
              )}
            </>
          )}
        </div>
        {storeSearchError && (
          <div className="text-sm text-destructive">
            {storeSearchError}
          </div>
        )}
      </div>

      {/* Items Grid/List */}
      {!hasSearched && !loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Start searching to find magic items.</p>
        </div>
      ) : totalResults === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No magic items found matching your criteria.</p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "space-y-4"
          )}>
            {displayedItems.map((item) => (
              <div key={item.slug} className="relative group">
                <Link href={`/items/${item.slug}`}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base leading-tight">{item.name}</CardTitle>
                        {item.rarity !== "unknown" && (
                          <Badge className={cn("text-xs", rarityColors[item.rarity])}>
                            {rarityLabels[item.rarity]}
                          </Badge>
                        )}
                      </div>
                      {item.type !== "unknown" && (
                        <Badge variant="outline" className="text-xs w-fit">
                          {typeLabels[item.type]}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {item.description}
                      </p>
                      {item.traits && item.traits.length > 0 && (
                        <div className="mt-3 text-xs text-muted-foreground">
                          {item.traits.length} trait{item.traits.length !== 1 ? "s" : ""}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>

                {/* Action buttons that appear on hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded-md p-1 shadow-sm">
                  <div className="flex gap-1">
                    <FavoriteButton magicItemId={item.slug} size="sm" />
                    <AddToListButton magicItemId={item.slug} size="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}