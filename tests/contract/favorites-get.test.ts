import { describe, it, expect } from '@jest/globals';
import { GET } from '@/app/api/favorites/route';
import { GetFavoritesResponse } from '@/types/api';

describe('GET /api/favorites - Contract Test T021', () => {
  it('should return user favorites with valid authentication', async () => {
    const request = new Request('http://localhost:3000/api/favorites', {
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    const response = await GET(request);
    expect(response.status).toBe(200);

    const json = await response.json() as GetFavoritesResponse;

    // Validate response schema structure
    expect(json.data).toBeDefined();
    expect(Array.isArray(json.data)).toBe(true);

    // Validate each favorite item structure matches OpenAPI spec
    if (json.data.length > 0) {
      const favorite = json.data[0];

      // Required fields from Favorite schema
      expect(favorite.id).toBeDefined();
      expect(typeof favorite.id).toBe('string');
      expect(favorite.userId).toBeDefined();
      expect(typeof favorite.userId).toBe('string');
      expect(favorite.magicItemId).toBeDefined();
      expect(typeof favorite.magicItemId).toBe('string');
      expect(favorite.createdAt).toBeDefined();
      expect(typeof favorite.createdAt).toBe('string');

      // Magic item relationship
      expect(favorite.magicItem).toBeDefined();
      expect(favorite.magicItem.id).toBeDefined();
      expect(favorite.magicItem.name).toBeDefined();
      expect(favorite.magicItem.description).toBeDefined();
      expect(favorite.magicItem.type).toBeDefined();
      expect(favorite.magicItem.rarity).toBeDefined();

      // Validate enum values
      expect(['weapon', 'armor', 'accessory', 'consumable', 'artifact']).toContain(favorite.magicItem.type);
      expect(['common', 'uncommon', 'rare', 'very-rare', 'legendary', 'artifact']).toContain(favorite.magicItem.rarity);
    }
  });

  it('should return empty array when user has no favorites', async () => {
    const request = new Request('http://localhost:3000/api/favorites', {
      headers: {
        'Authorization': 'Bearer user-no-favorites-token'
      }
    });

    const response = await GET(request);
    expect(response.status).toBe(200);

    const json = await response.json() as GetFavoritesResponse;
    expect(json.data).toBeDefined();
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBe(0);
  });

  it('should return 401 without authentication', async () => {
    const request = new Request('http://localhost:3000/api/favorites');

    const response = await GET(request);
    expect(response.status).toBe(401);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Authentication required');
  });

  it('should return 401 with invalid token', async () => {
    const request = new Request('http://localhost:3000/api/favorites', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });

    const response = await GET(request);
    expect(response.status).toBe(401);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Authentication required');
  });

  it('should return 401 with malformed authorization header', async () => {
    const request = new Request('http://localhost:3000/api/favorites', {
      headers: {
        'Authorization': 'InvalidFormat'
      }
    });

    const response = await GET(request);
    expect(response.status).toBe(401);
  });
});