"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Plus, List as ListIcon, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { DieSize } from "@/types/tables";
import Link from "next/link";

interface UserList {
  id: string;
  name: string;
  description?: string;
  itemCount: number;
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
  const [fillStrategy, setFillStrategy] = useState<"auto" | "manual" | "blank">("auto");
  const [sourceListId, setSourceListId] = useState<string | null>(null);
  const [userLists, setUserLists] = useState<UserList[]>([]);
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
        const lists = await response.json();
        setUserLists(lists);
      }
    } catch (error) {
      console.error("Error fetching user lists:", error);
    } finally {
      setListsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);

      // Create the table data structure
      const tableData = {
        rolls: [],
        metadata: {
          generatedAt: new Date().toISOString(),
          sourceListName: sourceListId ? userLists.find(l => l.id === sourceListId)?.name : undefined,
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
        const table = await response.json();
        router.push(`/tables/${table.id}`);
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
        <RadioGroup value={fillStrategy} onValueChange={(value: "auto" | "manual" | "blank") => setFillStrategy(value)}>
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

      {/* Source List Selection (only for auto fill) */}
      {fillStrategy === "auto" && (
        <div className="space-y-4">
          <Label>Source List</Label>
          {listsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          ) : userLists.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <ListIcon className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-center mb-4">
                  You don&apos;t have any lists yet. Create a list first to use as a source for your table.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/lists">
                    <Plus className="mr-2 h-4 w-4" />
                    Create List
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
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
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Select a list to use as the source for auto-filling your table
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading || (fillStrategy === "auto" && !sourceListId)}>
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
    </form>
  );
}