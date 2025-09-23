import { MagicItem, MagicItemSearchResult } from './magic-items';
import { RollTable } from './tables';
import { Database } from './database';

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  error?: never;
}

export interface ApiError {
  data?: never;
  error: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

// Specific API response types
export type GetMagicItemsResponse = ApiResult<MagicItemSearchResult>;
export type GetMagicItemResponse = ApiResult<MagicItem>;

// Database entity types (from Supabase)
export type User = Database['public']['Tables']['users']['Row'];
export type List = Database['public']['Tables']['lists']['Row'];
export type ListItem = Database['public']['Tables']['list_items']['Row'];
export type Favorite = Database['public']['Tables']['favorites']['Row'];

// Enhanced types with relationships
export interface ListWithItems extends List {
  items?: (ListItem & { magicItem?: MagicItem })[];
  itemCount?: number;
}

export interface FavoriteWithMagicItem extends Favorite {
  magicItem: MagicItem;
}

// API request/response types for lists
export interface CreateListRequest {
  name: string;
  description?: string;
}

export interface UpdateListRequest {
  name?: string;
  description?: string;
}

export interface AddToListRequest {
  magicItemId: string;
}

export type GetListsResponse = ApiResult<List[]>;
export type GetListResponse = ApiResult<ListWithItems>;
export type CreateListResponse = ApiResult<List>;
export type UpdateListResponse = ApiResult<List>;
export type DeleteListResponse = ApiResult<{ success: boolean }>;
export type AddToListResponse = ApiResult<ListItem>;
export type RemoveFromListResponse = ApiResult<{ success: boolean }>;

// API request/response types for favorites
export interface AddToFavoritesRequest {
  magicItemId: string;
}

export type GetFavoritesResponse = ApiResult<FavoriteWithMagicItem[]>;
export type AddToFavoritesResponse = ApiResult<Favorite>;
export type RemoveFromFavoritesResponse = ApiResult<{ success: boolean }>;

// API request/response types for roll tables
export type GetRollTablesResponse = ApiResult<RollTable[]>;
export type GetRollTableResponse = ApiResult<RollTable>;
export type CreateRollTableResponse = ApiResult<RollTable>;
export type UpdateRollTableResponse = ApiResult<RollTable>;
export type DeleteRollTableResponse = ApiResult<{ success: boolean }>;
export type GetSharedRollTableResponse = ApiResult<RollTable>;

// HTTP status codes for API responses
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}