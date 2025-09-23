"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Dice6,
  Plus,
  Trash2,
  RefreshCw,
  Settings,
  ChevronDown,
  AlertCircle,
  Wand2,
  List as ListIcon,
} from "lucide-react";
import {
  DieSize,
  RollTableData,
  RollTableRow,
  CreateRollTableRequest,
} from "@/types/tables";
import { MagicItem } from "@/types/magic-items";
import { ListWithItems } from "@/types/api";

interface RollTableGeneratorProps {
  availableLists?: ListWithItems[];
  magicItems?: MagicItem[];
  onGenerate: (request: CreateRollTableRequest) => Promise<void>;
  isGenerating?: boolean;
  className?: string;
}

const DIE_SIZES: DieSize[] = [4, 6, 8, 10, 12, 20, 100];

const FILL_STRATEGIES = [
  { value: "auto", label: "Auto-fill", description: "Randomly assign items to fill the table" },
  { value: "manual", label: "Manual", description: "Leave entries empty for manual editing" },
  { value: "blank", label: "Blank", description: "Create an empty table" },
] as const;

export function RollTableGenerator({
  availableLists = [],
  magicItems = [],
  onGenerate,
  isGenerating = false,
  className,
}: RollTableGeneratorProps) {
  const [tableName, setTableName] = useState("");
  const [selectedDieSize, setSelectedDieSize] = useState<DieSize>(20);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [fillStrategy, setFillStrategy] = useState<"auto" | "manual" | "blank">("auto");
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [customEntries, setCustomEntries] = useState<{ roll: number; text: string }[]>([]);
  const [previewRows, setPreviewRows] = useState<RollTableRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Get selected list items
  const selectedList = availableLists.find((list) => list.id === selectedListId);
  const sourceItems = selectedList?.items?.map((item) => item.magic_item_id) || [];

  // Generate preview when settings change
  useEffect(() => {
    if (fillStrategy === "blank") {
      setPreviewRows([]);
      return;
    }

    if (fillStrategy === "manual") {
      const manualRows: RollTableRow[] = [];
      for (let i = 1; i <= selectedDieSize; i++) {
        const customEntry = customEntries.find((entry) => entry.roll === i);
        manualRows.push({
          roll: i,
          magicItemId: null,
          customText: customEntry?.text || undefined,
        });
      }
      setPreviewRows(manualRows);
      return;
    }

    if (fillStrategy === "auto" && sourceItems.length > 0) {
      const autoRows = generateAutoRows();
      setPreviewRows(autoRows);
    } else {
      setPreviewRows([]);
    }
  }, [selectedDieSize, sourceItems, fillStrategy, allowDuplicates, customEntries]);

  const generateAutoRows = (): RollTableRow[] => {
    const rows: RollTableRow[] = [];
    const availableItems = [...sourceItems];

    for (let i = 1; i <= selectedDieSize; i++) {
      let magicItemId = null;

      if (availableItems.length > 0) {
        if (allowDuplicates || availableItems.length >= selectedDieSize - i + 1) {
          // Random selection
          const randomIndex = Math.floor(Math.random() * availableItems.length);
          magicItemId = availableItems[randomIndex];

          if (!allowDuplicates) {
            availableItems.splice(randomIndex, 1);
          }
        } else {
          // Not enough items, leave empty
          magicItemId = null;
        }
      }

      rows.push({
        roll: i,
        magicItemId,
        customText: undefined,
      });
    }

    return rows;
  };

  const handleAddCustomEntry = () => {
    const nextRoll = Math.max(0, ...customEntries.map((e) => e.roll), 0) + 1;
    if (nextRoll <= selectedDieSize) {
      setCustomEntries([...customEntries, { roll: nextRoll, text: "" }]);
    }
  };

  const handleUpdateCustomEntry = (index: number, field: "roll" | "text", value: string | number) => {
    const updated = [...customEntries];
    updated[index] = { ...updated[index], [field]: value };
    setCustomEntries(updated);
  };

  const handleRemoveCustomEntry = (index: number) => {
    setCustomEntries(customEntries.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!tableName.trim()) return;

    const tableData: RollTableData = {
      rolls: showPreview ? previewRows : [],
      metadata: {
        generatedAt: new Date().toISOString(),
        sourceListName: selectedList?.name,
        fillStrategy,
      },
    };

    const request: CreateRollTableRequest = {
      name: tableName.trim(),
      dieSize: selectedDieSize,
      sourceListId: selectedListId || undefined,
      tableData,
    };

    await onGenerate(request);
  };

  const canGenerate = tableName.trim().length > 0;
  const hasSourceItems = sourceItems.length > 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Basic Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Table Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="table-name">Table Name</Label>
            <Input
              id="table-name"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="Enter table name..."
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Die Size</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between h-11">
                    <div className="flex items-center gap-2">
                      <Dice6 className="h-4 w-4" />
                      d{selectedDieSize}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40">
                  <DropdownMenuLabel>Select Die Size</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={selectedDieSize.toString()}
                    onValueChange={(value) => setSelectedDieSize(parseInt(value) as DieSize)}
                  >
                    {DIE_SIZES.map((size) => (
                      <DropdownMenuRadioItem key={size} value={size.toString()}>
                        d{size}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <Label>Source List (Optional)</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between h-11">
                    <div className="flex items-center gap-2">
                      <ListIcon className="h-4 w-4" />
                      {selectedList?.name || "Select a list..."}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64">
                  <DropdownMenuLabel>Choose Source List</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={selectedListId}
                    onValueChange={setSelectedListId}
                  >
                    <DropdownMenuRadioItem value="">
                      None (manual entry)
                    </DropdownMenuRadioItem>
                    {availableLists.map((list) => (
                      <DropdownMenuRadioItem key={list.id} value={list.id}>
                        <div className="flex flex-col gap-1">
                          <span>{list.name}</span>
                          <span className="text-xs text-gray-500">
                            {list.itemCount || list.items?.length || 0} items
                          </span>
                        </div>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fill Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fill Strategy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {FILL_STRATEGIES.map((strategy) => (
              <label
                key={strategy.value}
                className={cn(
                  "flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer transition-colors",
                  fillStrategy === strategy.value
                    ? "bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700"
                    : "hover:bg-gray-50 dark:hover:bg-gray-900"
                )}
              >
                <input
                  type="radio"
                  name="fillStrategy"
                  value={strategy.value}
                  checked={fillStrategy === strategy.value}
                  onChange={(e) => setFillStrategy(e.target.value as typeof fillStrategy)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {strategy.label}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {strategy.description}
                  </div>
                </div>
              </label>
            ))}
          </div>

          {fillStrategy === "auto" && hasSourceItems && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allow-duplicates"
                  checked={allowDuplicates}
                  onCheckedChange={setAllowDuplicates}
                />
                <Label htmlFor="allow-duplicates" className="text-sm">
                  Allow duplicate items
                </Label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                If disabled, each item will appear at most once
              </p>
            </div>
          )}

          {fillStrategy === "auto" && !hasSourceItems && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="text-sm">
                Select a source list to auto-fill the table
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Entries (for manual strategy) */}
      {fillStrategy === "manual" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Custom Entries</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddCustomEntry}
                disabled={customEntries.length >= selectedDieSize}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Entry
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {customEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Wand2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-1">No custom entries</p>
                <p className="text-sm">Add entries to customize specific roll results</p>
              </div>
            ) : (
              <div className="space-y-3">
                {customEntries.map((entry, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-20">
                      <Input
                        type="number"
                        min={1}
                        max={selectedDieSize}
                        value={entry.roll}
                        onChange={(e) =>
                          handleUpdateCustomEntry(index, "roll", parseInt(e.target.value))
                        }
                        className="text-center"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        value={entry.text}
                        onChange={(e) =>
                          handleUpdateCustomEntry(index, "text", e.target.value)
                        }
                        placeholder="Custom result text..."
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCustomEntry(index)}
                      className="h-9 w-9 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {fillStrategy !== "blank" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Preview ({previewRows.length} entries)
              </CardTitle>
              <div className="flex gap-2">
                {fillStrategy === "auto" && hasSourceItems && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newRows = generateAutoRows();
                      setPreviewRows(newRows);
                    }}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Regenerate
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  {showPreview ? "Hide" : "Show"} Preview
                </Button>
              </div>
            </div>
          </CardHeader>
          {showPreview && (
            <CardContent>
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium">Roll</th>
                      <th className="text-left py-2 px-3 font-medium">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row) => {
                      const magicItem = magicItems.find((item) => item.slug === row.magicItemId);
                      const isEmpty = !row.magicItemId && !row.customText;

                      return (
                        <tr
                          key={row.roll}
                          className="border-b border-gray-100 dark:border-gray-800"
                        >
                          <td className="py-2 px-3">
                            <Badge variant="secondary" className="font-mono text-xs">
                              {row.roll}
                            </Badge>
                          </td>
                          <td className="py-2 px-3">
                            {isEmpty ? (
                              <span className="text-gray-400 dark:text-gray-500 italic">
                                Empty
                              </span>
                            ) : (
                              <span className="text-gray-900 dark:text-gray-100">
                                {magicItem?.name || row.customText}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Generate Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleGenerate}
          disabled={!canGenerate || isGenerating}
          size="lg"
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Dice6 className="h-4 w-4" />
              Generate Table
            </>
          )}
        </Button>
      </div>
    </div>
  );
}