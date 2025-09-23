"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dice6,
  Share2,
  Download,
  Copy,
  RefreshCw,
  Calendar,
  Hash,
  Eye,
  ExternalLink,
} from "lucide-react";
import { RollTable, RollTableRow } from "@/types/tables";
import { MagicItem } from "@/types/magic-items";

interface RollTableDisplayProps {
  table: RollTable;
  magicItems?: MagicItem[];
  onRoll?: () => void;
  onShare?: () => void;
  onExport?: () => void;
  onEdit?: () => void;
  lastRollResult?: { roll: number; result: string | null };
  showActions?: boolean;
  isPublicView?: boolean;
  className?: string;
}

export function RollTableDisplay({
  table,
  magicItems = [],
  onRoll,
  onShare,
  onExport,
  onEdit,
  lastRollResult,
  showActions = true,
  isPublicView = false,
  className,
}: RollTableDisplayProps) {
  const [copiedRow, setCopiedRow] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  // Get magic item by ID
  const getMagicItem = (magicItemId: string | null): MagicItem | null => {
    if (!magicItemId) return null;
    return magicItems.find((item) => item.slug === magicItemId) || null;
  };

  // Handle roll action
  const handleRoll = async () => {
    if (!onRoll) return;
    setIsRolling(true);
    try {
      await onRoll();
    } finally {
      setTimeout(() => setIsRolling(false), 1000);
    }
  };

  // Copy row content to clipboard
  const handleCopyRow = async (row: RollTableRow) => {
    const magicItem = getMagicItem(row.magicItemId);
    const content = magicItem?.name || row.customText || "Empty";

    try {
      await navigator.clipboard.writeText(content);
      setCopiedRow(row.roll);
      setTimeout(() => setCopiedRow(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // Copy share URL to clipboard
  const handleCopyShareUrl = async () => {
    const url = `${window.location.origin}/tables/shared/${table.shareToken}`;
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to copy share URL:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDieIcon = (dieSize: number) => {
    // Using dice icon for all dice types, could be expanded with specific die icons
    return <Dice6 className="h-4 w-4" />;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Table Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl mb-2">{table.name}</CardTitle>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-1">
                  {getDieIcon(table.dieSize)}
                  <span>d{table.dieSize}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Hash className="h-4 w-4" />
                  <span>{table.tableData.rolls.length} entries</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created {formatDate(table.createdAt)}</span>
                </div>
                {table.isPublic && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <Eye className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                )}
              </div>
            </div>

            {showActions && (
              <div className="flex items-center gap-2 shrink-0">
                {onRoll && (
                  <Button
                    onClick={handleRoll}
                    disabled={isRolling}
                    className={cn(
                      "gap-2",
                      isRolling && "animate-pulse"
                    )}
                  >
                    <RefreshCw className={cn("h-4 w-4", isRolling && "animate-spin")} />
                    Roll
                  </Button>
                )}

                {onShare && !isPublicView && (
                  <Button variant="outline" onClick={onShare} className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                )}

                {onExport && (
                  <Button variant="outline" onClick={onExport} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                )}

                {onEdit && !isPublicView && (
                  <Button variant="outline" onClick={onEdit}>
                    Edit
                  </Button>
                )}
              </div>
            )}
          </div>

          {lastRollResult && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Dice6 className="h-5 w-5" />
                <span className="font-medium">Last Roll: {lastRollResult.roll}</span>
              </div>
              <div className="mt-1 text-blue-600 dark:text-blue-400">
                {lastRollResult.result || "Empty"}
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Roll Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Roll Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    Roll
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    Result
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                    Type
                  </th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {table.tableData.rolls.map((row) => {
                  const magicItem = getMagicItem(row.magicItemId);
                  const isEmpty = !row.magicItemId && !row.customText;
                  const isLastRoll = lastRollResult?.roll === row.roll;

                  return (
                    <tr
                      key={row.roll}
                      className={cn(
                        "border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors",
                        isLastRoll && "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                      )}
                    >
                      <td className="py-3 px-4">
                        <Badge
                          variant={isLastRoll ? "default" : "secondary"}
                          className={cn(
                            "font-mono",
                            isLastRoll && "bg-blue-600 text-white"
                          )}
                        >
                          {row.roll}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {isEmpty ? (
                          <span className="text-gray-400 dark:text-gray-500 italic">
                            Empty
                          </span>
                        ) : (
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {magicItem?.name || row.customText}
                            </div>
                            {magicItem?.description && (
                              <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">
                                {magicItem.description}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {magicItem ? (
                          <div className="flex gap-1">
                            {magicItem.type && (
                              <Badge variant="outline" className="text-xs">
                                {magicItem.type}
                              </Badge>
                            )}
                            {magicItem.rarity && (
                              <Badge variant="secondary" className="text-xs">
                                {magicItem.rarity}
                              </Badge>
                            )}
                          </div>
                        ) : row.customText ? (
                          <Badge variant="outline" className="text-xs">
                            Custom
                          </Badge>
                        ) : null}
                      </td>
                      <td className="py-3 px-4">
                        {!isEmpty && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyRow(row)}
                            className="h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            aria-label="Copy result"
                          >
                            {copiedRow === row.roll ? (
                              <span className="text-xs text-green-600">✓</span>
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Table Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Table Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">Generated:</span>
            <span className="font-mono">
              {formatDate(table.tableData.metadata.generatedAt)}
            </span>
          </div>

          {table.tableData.metadata.sourceListName && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Source List:</span>
              <span className="font-medium">
                {table.tableData.metadata.sourceListName}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">Fill Strategy:</span>
            <Badge variant="outline" className="text-xs">
              {table.tableData.metadata.fillStrategy}
            </Badge>
          </div>

          {table.isPublic && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Share URL:
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyShareUrl}
                  className="gap-2"
                >
                  <Copy className="h-3 w-3" />
                  Copy Link
                </Button>
              </div>
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs font-mono text-gray-600 dark:text-gray-300 break-all">
                {window.location.origin}/tables/shared/{table.shareToken}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}