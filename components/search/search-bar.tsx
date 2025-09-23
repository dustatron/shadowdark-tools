"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Search, X, Clock } from "lucide-react";
import Fuse from "fuse.js";
import { MagicItem } from "@/types/magic-items";

interface SearchResult {
  item: MagicItem;
  score?: number;
  matches?: readonly Fuse.FuseResultMatch[];
}

interface SearchBarProps {
  items: MagicItem[];
  onSearchResults: (results: SearchResult[]) => void;
  onSearchChange?: (query: string) => void;
  placeholder?: string;
  maxResults?: number;
  showRecentSearches?: boolean;
  className?: string;
  debounceMs?: number;
}

const RECENT_SEARCHES_KEY = "shadowdark-recent-searches";
const MAX_RECENT_SEARCHES = 5;

export function SearchBar({
  items,
  onSearchResults,
  onSearchChange,
  placeholder = "Search magic items...",
  maxResults = 50,
  showRecentSearches = true,
  className,
  debounceMs = 300,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecents, setShowRecents] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  const fuseRef = useRef<Fuse<MagicItem>>();

  // Initialize Fuse.js instance
  useEffect(() => {
    fuseRef.current = new Fuse(items, {
      keys: [
        { name: "name", weight: 2 },
        { name: "description", weight: 1 },
        { name: "traits.name", weight: 1.5 },
        { name: "traits.description", weight: 0.8 },
        { name: "type", weight: 1.2 },
        { name: "rarity", weight: 1.2 },
        { name: "category", weight: 1 },
      ],
      threshold: 0.4,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      shouldSort: true,
      findAllMatches: true,
    });
  }, [items]);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && showRecentSearches) {
      try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
          setRecentSearches(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Failed to load recent searches:", error);
      }
    }
  }, [showRecentSearches]);

  // Save recent search
  const saveRecentSearch = useCallback((searchQuery: string) => {
    if (!showRecentSearches || !searchQuery.trim()) return;

    try {
      const trimmedQuery = searchQuery.trim();
      const updated = [
        trimmedQuery,
        ...recentSearches.filter((s) => s !== trimmedQuery),
      ].slice(0, MAX_RECENT_SEARCHES);

      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to save recent search:", error);
    }
  }, [recentSearches, showRecentSearches]);

  // Debounced search function
  const performSearch = useCallback(
    (searchQuery: string) => {
      if (!fuseRef.current) return;

      setIsSearching(true);

      try {
        if (!searchQuery.trim()) {
          // Return all items when no search query
          const allResults: SearchResult[] = items.map((item) => ({ item }));
          onSearchResults(allResults.slice(0, maxResults));
          onSearchChange?.(searchQuery);
          return;
        }

        const fuseResults = fuseRef.current.search(searchQuery);
        const results: SearchResult[] = fuseResults
          .slice(0, maxResults)
          .map((result) => ({
            item: result.item,
            score: result.score,
            matches: result.matches,
          }));

        onSearchResults(results);
        onSearchChange?.(searchQuery);

        // Save to recent searches if meaningful results
        if (results.length > 0) {
          saveRecentSearch(searchQuery);
        }
      } catch (error) {
        console.error("Search failed:", error);
        onSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [items, maxResults, onSearchResults, onSearchChange, saveRecentSearch]
  );

  // Handle input change with debouncing
  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowRecents(false);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, debounceMs);
  };

  // Handle clear search
  const handleClear = () => {
    setQuery("");
    setShowRecents(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    performSearch("");
  };

  // Handle recent search selection
  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery);
    setShowRecents(false);
    performSearch(recentQuery);
    inputRef.current?.focus();
  };

  // Handle input focus
  const handleFocus = () => {
    if (showRecentSearches && recentSearches.length > 0 && !query) {
      setShowRecents(true);
    }
  };

  // Handle input blur (with small delay to allow clicking on recent searches)
  const handleBlur = () => {
    setTimeout(() => {
      setShowRecents(false);
    }, 150);
  };

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "pl-10 pr-10 h-11 text-base", // 44px height for mobile touch targets
            isSearching && "bg-gray-50 dark:bg-gray-900"
          )}
          aria-label="Search magic items"
          autoComplete="off"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {isSearching && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
          </div>
        )}
      </div>

      {/* Recent Searches Dropdown */}
      {showRecents && recentSearches.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
          <div className="p-2">
            <div className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3" />
              Recent searches
            </div>
            <div className="space-y-1">
              {recentSearches.map((recentQuery, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(recentQuery)}
                  className="w-full text-left px-2 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Badge variant="secondary" className="text-xs">
                    {recentQuery}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}