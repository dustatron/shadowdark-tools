"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { MagicItem, MagicItemWithMetadata } from "@/types/magic-items";

interface MagicItemCardProps {
  item: MagicItem | MagicItemWithMetadata;
  onAddToList?: (item: MagicItem) => void;
  onToggleFavorite?: (item: MagicItem) => void;
  onRemoveFromList?: (item: MagicItem) => void;
  showAddToList?: boolean;
  showFavoriteToggle?: boolean;
  showRemoveFromList?: boolean;
  isInList?: boolean;
  isFavorite?: boolean;
  className?: string;
}

export function MagicItemCard({
  item,
  onAddToList,
  onToggleFavorite,
  onRemoveFromList,
  showAddToList = true,
  showFavoriteToggle = true,
  showRemoveFromList = false,
  isInList = false,
  isFavorite = false,
  className,
}: MagicItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToList = async () => {
    if (!onAddToList) return;
    setIsLoading(true);
    try {
      await onAddToList(item);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!onToggleFavorite) return;
    setIsLoading(true);
    try {
      await onToggleFavorite(item);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromList = async () => {
    if (!onRemoveFromList) return;
    setIsLoading(true);
    try {
      await onRemoveFromList(item);
    } finally {
      setIsLoading(false);
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

  const getTypeColor = (type?: string) => {
    switch (type) {
      case "weapon":
        return "bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300";
      case "armor":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "accessory":
        return "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "consumable":
        return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "artifact":
        return "bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <Card className={cn("group transition-all hover:shadow-md", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight">{item.name}</CardTitle>
          <div className="flex items-center gap-1 shrink-0">
            {showFavoriteToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavorite}
                disabled={isLoading}
                className={cn(
                  "h-8 w-8 transition-colors",
                  isFavorite
                    ? "text-red-500 hover:text-red-600"
                    : "text-gray-400 hover:text-red-500"
                )}
                aria-label={
                  isFavorite ? "Remove from favorites" : "Add to favorites"
                }
              >
                <Heart
                  className={cn("h-4 w-4", isFavorite && "fill-current")}
                />
              </Button>
            )}
            {showAddToList && !isInList && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleAddToList}
                disabled={isLoading}
                className="h-8 w-8 text-gray-400 hover:text-green-600"
                aria-label="Add to list"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            {showRemoveFromList && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFromList}
                disabled={isLoading}
                className="text-xs text-gray-500 hover:text-red-600"
              >
                Remove
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {item.type && (
            <Badge variant="secondary" className={getTypeColor(item.type)}>
              {item.type}
            </Badge>
          )}
          {item.rarity && (
            <Badge variant="secondary" className={getRarityColor(item.rarity)}>
              {item.rarity}
            </Badge>
          )}
          {item.category && (
            <Badge variant="outline" className="text-xs">
              {item.category}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div
          className={cn(
            "text-sm text-gray-600 dark:text-gray-300",
            !isExpanded && "line-clamp-3"
          )}
        >
          {item.description}
        </div>

        {item.description.length > 150 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 h-auto p-0 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Show more
              </>
            )}
          </Button>
        )}

        {item.traits && item.traits.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Traits:
            </h4>
            {item.traits.map((trait, index) => (
              <div key={index} className="border-l-2 border-blue-200 pl-3">
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {trait.name}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {trait.description}
                </div>
              </div>
            ))}
          </div>
        )}

        {"addedAt" in item && item.addedAt && (
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Added {new Date(item.addedAt).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}