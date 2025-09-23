import { createClient } from '@/lib/supabase/server';
import {
  List,
  ListItem,
  ListWithItems,
  CreateListRequest,
  UpdateListRequest,
  AddToListRequest
} from '@/types/api';
import { getMagicItemsByIds } from './magic-items';

/**
 * Get all lists for a specific user
 */
export async function getUserLists(userId: string): Promise<List[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('lists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch user lists: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a specific list by ID with its items
 */
export async function getListById(listId: string, userId: string): Promise<ListWithItems | null> {
  const supabase = await createClient();

  // First get the list and verify ownership
  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('*')
    .eq('id', listId)
    .eq('user_id', userId)
    .single();

  if (listError || !list) {
    return null;
  }

  // Get all list items
  const { data: listItems, error: itemsError } = await supabase
    .from('list_items')
    .select('*')
    .eq('list_id', listId)
    .order('sort_order', { ascending: true });

  if (itemsError) {
    throw new Error(`Failed to fetch list items: ${itemsError.message}`);
  }

  // Get magic item details for all items in the list
  const magicItemIds = listItems?.map(item => item.magic_item_id) || [];
  const magicItems = await getMagicItemsByIds(magicItemIds);

  // Combine list items with magic item details
  const itemsWithMagicItems = listItems?.map(item => ({
    ...item,
    magicItem: magicItems.find(mi => mi.slug === item.magic_item_id)
  })) || [];

  return {
    ...list,
    items: itemsWithMagicItems,
    itemCount: itemsWithMagicItems.length
  };
}

/**
 * Create a new list for a user
 */
export async function createList(userId: string, listData: CreateListRequest): Promise<List> {
  const supabase = await createClient();

  // Check if user has reached the maximum number of lists (100)
  const { count } = await supabase
    .from('lists')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  if (count && count >= 100) {
    throw new Error('Max allowed is 100');
  }

  // Check for name conflicts for the user
  const { data: existingList } = await supabase
    .from('lists')
    .select('id')
    .eq('user_id', userId)
    .eq('name', listData.name)
    .single();

  if (existingList) {
    throw new Error('A list with this name already exists');
  }

  const { data, error } = await supabase
    .from('lists')
    .insert({
      user_id: userId,
      name: listData.name,
      description: listData.description || null,
      is_favorite_list: false
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create list: ${error.message}`);
  }

  return data;
}

/**
 * Update an existing list
 */
export async function updateList(listId: string, userId: string, updateData: UpdateListRequest): Promise<List> {
  const supabase = await createClient();

  // Check if name is being updated and if it conflicts
  if (updateData.name) {
    const { data: existingList } = await supabase
      .from('lists')
      .select('id')
      .eq('user_id', userId)
      .eq('name', updateData.name)
      .neq('id', listId)
      .single();

    if (existingList) {
      throw new Error('A list with this name already exists');
    }
  }

  const { data, error } = await supabase
    .from('lists')
    .update({
      ...(updateData.name && { name: updateData.name }),
      ...(updateData.description !== undefined && { description: updateData.description }),
      updated_at: new Date().toISOString()
    })
    .eq('id', listId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update list: ${error.message}`);
  }

  return data;
}

/**
 * Delete a list and all its items
 */
export async function deleteList(listId: string, userId: string): Promise<void> {
  const supabase = await createClient();

  // First delete all list items
  const { error: itemsError } = await supabase
    .from('list_items')
    .delete()
    .eq('list_id', listId);

  if (itemsError) {
    throw new Error(`Failed to delete list items: ${itemsError.message}`);
  }

  // Then delete the list
  const { error: listError } = await supabase
    .from('lists')
    .delete()
    .eq('id', listId)
    .eq('user_id', userId);

  if (listError) {
    throw new Error(`Failed to delete list: ${listError.message}`);
  }
}

/**
 * Add an item to a list
 */
export async function addItemToList(listId: string, userId: string, itemData: AddToListRequest): Promise<ListItem> {
  const supabase = await createClient();

  // Verify list ownership
  const { data: list } = await supabase
    .from('lists')
    .select('id')
    .eq('id', listId)
    .eq('user_id', userId)
    .single();

  if (!list) {
    throw new Error('List not found or access denied');
  }

  // Check if item already exists in the list
  const { data: existingItem } = await supabase
    .from('list_items')
    .select('id')
    .eq('list_id', listId)
    .eq('magic_item_id', itemData.magicItemId)
    .single();

  if (existingItem) {
    throw new Error('Item already in list');
  }

  // Get the next sort order
  const { data: lastItem } = await supabase
    .from('list_items')
    .select('sort_order')
    .eq('list_id', listId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();

  const nextSortOrder = (lastItem?.sort_order || 0) + 1;

  const { data, error } = await supabase
    .from('list_items')
    .insert({
      list_id: listId,
      magic_item_id: itemData.magicItemId,
      sort_order: nextSortOrder
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add item to list: ${error.message}`);
  }

  // Update the list's updated_at timestamp
  await supabase
    .from('lists')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', listId);

  return data;
}

/**
 * Remove an item from a list
 */
export async function removeItemFromList(listId: string, userId: string, magicItemId: string): Promise<void> {
  const supabase = await createClient();

  // Verify list ownership
  const { data: list } = await supabase
    .from('lists')
    .select('id')
    .eq('id', listId)
    .eq('user_id', userId)
    .single();

  if (!list) {
    throw new Error('List not found or access denied');
  }

  const { error } = await supabase
    .from('list_items')
    .delete()
    .eq('list_id', listId)
    .eq('magic_item_id', magicItemId);

  if (error) {
    throw new Error(`Failed to remove item from list: ${error.message}`);
  }

  // Update the list's updated_at timestamp
  await supabase
    .from('lists')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', listId);
}