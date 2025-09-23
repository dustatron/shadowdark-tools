"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  GripVertical,
  X,
  Search,
  Plus,
  Package,
  AlertCircle,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { MagicItem, MagicItemWithMetadata } from "@/types/magic-items";
import { ListWithItems, ListItem } from "@/types/api";

interface ListItemManagerProps {
  list: ListWithItems;
  allItems: MagicItem[];
  onAddItem: (magicItemId: string) => Promise<void>;
  onRemoveItem: (listItemId: string) => Promise<void>;
  onReorderItems?: (reorderedItems: ListItem[]) => Promise<void>;
  className?: string;
}

interface DraggableListItem extends ListItem {
  magicItem?: MagicItem;
}

export function ListItemManager({
  list,
  allItems,
  onAddItem,
  onRemoveItem,
  onReorderItems,
  className,
}: ListItemManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [availableItems, setAvailableItems] = useState<MagicItem[]>([]);
  const [listItems, setListItems] = useState<DraggableListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddItems, setShowAddItems] = useState(false);

  // Initialize list items
  useEffect(() => {
    if (list.items) {
      const sortedItems = [...list.items].sort((a, b) => a.sort_order - b.sort_order);
      setListItems(sortedItems);
    }
  }, [list.items]);

  // Filter available items (not already in list)
  useEffect(() => {
    const itemsInList = new Set(list.items?.map((item) => item.magic_item_id) || []);
    const filtered = allItems.filter((item) => !itemsInList.has(item.slug));

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const searchFiltered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.type?.toLowerCase().includes(query) ||
          item.rarity?.toLowerCase().includes(query)
      );
      setAvailableItems(searchFiltered);
    } else {
      setAvailableItems(filtered);
    }
  }, [allItems, list.items, searchQuery]);

  const handleAddItem = async (magicItemId: string) => {
    setIsLoading(true);
    try {
      await onAddItem(magicItemId);
      setSearchQuery("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (listItemId: string) => {
    setIsLoading(true);
    try {
      await onRemoveItem(listItemId);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveItem = async (index: number, direction: "up" | "down") => {
    if (!onReorderItems) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= listItems.length) return;

    // Reorder items locally first for immediate feedback
    const reorderedItems = Array.from(listItems);
    const [movedItem] = reorderedItems.splice(index, 1);
    reorderedItems.splice(newIndex, 0, movedItem);

    // Update sort_order for all items
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      sort_order: index,
    }));

    setListItems(updatedItems);

    // Send update to server
    try {
      await onReorderItems(updatedItems);
    } catch (error) {
      // Revert on error
      setListItems(listItems);
      console.error("Failed to reorder items:", error);
    }
  };

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      case "uncommon":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200";
      case "rare":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200";
      case "very-rare":
        return "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200";
      case "legendary":
        return "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200";
      case "artifact":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* List Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              List Items ({listItems.length})
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddItems(!showAddItems)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Items
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {listItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium mb-1">No items in this list</p>
              <p className="text-sm">Add magic items to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {listItems.map((listItem, index) => (
                <div
                  key={listItem.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                >
                  {onReorderItems && listItems.length > 1 && (
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveItem(index, "up")}
                        disabled={index === 0 || isLoading}
                        className="h-6 w-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label="Move up"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveItem(index, "down")}
                        disabled={index === listItems.length - 1 || isLoading}
                        className="h-6 w-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label="Move down"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {listItem.magicItem?.name || "Unknown Item"}
                        </h4>
                        {listItem.magicItem?.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">
                            {listItem.magicItem.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(listItem.id)}
                        disabled={isLoading}
                        className="h-8 w-8 text-gray-400 hover:text-red-600 shrink-0"
                        aria-label="Remove item"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      {listItem.magicItem?.type && (
                        <Badge variant="outline" className="text-xs">
                          {listItem.magicItem.type}
                        </Badge>
                      )}
                      {listItem.magicItem?.rarity && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            getRarityColor(listItem.magicItem.rarity)
                          )}
                        >
                          {listItem.magicItem.rarity}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Added {new Date(listItem.added_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Items Section */}
      {showAddItems && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Items to List</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search available items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {availableItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-1">
                  {searchQuery ? "No items found" : "All items added"}
                </p>
                <p className="text-sm">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "All available magic items are already in this list"}
                </p>
              </div>
            ) : (
              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {availableItems.slice(0, 20).map((item) => (
                  <div
                    key={item.slug}
                    className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.type && (
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        )}
                        {item.rarity && (
                          <Badge
                            variant="secondary"
                            className={cn("text-xs", getRarityColor(item.rarity))}
                          >
                            {item.rarity}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddItem(item.slug)}
                      disabled={isLoading}
                      className="shrink-0"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}

                {availableItems.length > 20 && (
                  <div className="text-center py-2 text-sm text-gray-500 dark:text-gray-400">
                    Showing first 20 items. Use search to find specific items.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}