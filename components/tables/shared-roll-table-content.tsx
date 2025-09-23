"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Dice6, ExternalLink, Calendar, Shuffle, Copy, Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RollTable, RollTableRow } from "@/types/tables";

interface SharedRollTableContentProps {
  token: string;
}

interface RollResult {
  roll: number;
  result: RollTableRow;
  timestamp: Date;
}

export function SharedRollTableContent({ token }: SharedRollTableContentProps) {
  const [table, setTable] = useState<RollTable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rollResult, setRollResult] = useState<RollResult | null>(null);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    fetchTable();
  }, [token]);

  const fetchTable = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/roll-tables/shared/${token}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Shared table not found or no longer available");
        }
        throw new Error("Failed to fetch shared table");
      }

      const data = await response.json();
      setTable(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const rollDice = () => {
    if (!table) return;

    setRolling(true);

    // Simulate dice rolling animation delay
    setTimeout(() => {
      const roll = Math.floor(Math.random() * table.dieSize) + 1;
      const result = table.tableData.rolls.find(r => r.roll === roll) || {
        roll,
        magicItemId: null,
        customText: "Empty result",
      };

      setRollResult({
        roll,
        result,
        timestamp: new Date(),
      });
      setRolling(false);
    }, 1000);
  };

  const copyTableText = () => {
    if (!table) return;

    const tableText = [
      `${table.name} (d${table.dieSize})`,
      "",
      ...table.tableData.rolls.map(row =>
        `${row.roll}: ${row.customText || row.magicItemId || "Empty"}`
      ),
    ].join("\n");

    navigator.clipboard?.writeText(tableText);
    // TODO: Show success toast
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !table) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Table Not Found</h3>
        <p className="text-muted-foreground mb-6">
          {error || "This shared table is not available or may have been removed."}
        </p>
        <Button asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Browse Magic Items
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Table Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{table.name}</h1>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <Badge variant="secondary">
              d{table.dieSize}
            </Badge>
            <Badge variant="outline">
              {table.tableData.rolls.length} entries
            </Badge>
            <Badge variant="outline" className="text-green-700 bg-green-50 dark:text-green-300 dark:bg-green-950">
              Shared Table
            </Badge>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Created {new Date(table.createdAt).toLocaleDateString()}
            </div>
          </div>
          {table.tableData.metadata.sourceListName && (
            <p className="text-sm text-muted-foreground mt-2">
              Generated from list: {table.tableData.metadata.sourceListName}
            </p>
          )}
        </div>
      </div>

      {/* Shared Table Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This is a shared roll table. You can view and roll on it, but you cannot edit it.
          {" "}
          <Link href="/" className="underline hover:no-underline">
            Create your own tables
          </Link>
          {" "}
          to customize and manage them.
        </AlertDescription>
      </Alert>

      {/* Roll Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dice6 className="h-5 w-5" />
            Roll the Dice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Button
              onClick={rollDice}
              disabled={rolling}
              size="lg"
              className="min-w-[120px]"
            >
              {rolling ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-background"></div>
              ) : (
                <>
                  <Shuffle className="mr-2 h-4 w-4" />
                  Roll d{table.dieSize}
                </>
              )}
            </Button>
          </div>

          {rollResult && (
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold mb-2">Rolled: {rollResult.roll}</div>
              <div className="text-lg">
                {rollResult.result.magicItemId ? (
                  <Link
                    href={`/items/${rollResult.result.magicItemId}`}
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {rollResult.result.magicItemId}
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="text-muted-foreground">
                    {rollResult.result.customText || "Empty result"}
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Rolled at {rollResult.timestamp.toLocaleTimeString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Table Entries</CardTitle>
          <Button onClick={copyTableText} variant="outline" size="sm">
            <Copy className="mr-2 h-4 w-4" />
            Copy Text
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Roll</TableHead>
                <TableHead>Result</TableHead>
                <TableHead className="w-24">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: table.dieSize }, (_, i) => {
                const roll = i + 1;
                const entry = table.tableData.rolls.find(r => r.roll === roll);

                return (
                  <TableRow key={roll}>
                    <TableCell className="font-medium">{roll}</TableCell>
                    <TableCell>
                      {entry?.magicItemId ? (
                        <Link
                          href={`/items/${entry.magicItemId}`}
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          {entry.magicItemId}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : entry?.customText ? (
                        <span>{entry.customText}</span>
                      ) : (
                        <span className="text-muted-foreground italic">Empty</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {entry?.magicItemId && (
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/items/${entry.magicItemId}`}>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card>
        <CardHeader>
          <CardTitle>Create Your Own Tables</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Want to create and customize your own roll tables? Join Shadowdark Tools to organize magic items,
            create custom lists, and generate personalized roll tables for your games.
          </p>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Explore Magic Items
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tables/create">
                Create Table
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}