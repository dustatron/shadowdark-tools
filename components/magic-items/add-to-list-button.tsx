"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

interface AddToListButtonProps {
  itemSlug: string;
}

export function AddToListButton({ itemSlug }: AddToListButtonProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleAddToList = async (listId?: string) => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (!listId) {
      // Redirect to lists page to create or select a list
      router.push(`/lists?add=${itemSlug}`);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/lists/${listId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemSlug }),
      });

      if (response.ok) {
        // Show success feedback
        // TODO: Add toast notification
      }
    } catch (error) {
      console.error("Error adding item to list:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Button onClick={() => router.push("/auth/login")} disabled={loading}>
        <Plus className="h-4 w-4 mr-2" />
        Add to List
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          Add to List
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleAddToList()}>
          Choose List...
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAddToList()}>
          Create New List
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}