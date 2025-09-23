"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Filter, X, ChevronDown } from "lucide-react";
import { MagicItemType, MagicItemRarity, MagicItemSearchFilters } from "@/types/magic-items";

interface FilterOption<T> {
  value: T;
  label: string;
  count?: number;
}

interface FilterControlsProps {
  filters: MagicItemSearchFilters;
  onFiltersChange: (filters: MagicItemSearchFilters) => void;
  availableTypes?: FilterOption<MagicItemType>[];
  availableRarities?: FilterOption<MagicItemRarity>[];
  showCounts?: boolean;
  className?: string;
}

const DEFAULT_TYPES: FilterOption<MagicItemType>[] = [
  { value: "weapon", label: "Weapon" },
  { value: "armor", label: "Armor" },
  { value: "accessory", label: "Accessory" },
  { value: "consumable", label: "Consumable" },
  { value: "artifact", label: "Artifact" },
  { value: "unknown", label: "Unknown" },
];

const DEFAULT_RARITIES: FilterOption<MagicItemRarity>[] = [
  { value: "common", label: "Common" },
  { value: "uncommon", label: "Uncommon" },
  { value: "rare", label: "Rare" },
  { value: "very-rare", label: "Very Rare" },
  { value: "legendary", label: "Legendary" },
  { value: "artifact", label: "Artifact" },
  { value: "unknown", label: "Unknown" },
];

export function FilterControls({
  filters,
  onFiltersChange,
  availableTypes = DEFAULT_TYPES,
  availableRarities = DEFAULT_RARITIES,
  showCounts = true,
  className,
}: FilterControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Check if any filters are active
  const hasActiveFilters = filters.type !== undefined || filters.rarity !== undefined;
  const activeFilterCount = [filters.type, filters.rarity].filter(Boolean).length;

  // Handle type filter change
  const handleTypeChange = (type: MagicItemType, checked: boolean) => {
    onFiltersChange({
      ...filters,
      type: checked ? type : undefined,
    });
  };

  // Handle rarity filter change
  const handleRarityChange = (rarity: MagicItemRarity, checked: boolean) => {
    onFiltersChange({
      ...filters,
      rarity: checked ? rarity : undefined,
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange({
      search: filters.search,
    });
  };

  // Clear specific filter
  const clearTypeFilter = () => {
    onFiltersChange({
      ...filters,
      type: undefined,
    });
  };

  const clearRarityFilter = () => {
    onFiltersChange({
      ...filters,
      rarity: undefined,
    });
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Filter Dropdown */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-9 gap-2 relative",
              hasActiveFilters && "border-blue-500 bg-blue-50 dark:bg-blue-950"
            )}
            aria-label="Filter options"
          >
            <Filter className="h-4 w-4" />
            Filter
            {activeFilterCount > 0 && (
              <Badge
                variant="secondary"
                className="h-5 w-5 p-0 text-xs rounded-full bg-blue-500 text-white hover:bg-blue-500"
              >
                {activeFilterCount}
              </Badge>
            )}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          {/* Type Filter Section */}
          <DropdownMenuLabel>Item Type</DropdownMenuLabel>
          <div className="px-2 pb-2">
            {availableTypes.map((typeOption) => (
              <DropdownMenuCheckboxItem
                key={typeOption.value}
                checked={filters.type === typeOption.value}
                onCheckedChange={(checked) =>
                  handleTypeChange(typeOption.value, checked)
                }
                className="flex items-center justify-between"
              >
                <span className="flex-1">{typeOption.label}</span>
                {showCounts && typeOption.count !== undefined && (
                  <Badge variant="secondary" className="text-xs ml-2">
                    {typeOption.count}
                  </Badge>
                )}
              </DropdownMenuCheckboxItem>
            ))}
          </div>

          <DropdownMenuSeparator />

          {/* Rarity Filter Section */}
          <DropdownMenuLabel>Item Rarity</DropdownMenuLabel>
          <div className="px-2 pb-2">
            {availableRarities.map((rarityOption) => (
              <DropdownMenuCheckboxItem
                key={rarityOption.value}
                checked={filters.rarity === rarityOption.value}
                onCheckedChange={(checked) =>
                  handleRarityChange(rarityOption.value, checked)
                }
                className="flex items-center justify-between"
              >
                <span className="flex-1">{rarityOption.label}</span>
                {showCounts && rarityOption.count !== undefined && (
                  <Badge variant="secondary" className="text-xs ml-2">
                    {rarityOption.count}
                  </Badge>
                )}
              </DropdownMenuCheckboxItem>
            ))}
          </div>

          {hasActiveFilters && (
            <>
              <DropdownMenuSeparator />
              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  Clear All Filters
                </Button>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active Filter Tags */}
      {filters.type && (
        <Badge
          variant="secondary"
          className="gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        >
          Type: {availableTypes.find((t) => t.value === filters.type)?.label}
          <Button
            variant="ghost"
            size="icon"
            onClick={clearTypeFilter}
            className="h-4 w-4 p-0 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full"
            aria-label="Remove type filter"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {filters.rarity && (
        <Badge
          variant="secondary"
          className="gap-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
        >
          Rarity: {availableRarities.find((r) => r.value === filters.rarity)?.label}
          <Button
            variant="ghost"
            size="icon"
            onClick={clearRarityFilter}
            className="h-4 w-4 p-0 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full"
            aria-label="Remove rarity filter"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {/* Clear All Button (when filters are active) */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="h-9 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
        >
          Clear All
        </Button>
      )}
    </div>
  );
}