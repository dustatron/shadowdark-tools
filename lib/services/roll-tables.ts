import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database';
import { RollTable, RollTableData, CreateRollTableRequest, UpdateRollTableRequest } from '@/types/tables';
import crypto from 'crypto';

// Type aliases for cleaner code
type DbRollTable = Database['public']['Tables']['roll_tables']['Row'];
type RollTableInsert = Database['public']['Tables']['roll_tables']['Insert'];
type RollTableUpdate = Database['public']['Tables']['roll_tables']['Update'];

// Helper function to convert database row to API type
function dbRowToRollTable(row: DbRollTable): RollTable {
  return {
    id: row.id,
    userId: row.user_id,
    sourceListId: row.source_list_id,
    name: row.name,
    dieSize: row.die_size,
    shareToken: row.share_token,
    isPublic: row.is_public,
    tableData: row.table_data as RollTableData,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export class RollTablesService {
  /**
   * Generate a unique share token
   */
  private static generateShareToken(): string {
    return crypto.randomBytes(16).toString('hex'); // 32 character hex token
  }

  /**
   * Get all roll tables for a user
   */
  static async getUserRollTables(userId: string): Promise<RollTable[]> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('roll_tables')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch user roll tables: ${error.message}`);
      }

      return (data || []).map(dbRowToRollTable);
    } catch (error) {
      console.error('Error in getUserRollTables:', error);
      throw error;
    }
  }

  /**
   * Get a specific roll table by ID
   */
  static async getRollTableById(tableId: string, userId?: string): Promise<RollTable | null> {
    try {
      const supabase = await createClient();

      const query = supabase
        .from('roll_tables')
        .select('*')
        .eq('id', tableId);

      // If userId is provided, filter by user
      if (userId) {
        query.eq('user_id', userId);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Table not found or access denied
        }
        throw new Error(`Failed to fetch roll table: ${error.message}`);
      }

      return dbRowToRollTable(data);
    } catch (error) {
      console.error('Error in getRollTableById:', error);
      throw error;
    }
  }

  /**
   * Get a roll table by share token (public access)
   */
  static async getSharedRollTable(shareToken: string): Promise<RollTable | null> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('roll_tables')
        .select('*')
        .eq('share_token', shareToken)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Table not found
        }
        throw new Error(`Failed to fetch shared roll table: ${error.message}`);
      }

      return dbRowToRollTable(data);
    } catch (error) {
      console.error('Error in getSharedRollTable:', error);
      throw error;
    }
  }

  /**
   * Create a new roll table
   */
  static async createRollTable(userId: string, params: CreateRollTableRequest): Promise<RollTable> {
    try {
      const supabase = await createClient();
      const { name, dieSize, sourceListId, tableData } = params;

      // Validate die size
      if (dieSize < 1 || dieSize > 10000) {
        throw new Error('Die size must be between 1 and 10000');
      }

      // Validate name length
      if (name.trim().length === 0 || name.length > 100) {
        throw new Error('Name must be between 1 and 100 characters');
      }

      // Check table count limit for user
      const { count, error: countError } = await supabase
        .from('roll_tables')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (countError) {
        throw new Error(`Failed to check table count: ${countError.message}`);
      }

      if (count && count >= 100) {
        throw new Error('Max allowed is 100');
      }

      const tableInsert: RollTableInsert = {
        user_id: userId,
        source_list_id: sourceListId || null,
        name: name.trim(),
        die_size: dieSize,
        share_token: RollTablesService.generateShareToken(),
        is_public: false,
        table_data: tableData as any // Cast to Json type
      };

      const { data, error } = await supabase
        .from('roll_tables')
        .insert(tableInsert)
        .select()
        .single();

      if (error) {
        if (error.code === '23505' && error.message.includes('share_token')) {
          // Retry with new token if collision (very unlikely)
          tableInsert.share_token = RollTablesService.generateShareToken();
          const { data: retryData, error: retryError } = await supabase
            .from('roll_tables')
            .insert(tableInsert)
            .select()
            .single();

          if (retryError) {
            throw new Error(`Failed to create roll table: ${retryError.message}`);
          }
          return dbRowToRollTable(retryData);
        }
        throw new Error(`Failed to create roll table: ${error.message}`);
      }

      return dbRowToRollTable(data);
    } catch (error) {
      console.error('Error in createRollTable:', error);
      throw error;
    }
  }

  /**
   * Update a roll table
   */
  static async updateRollTable(tableId: string, userId: string, updates: UpdateRollTableRequest): Promise<RollTable> {
    try {
      const supabase = await createClient();

      const updateData: RollTableUpdate = {
        updated_at: new Date().toISOString()
      };

      if (updates.name !== undefined) {
        if (updates.name.trim().length === 0 || updates.name.length > 100) {
          throw new Error('Name must be between 1 and 100 characters');
        }
        updateData.name = updates.name.trim();
      }

      if (updates.dieSize !== undefined) {
        if (updates.dieSize < 1 || updates.dieSize > 10000) {
          throw new Error('Die size must be between 1 and 10000');
        }
        updateData.die_size = updates.dieSize;
      }

      if (updates.tableData !== undefined) {
        updateData.table_data = updates.tableData as any; // Cast to Json type
      }

      const { data, error } = await supabase
        .from('roll_tables')
        .update(updateData)
        .eq('id', tableId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Roll table not found or access denied');
        }
        throw new Error(`Failed to update roll table: ${error.message}`);
      }

      return dbRowToRollTable(data);
    } catch (error) {
      console.error('Error in updateRollTable:', error);
      throw error;
    }
  }

  /**
   * Delete a roll table
   */
  static async deleteRollTable(tableId: string, userId: string): Promise<void> {
    try {
      const supabase = await createClient();

      const { error } = await supabase
        .from('roll_tables')
        .delete()
        .eq('id', tableId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to delete roll table: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteRollTable:', error);
      throw error;
    }
  }

  /**
   * Duplicate a roll table (for sharing functionality)
   */
  static async duplicateRollTable(sourceTableId: string, newName: string, userId: string): Promise<RollTable> {
    try {
      // First get the source table (can be accessed by share token)
      const sourceTable = await this.getRollTableById(sourceTableId);

      if (!sourceTable) {
        throw new Error('Source table not found');
      }

      // Create new table data with updated metadata
      const newTableData: RollTableData = {
        ...sourceTable.tableData,
        metadata: {
          ...sourceTable.tableData.metadata,
          generatedAt: new Date().toISOString(),
          sourceListName: undefined // Remove source list reference for duplicated table
        }
      };

      return await this.createRollTable(userId, {
        name: newName,
        dieSize: sourceTable.dieSize,
        sourceListId: null,
        tableData: newTableData,
      });
    } catch (error) {
      console.error('Error in duplicateRollTable:', error);
      throw error;
    }
  }

  /**
   * Generate a new share token for a table
   */
  static async regenerateShareToken(tableId: string, userId: string): Promise<string> {
    try {
      const supabase = await createClient();

      const newToken = RollTablesService.generateShareToken();

      const { data, error } = await supabase
        .from('roll_tables')
        .update({
          share_token: newToken,
          updated_at: new Date().toISOString()
        })
        .eq('id', tableId)
        .eq('user_id', userId)
        .select('share_token')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Roll table not found or access denied');
        }
        throw new Error(`Failed to regenerate share token: ${error.message}`);
      }

      return data.share_token;
    } catch (error) {
      console.error('Error in regenerateShareToken:', error);
      throw error;
    }
  }

  /**
   * Get roll tables created from a specific list
   */
  static async getTablesFromList(listId: string, userId: string): Promise<RollTable[]> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('roll_tables')
        .select('*')
        .eq('source_list_id', listId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch tables from list: ${error.message}`);
      }

      return (data || []).map(dbRowToRollTable);
    } catch (error) {
      console.error('Error in getTablesFromList:', error);
      throw error;
    }
  }

  /**
   * Get table count for a user
   */
  static async getTableCount(userId: string): Promise<number> {
    try {
      const supabase = await createClient();

      const { count, error } = await supabase
        .from('roll_tables')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to get table count: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getTableCount:', error);
      throw error;
    }
  }

  /**
   * Search user's roll tables by name
   */
  static async searchUserTables(userId: string, searchQuery: string): Promise<RollTable[]> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('roll_tables')
        .select('*')
        .eq('user_id', userId)
        .ilike('name', `%${searchQuery}%`)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to search roll tables: ${error.message}`);
      }

      return (data || []).map(dbRowToRollTable);
    } catch (error) {
      console.error('Error in searchUserTables:', error);
      throw error;
    }
  }
}

// Export default functions for easier importing
export const getUserRollTables = RollTablesService.getUserRollTables;
export const getRollTableById = RollTablesService.getRollTableById;
export const getSharedRollTable = RollTablesService.getSharedRollTable;
export const getRollTableByShareToken = RollTablesService.getSharedRollTable;
export const createRollTable = RollTablesService.createRollTable;
export const updateRollTable = RollTablesService.updateRollTable;
export const deleteRollTable = RollTablesService.deleteRollTable;
export const duplicateRollTable = RollTablesService.duplicateRollTable;
export const regenerateShareToken = RollTablesService.regenerateShareToken;
export const getTablesFromList = RollTablesService.getTablesFromList;
export const getTableCount = RollTablesService.getTableCount;
export const searchUserTables = RollTablesService.searchUserTables;