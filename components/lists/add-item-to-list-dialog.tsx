"use client";

import { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MagicItem, MagicItemType, MagicItemRarity } from "@/types/magic-items";

interface AddItemToListDialogProps {
  listId: string;
  children: React.ReactNode;
  onItemAdded?: () => void;
}

const rarityColors: Record<MagicItemRarity, string> = {
  common: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  uncommon: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200",
  rare: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200",
  "very-rare": "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200",
  legendary: "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200",
  artifact: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200",
  unknown: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export function AddItemToListDialog({ listId, children, onItemAdded }: AddItemToListDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<MagicItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingItems, setAddingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open && searchTerm) {
      const timeoutId = setTimeout(searchItems, 300);
      return () => clearTimeout(timeoutId);
    } else if (open && !searchTerm) {
      // Load initial items when dialog opens
      searchItems();
    }
  }, [searchTerm, open]);

  const searchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/magic-items?${params}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.data || []);
      }
    } catch (error) {
      console.error("Error searching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const addItemToList = async (itemSlug: string) => {
    try {
      setAddingItems(prev => new Set(prev).add(itemSlug));
      const response = await fetch(`/api/lists/${listId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemSlug }),
      });

      if (response.ok) {
        onItemAdded?.();
        // Show success feedback - could add toast here
      }
    } catch (error) {
      console.error("Error adding item:", error);
    } finally {
      setAddingItems(prev => {
        const next = new Set(prev);
        next.delete(itemSlug);
        return next;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Items to List</DialogTitle>
          <DialogDescription>
            Search for magic items to add to your list.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search magic items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm ? "No items found matching your search." : "Start typing to search for items."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.slug}
                    className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.name}</h4>
                      <div className="flex gap-2 mt-1 mb-2">
                        {item.rarity !== "unknown" && (
                          <Badge className={`text-xs ${rarityColors[item.rarity]}`}>
                            {item.rarity}
                          </Badge>
                        )}
                        {item.type !== "unknown" && (
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addItemToList(item.slug)}
                      disabled={addingItems.has(item.slug)}
                      className="ml-3 flex-shrink-0"
                    >
                      {addingItems.has(item.slug) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}