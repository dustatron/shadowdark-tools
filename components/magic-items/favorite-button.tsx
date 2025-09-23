"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  itemSlug: string;
}

export function FavoriteButton({ itemSlug }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [user, itemSlug]);

  const checkFavoriteStatus = async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/favorites");
      if (response.ok) {
        const favorites = await response.json();
        setIsFavorite(favorites.includes(itemSlug));
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/favorites", {
        method: isFavorite ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemSlug }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isFavorite ? "default" : "outline"}
      onClick={toggleFavorite}
      disabled={loading}
    >
      <Star className={`h-4 w-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
      {isFavorite ? "Favorited" : "Favorite"}
    </Button>
  );
}