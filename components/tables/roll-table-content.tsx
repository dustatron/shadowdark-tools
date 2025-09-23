"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Dice6, Share, Edit2, Copy, ExternalLink, Calendar, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { RollTable, RollTableRow } from "@/types/tables";

interface RollTableContentProps {
  tableId: string;
}

interface RollResult {
  roll: number;
  result: RollTableRow;
  timestamp: Date;
}

export function RollTableContent({ tableId }: RollTableContentProps) {
  const [table, setTable] = useState<RollTable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rollResult, setRollResult] = useState<RollResult | null>(null);
  const [rolling, setRolling] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchTable();
  }, [tableId]);

  const fetchTable = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/roll-tables/${tableId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Table not found");
        }
        throw new Error("Failed to fetch table");
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

  const shareTable = () => {
    if (!table) return;

    const shareUrl = `${window.location.origin}/shared/${table.shareToken}`;
    navigator.clipboard?.writeText(shareUrl);
    // TODO: Show success toast
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
        <p className="text-destructive mb-4">
          {error || "Table not found"}
        </p>
        <Button asChild>
          <Link href="/tables/create">Back to Create Table</Link>
        </Button>
      </div>
    );
  }

  const canEdit = user && table.userId === user.id;

  return (
    <div className="space-y-6">
      {/* Table Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{table.name}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">
              d{table.dieSize}
            </Badge>
            <Badge variant="outline">
              {table.tableData.rolls.length} entries
            </Badge>
            {table.isPublic && (
              <Badge variant="outline">Public</Badge>
            )}
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(table.createdAt).toLocaleDateString()}
            </div>
          </div>
          {table.tableData.metadata.sourceListName && (
            <p className="text-sm text-muted-foreground">
              Generated from list: {table.tableData.metadata.sourceListName}
            </p>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={shareTable} variant="outline">
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button onClick={copyTableText} variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            Copy Text
          </Button>
          {canEdit && (
            <Button variant="outline" asChild>
              <Link href={`/tables/${tableId}/edit`}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}
        </div>
      </div>

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
        <CardHeader>
          <CardTitle>Table Entries</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Roll</TableHead>
                <TableHead>Result</TableHead>
                <TableHead className="w-24">Actions</TableHead>
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

      {/* Share Info */}
      <Card>
        <CardHeader>
          <CardTitle>Share This Table</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Share this table with your group using the link below. Anyone with the link can view and roll on the table.
          </p>
          <div className="flex gap-2">
            <code className="flex-1 p-2 bg-muted rounded text-sm">
              {window.location.origin}/shared/{table.shareToken}
            </code>
            <Button onClick={shareTable} variant="outline">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}