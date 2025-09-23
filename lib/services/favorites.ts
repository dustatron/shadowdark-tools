import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database';
import { FavoriteWithMagicItem } from '@/types/api';
import { getMagicItemBySlug } from './magic-items';

// Type aliases for cleaner code
type Favorite = Database['public']['Tables']['favorites']['Row'];
type FavoriteInsert = Database['public']['Tables']['favorites']['Insert'];

export class FavoritesService {
  /**
   * Get all favorites for a user
   */
  static async getUserFavorites(userId: string): Promise<Favorite[]> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch user favorites: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserFavorites:', error);
      throw error;
    }
  }

  /**
   * Get all favorites for a user with magic item details
   */
  static async getUserFavoritesWithItems(userId: string): Promise<FavoriteWithMagicItem[]> {
    try {
      const favorites = await this.getUserFavorites(userId);
      const favoritesWithItems: FavoriteWithMagicItem[] = [];

      for (const favorite of favorites) {
        const magicItem = await getMagicItemBySlug(favorite.magic_item_id);
        if (magicItem) {
          favoritesWithItems.push({
            ...favorite,
            magicItem,
          });
        }
      }

      return favoritesWithItems;
    } catch (error) {
      console.error('Error in getUserFavoritesWithItems:', error);
      throw error;
    }
  }

  /**
   * Get favorites with magic item IDs for easy checking
   */
  static async getUserFavoriteIds(userId: string): Promise<string[]> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('favorites')
        .select('magic_item_id')
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to fetch user favorite IDs: ${error.message}`);
      }

      return (data || []).map(item => item.magic_item_id);
    } catch (error) {
      console.error('Error in getUserFavoriteIds:', error);
      throw error;
    }
  }

  /**
   * Check if a specific magic item is favorited by user
   */
  static async isFavorited(userId: string, magicItemId: string): Promise<boolean> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('magic_item_id', magicItemId)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to check favorite status: ${error.message}`);
      }

      return !!data;
    } catch (error) {
      console.error('Error in isFavorited:', error);
      throw error;
    }
  }

  /**
   * Add a magic item to user's favorites
   */
  static async addToFavorites(userId: string, magicItemId: string): Promise<Favorite> {
    try {
      const supabase = await createClient();

      const favoriteData: FavoriteInsert = {
        user_id: userId,
        magic_item_id: magicItemId
      };

      const { data, error } = await supabase
        .from('favorites')
        .insert(favoriteData)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Item is already in favorites');
        }
        throw new Error(`Failed to add item to favorites: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in addToFavorites:', error);
      throw error;
    }
  }

  /**
   * Remove a magic item from user's favorites
   */
  static async removeFromFavorites(userId: string, magicItemId: string): Promise<void> {
    try {
      const supabase = await createClient();

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('magic_item_id', magicItemId);

      if (error) {
        throw new Error(`Failed to remove item from favorites: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in removeFromFavorites:', error);
      throw error;
    }
  }

  /**
   * Toggle favorite status for a magic item
   */
  static async toggleFavorite(userId: string, magicItemId: string): Promise<{ action: 'added' | 'removed'; favorite?: Favorite }> {
    try {
      const isCurrentlyFavorited = await this.isFavorited(userId, magicItemId);

      if (isCurrentlyFavorited) {
        await this.removeFromFavorites(userId, magicItemId);
        return { action: 'removed' };
      } else {
        const favorite = await this.addToFavorites(userId, magicItemId);
        return { action: 'added', favorite };
      }
    } catch (error) {
      console.error('Error in toggleFavorite:', error);
      throw error;
    }
  }

  /**
   * Get favorite count for a user
   */
  static async getFavoriteCount(userId: string): Promise<number> {
    try {
      const supabase = await createClient();

      const { count, error } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to get favorite count: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getFavoriteCount:', error);
      throw error;
    }
  }

  /**
   * Get recent favorites (last N items)
   */
  static async getRecentFavorites(userId: string, limit: number = 10): Promise<Favorite[]> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch recent favorites: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRecentFavorites:', error);
      throw error;
    }
  }

  /**
   * Bulk add items to favorites
   */
  static async bulkAddToFavorites(userId: string, magicItemIds: string[]): Promise<Favorite[]> {
    try {
      if (magicItemIds.length === 0) {
        return [];
      }

      const supabase = await createClient();

      // Get currently favorited items to avoid duplicates
      const existingFavorites = await this.getUserFavoriteIds(userId);
      const newItemIds = magicItemIds.filter(id => !existingFavorites.includes(id));

      if (newItemIds.length === 0) {
        return [];
      }

      const favoriteData: FavoriteInsert[] = newItemIds.map(magicItemId => ({
        user_id: userId,
        magic_item_id: magicItemId
      }));

      const { data, error } = await supabase
        .from('favorites')
        .insert(favoriteData)
        .select();

      if (error) {
        throw new Error(`Failed to bulk add to favorites: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in bulkAddToFavorites:', error);
      throw error;
    }
  }

  /**
   * Bulk remove items from favorites
   */
  static async bulkRemoveFromFavorites(userId: string, magicItemIds: string[]): Promise<void> {
    try {
      if (magicItemIds.length === 0) {
        return;
      }

      const supabase = await createClient();

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .in('magic_item_id', magicItemIds);

      if (error) {
        throw new Error(`Failed to bulk remove from favorites: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in bulkRemoveFromFavorites:', error);
      throw error;
    }
  }

  /**
   * Clear all favorites for a user
   */
  static async clearAllFavorites(userId: string): Promise<void> {
    try {
      const supabase = await createClient();

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to clear all favorites: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in clearAllFavorites:', error);
      throw error;
    }
  }
}

// Export default functions for easier importing
export const getUserFavorites = FavoritesService.getUserFavorites;
export const getUserFavoritesWithItems = FavoritesService.getUserFavoritesWithItems;
export const getUserFavoriteIds = FavoritesService.getUserFavoriteIds;
export const isFavorited = FavoritesService.isFavorited;
export const addToFavorites = FavoritesService.addToFavorites;
export const removeFromFavorites = FavoritesService.removeFromFavorites;
export const toggleFavorite = FavoritesService.toggleFavorite;
export const getFavoriteCount = FavoritesService.getFavoriteCount;
export const getRecentFavorites = FavoritesService.getRecentFavorites;
export const bulkAddToFavorites = FavoritesService.bulkAddToFavorites;
export const bulkRemoveFromFavorites = FavoritesService.bulkRemoveFromFavorites;
export const clearAllFavorites = FavoritesService.clearAllFavorites;