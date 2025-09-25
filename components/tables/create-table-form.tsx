"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Plus, List as ListIcon, Shuffle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { DieSize } from "@/types/tables";
import { MagicItem } from "@/types/magic-items";
import Link from "next/link";

interface UserList {
  id: string;
  name: string;
  description?: string;
  itemCount: number;
}

interface SelectedMagicItem {
  slug: string;
  name: string;
  description?: string;
  rarity: string;
  type: string;
}

const dieSizes: { value: DieSize; label: string; icon: React.ReactNode }[] = [
  { value: 4, label: "d4", icon: <Dice1 className="h-5 w-5" /> },
  { value: 6, label: "d6", icon: <Dice2 className="h-5 w-5" /> },
  { value: 8, label: "d8", icon: <Dice3 className="h-5 w-5" /> },
  { value: 10, label: "d10", icon: <Dice4 className="h-5 w-5" /> },
  { value: 12, label: "d12", icon: <Dice5 className="h-5 w-5" /> },
  { value: 20, label: "d20", icon: <Dice6 className="h-5 w-5" /> },
  { value: 100, label: "d100", icon: <Dice6 className="h-5 w-5" /> },
];

const fillStrategies = [
  {
    value: "auto" as const,
    label: "Auto Fill",
    description: "Automatically fill table with items from selected source",
  },
  {
    value: "custom" as const,
    label: "Custom Selection",
    description: "Choose specific magic items to include in the table",
  },
  {
    value: "manual" as const,
    label: "Manual Fill",
    description: "Create empty table and manually add items",
  },
  {
    value: "blank" as const,
    label: "Blank Table",
    description: "Create completely empty table for custom content",
  },
];

