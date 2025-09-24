"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Search, Grid, List as ListIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/stores/ui-store";
import { createSearchEngine, MagicItemSearchEngine } from "@/lib/utils/search";
import { useSearchResults, useSearchStore } from "@/lib/stores/search-store";


export function MagicItemBrowser() {
  const [searchEngine, setSearchEngine] = useState<MagicItemSearchEngine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use Zustand stores
  const { viewMode, setViewMode } = useUIStore();
  const {
    query,
    setQuery,
    setResults,
    setSearching,
    setSearchError
  } = useSearchStore();
  const {
    displayedItems,
    totalResults,
    currentPage,
    totalPages,
    isSearching,
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
        const items = data.data?.data || [];

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
  }, [query, searchEngine, loading, setResults, setSearching, setSearchError]);

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
      {query && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filters:</span>
          <Badge variant="secondary" className="gap-1">
            Search: {query}
            <button onClick={() => setQuery("")} className="ml-1 hover:text-destructive">×</button>
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => setQuery("")}>
            Clear Search
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
              {query && (
                <span className="ml-2 text-xs">
                  (filtered by search)
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
      {totalResults === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No magic items found matching your criteria.</p>
          {query && (
            <Button variant="outline" onClick={() => setQuery("")} className="mt-4">
              Clear Search
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
                      <CardTitle className="text-base leading-tight">{item.name}</CardTitle>
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

                {/* Action buttons temporarily disabled due to Supabase setup */}
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