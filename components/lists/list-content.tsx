"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit2, Plus, Share, Trash2, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { AddItemToListDialog } from "./add-item-to-list-dialog";
import { MagicItem, MagicItemType, MagicItemRarity } from "@/types/magic-items";

interface ListData {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  items: MagicItem[];
}

interface ListContentProps {
  listId: string;
  addItemSlug?: string;
}

const typeLabels: Record<MagicItemType, string> = {
  weapon: "Weapon",
  armor: "Armor",
  accessory: "Accessory",
  consumable: "Consumable",
  artifact: "Artifact",
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

export function ListContent({ listId, addItemSlug }: ListContentProps) {
  const [list, setList] = useState<ListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchList();
    } else {
      setLoading(false);
    }
  }, [user, listId]);

  useEffect(() => {
    if (addItemSlug && list) {
      handleAddItem(addItemSlug);
    }
  }, [addItemSlug, list]);

  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/lists/${listId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("List not found");
        }
        throw new Error("Failed to fetch list");
      }

      const data = await response.json();
      setList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (itemSlug: string) => {
    if (!list) return;

    try {
      const response = await fetch(`/api/lists/${listId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemSlug }),
      });

      if (response.ok) {
        // Refresh the list to show the new item
        await fetchList();
        // Remove the add parameter from URL
        router.replace(`/lists/${listId}`);
      }
    } catch (error) {
      console.error("Error adding item to list:", error);
    }
  };

  const removeItem = async (itemSlug: string) => {
    if (!confirm("Remove this item from the list?")) return;

    try {
      const response = await fetch(`/api/lists/${listId}/items`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemSlug }),
      });

      if (response.ok) {
        setList(prev => prev ? {
          ...prev,
          items: prev.items.filter(item => item.slug !== itemSlug)
        } : null);
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const shareList = () => {
    // TODO: Implement sharing functionality
    navigator.clipboard?.writeText(window.location.href);
    // Show success message
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">Sign in required</h3>
        <p className="text-muted-foreground mb-6">
          You need to be signed in to view this list.
        </p>
        <Button asChild>
          <Link href="/auth/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
            <div className="h-5 bg-muted rounded w-48 animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 bg-muted rounded w-24 animate-pulse"></div>
            <div className="h-10 bg-muted rounded w-28 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !list) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">
          {error || "List not found"}
        </p>
        <Button asChild>
          <Link href="/lists">Back to Lists</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* List Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{list.name}</h1>
          {list.description && (
            <p className="text-muted-foreground">{list.description}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">
              {list.items.length} item{list.items.length !== 1 ? "s" : ""}
            </Badge>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Updated {new Date(list.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={shareList}>
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
          <AddItemToListDialog listId={listId} onItemAdded={fetchList}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </AddItemToListDialog>
          <Button variant="outline" asChild>
            <Link href={`/lists/${listId}/edit`}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Add Item Success Message */}
      {addItemSlug && (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-800 dark:text-green-200">
            Item successfully added to the list!
          </p>
        </div>
      )}

      {/* Items Grid */}
      {list.items.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">No items yet</h3>
          <p className="text-muted-foreground mb-6">
            Add some magic items to get started.
          </p>
          <AddItemToListDialog listId={listId} onItemAdded={fetchList}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add First Item
            </Button>
          </AddItemToListDialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.items.map((item) => (
            <Card key={item.slug} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-base leading-tight">
                    <Link
                      href={`/items/${item.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {item.name}
                    </Link>
                  </CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    {item.rarity !== "unknown" && (
                      <Badge className={`text-xs ${rarityColors[item.rarity]}`}>
                        {rarityLabels[item.rarity]}
                      </Badge>
                    )}
                    {item.type !== "unknown" && (
                      <Badge variant="outline" className="text-xs">
                        {typeLabels[item.type]}
                      </Badge>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      •••
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                      <Link href={`/items/${item.slug}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => removeItem(item.slug)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove from List
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
          ))}
        </div>
      )}
    </div>
  );
}