export function CreateTableForm() {
  const [name, setName] = useState("");
  const [dieSize, setDieSize] = useState<DieSize>(20);
  const [fillStrategy, setFillStrategy] = useState<"auto" | "custom" | "manual" | "blank">("auto");
  const [sourceListId, setSourceListId] = useState<string | null>("master"); // Default to master list
  const [userLists, setUserLists] = useState<UserList[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedMagicItem[]>([]);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<MagicItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listsLoading, setListsLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchUserLists();
    }
  }, [user]);

  const fetchUserLists = async () => {
    try {
      setListsLoading(true);
      const response = await fetch("/api/lists");
      if (response.ok) {
        const data = await response.json();
        setUserLists(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error("Error fetching user lists:", error);
    } finally {
      setListsLoading(false);
    }
  };

  const searchItems = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const params = new URLSearchParams();
      params.append("search", query.trim());

      const response = await fetch(`/api/magic-items?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(Array.isArray(data.data?.data) ? data.data.data : []);
      }
    } catch (error) {
      console.error("Error searching items:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const addSelectedItem = (item: MagicItem) => {
    const selectedItem: SelectedMagicItem = {
      slug: item.slug,
      name: item.name,
      description: item.description,
      rarity: item.rarity,
      type: item.type,
    };

    if (!selectedItems.find(i => i.slug === item.slug)) {
      setSelectedItems(prev => [...prev, selectedItem]);
    }
  };

  const removeSelectedItem = (slug: string) => {
    setSelectedItems(prev => prev.filter(i => i.slug !== slug));
  };

  const generateCustomRolls = () => {
    if (selectedItems.length === 0) return [];

    const rolls = [];
    for (let i = 1; i <= dieSize; i++) {
      const itemIndex = (i - 1) % selectedItems.length;
      const selectedItem = selectedItems[itemIndex];

      rolls.push({
        roll: i,
        magicItemId: selectedItem.slug,
        customText: null,
      });
    }

    return rolls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Validate custom selection
    if (fillStrategy === "custom" && selectedItems.length === 0) {
      alert("Please select at least one magic item for your custom table.");
      return;
    }

    try {
      setLoading(true);

      // Create the table data structure
      const tableData = {
        rolls: fillStrategy === "custom" ? generateCustomRolls() : [],
        metadata: {
          generatedAt: new Date().toISOString(),
          sourceListName: fillStrategy === "custom"
            ? `Custom Selection (${selectedItems.length} items)`
            : sourceListId === "master"
              ? "All Magic Items"
              : (sourceListId ? userLists.find(l => l.id === sourceListId)?.name : undefined),
          fillStrategy,
        },
      };

      const response = await fetch("/api/roll-tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          dieSize,
          sourceListId: fillStrategy === "auto" ? sourceListId : null,
          tableData,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/tables/${result.data.id}`);
      } else {
        throw new Error("Failed to create table");
      }
    } catch (error) {
      console.error("Error creating table:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Dice6 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Sign in to create tables</h3>
        <p className="text-muted-foreground mb-6">
          Create an account to generate custom roll tables for your games.
        </p>
        <Button asChild>
          <Link href="/auth/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Table Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Table Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Combat Magic Items, Utility Items"
          required
        />
        <p className="text-sm text-muted-foreground">
          Give your roll table a descriptive name
        </p>
      </div>

      {/* Die Size Selection */}
      <div className="space-y-4">
        <Label>Die Size</Label>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
          {dieSizes.map((die) => (
            <button
              key={die.value}
              type="button"
              onClick={() => setDieSize(die.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${
                dieSize === die.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-muted border-border"
              }`}
            >
              {die.icon}
              <span className="text-sm font-medium">{die.label}</span>
              <span className="text-xs opacity-70">{die.value} entries</span>
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Choose the die size for your table. This determines how many entries the table will have.
        </p>
      </div>

      {/* Fill Strategy */}
      <div className="space-y-4">
        <Label>Fill Strategy</Label>
        <RadioGroup value={fillStrategy} onValueChange={(value: "auto" | "custom" | "manual" | "blank") => setFillStrategy(value)}>
          <div className="space-y-3">
            {fillStrategies.map((strategy) => (
              <div key={strategy.value} className="flex items-start space-x-3">
                <RadioGroupItem value={strategy.value} id={strategy.value} className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor={strategy.value} className="text-base font-medium cursor-pointer">
                    {strategy.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{strategy.description}</p>
                </div>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      {/* Source Selection (optional for auto fill) */}
      {fillStrategy === "auto" && (
        <div className="space-y-4">
          <Label>Source (Optional)</Label>
          <div className="space-y-3">
            {/* Default Master List Option */}
            <button
              type="button"
              onClick={() => setSourceListId("master")}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                sourceListId === "master"
                  ? "bg-primary/10 border-primary"
                  : "hover:bg-muted border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">All Magic Items</h4>
                  <p className="text-sm text-muted-foreground mt-1">Use the complete master list of magic items</p>
                </div>
                <Badge variant="secondary">Master List</Badge>
              </div>
            </button>

            {/* User Lists */}
            {listsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                ))}
              </div>
            ) : userLists.length > 0 ? (
              <>
                <div className="text-sm text-muted-foreground font-medium">Your Lists</div>
                {userLists.map((list) => (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => setSourceListId(list.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      sourceListId === list.id
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{list.name}</h4>
                        {list.description && (
                          <p className="text-sm text-muted-foreground mt-1">{list.description}</p>
                        )}
                      </div>
                      <Badge variant="secondary">
                        {list.itemCount} item{list.itemCount !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                </button>
                ))}
              </>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            Choose a source for auto-filling your table. Defaults to all magic items.
          </p>
        </div>
      )}

      {/* Custom Item Selection */}
      {fillStrategy === "custom" && (
        <div className="space-y-4">
          <Label>Select Magic Items</Label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Choose specific magic items to include in your table.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowItemSelector(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Items
              </Button>
            </div>

            {/* Selected Items Display */}
            {selectedItems.length > 0 && (
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Selected Items ({selectedItems.length})</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedItems([])}
                  >
                    Clear All
                  </Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedItems.map((item) => (
                    <div
                      key={item.slug}
                      className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{item.name}</span>
                        <div className="flex gap-1 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {item.rarity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedItems(prev =>
                          prev.filter(i => i.slug !== item.slug)
                        )}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedItems.length === 0 && (
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                <p className="text-muted-foreground">
                  No items selected. Click "Add Items" to choose magic items for your table.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>
          ) : (
            <Shuffle className="mr-2 h-4 w-4" />
          )}
          {loading ? "Creating..." : "Create Table"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/">Cancel</Link>
        </Button>
      </div>
      {/* Item Selection Dialog */}\n      <Dialog open={showItemSelector} onOpenChange={setShowItemSelector}>\n        <DialogContent className=\"sm:max-w-[600px] max-h-[80vh] flex flex-col\">\n          <DialogHeader>\n            <DialogTitle>Select Magic Items</DialogTitle>\n            <DialogDescription>\n              Search and select specific magic items to include in your roll table.\n            </DialogDescription>\n          </DialogHeader>\n\n          <div className=\"flex-1 flex flex-col gap-4 min-h-0\">\n            {/* Search */}\n            <div className=\"relative\">\n              <Search className=\"absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground\" />\n              <Input\n                placeholder=\"Search magic items...\"\n                value={searchTerm}\n                onChange={(e) => {\n                  setSearchTerm(e.target.value);\n                  searchItems(e.target.value);\n                }}\n                className=\"pl-10\"\n              />\n            </div>\n\n            {/* Results */}\n            <div className=\"flex-1 overflow-y-auto min-h-0\">\n              {searching ? (\n                <div className=\"flex items-center justify-center py-8\">\n                  <div className=\"animate-spin rounded-full h-6 w-6 border-b-2 border-primary\"></div>\n                </div>\n              ) : searchResults.length === 0 ? (\n                <div className=\"text-center py-8\">\n                  <p className=\"text-muted-foreground\">\n                    {searchTerm ? \"No items found matching your search.\" : \"Start typing to search for items.\"}\n                  </p>\n                </div>\n              ) : (\n                <div className=\"space-y-2\">\n                  {searchResults.map((item) => {\n                    const isSelected = selectedItems.find(i => i.slug === item.slug);\n                    return (\n                      <div\n                        key={item.slug}\n                        className={`flex items-start justify-between p-3 border rounded-lg transition-colors ${\n                          isSelected\n                            ? \"bg-primary/10 border-primary\"\n                            : \"hover:bg-muted/50 border-border\"\n                        }`}\n                      >\n                        <div className=\"flex-1 min-w-0\">\n                          <h4 className=\"font-medium truncate\">{item.name}</h4>\n                          <div className=\"flex gap-2 mt-1 mb-2\">\n                            {item.rarity !== \"unknown\" && (\n                              <Badge variant=\"outline\" className=\"text-xs\">\n                                {item.rarity}\n                              </Badge>\n                            )}\n                            {item.type !== \"unknown\" && (\n                              <Badge variant=\"outline\" className=\"text-xs\">\n                                {item.type}\n                              </Badge>\n                            )}\n                          </div>\n                          <p className=\"text-sm text-muted-foreground line-clamp-2\">\n                            {item.description}\n                          </p>\n                        </div>\n                        <Button\n                          size=\"sm\"\n                          variant={isSelected ? \"secondary\" : \"outline\"}\n                          onClick={() => {\n                            if (isSelected) {\n                              removeSelectedItem(item.slug);\n                            } else {\n                              addSelectedItem(item);\n                            }\n                          }}\n                          className=\"ml-3 flex-shrink-0\"\n                        >\n                          {isSelected ? \"Remove\" : \"Add\"}\n                        </Button>\n                      </div>\n                    );\n                  })}\n                </div>\n              )}\n            </div>\n          </div>\n\n          <div className=\"flex justify-between items-center pt-4 border-t\">\n            <div className=\"text-sm text-muted-foreground\">\n              {selectedItems.length} item{selectedItems.length !== 1 ? \"s\" : \"\"} selected\n            </div>\n            <div className=\"flex gap-2\">\n              <Button variant=\"outline\" onClick={() => setShowItemSelector(false)}>\n                Done\n              </Button>\n            </div>\n          </div>\n        </DialogContent>\n      </Dialog>\n    </form>
  );
}