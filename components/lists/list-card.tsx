"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Heart,
  MoreVertical,
  Edit3,
  Trash2,
  Share2,
  Dice6,
  Star,
  Calendar,
  Package,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ListWithItems } from "@/types/api";

interface ListCardProps {
  list: ListWithItems;
  onEdit?: (list: ListWithItems) => void;
  onDelete?: (list: ListWithItems) => void;
  onShare?: (list: ListWithItems) => void;
  onCreateRollTable?: (list: ListWithItems) => void;
  onToggleFavorite?: (list: ListWithItems) => void;
  showActions?: boolean;
  className?: string;
}

export function ListCard({
  list,
  onEdit,
  onDelete,
  onShare,
  onCreateRollTable,
  onToggleFavorite,
  showActions = true,
  className,
}: ListCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const itemCount = list.itemCount ?? list.items?.length ?? 0;
  const isFavoriteList = list.is_favorite_list;

  const handleEdit = async () => {
    if (!onEdit) return;
    setIsLoading(true);
    try {
      await onEdit(list);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsLoading(true);
    try {
      await onDelete(list);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!onShare) return;
    setIsLoading(true);
    try {
      await onShare(list);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRollTable = async () => {
    if (!onCreateRollTable) return;
    setIsLoading(true);
    try {
      await onCreateRollTable(list);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!onToggleFavorite) return;
    setIsLoading(true);
    try {
      await onToggleFavorite(list);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className={cn("group transition-all hover:shadow-md", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg leading-tight truncate">
                <Link
                  href={`/lists/${list.id}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {list.name}
                </Link>
              </CardTitle>
              {isFavoriteList && (
                <Heart className="h-4 w-4 text-red-500 fill-current shrink-0" />
              )}
            </div>
            {list.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {list.description}
              </p>
            )}
          </div>

          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isLoading}
                  aria-label="List actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {onEdit && (
                  <DropdownMenuItem onClick={handleEdit} className="gap-2">
                    <Edit3 className="h-4 w-4" />
                    Edit List
                  </DropdownMenuItem>
                )}

                {onToggleFavorite && (
                  <DropdownMenuItem onClick={handleToggleFavorite} className="gap-2">
                    <Star
                      className={cn(
                        "h-4 w-4",
                        isFavoriteList && "fill-current text-yellow-500"
                      )}
                    />
                    {isFavoriteList ? "Remove from Favorites" : "Add to Favorites"}
                  </DropdownMenuItem>
                )}

                {onShare && (
                  <DropdownMenuItem onClick={handleShare} className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share List
                  </DropdownMenuItem>
                )}

                {onCreateRollTable && itemCount > 0 && (
                  <DropdownMenuItem onClick={handleCreateRollTable} className="gap-2">
                    <Dice6 className="h-4 w-4" />
                    Create Roll Table
                  </DropdownMenuItem>
                )}

                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="gap-2 text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete List
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              <span>
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDate(list.created_at)}</span>
            </div>
          </div>

          {isFavoriteList && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Favorite
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-4">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/lists/${list.id}`}>
              <Package className="h-4 w-4 mr-1" />
              View Items
            </Link>
          </Button>

          {onCreateRollTable && itemCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateRollTable}
              disabled={isLoading}
              className="shrink-0"
            >
              <Dice6 className="h-4 w-4 mr-1" />
              Roll Table
            </Button>
          )}
        </div>

        {/* Last Updated */}
        {list.updated_at !== list.created_at && (
          <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">
            Updated {formatDate(list.updated_at)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}