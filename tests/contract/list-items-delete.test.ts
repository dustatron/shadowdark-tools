import { describe, it, expect } from '@jest/globals';
import { DELETE } from '@/app/api/lists/[id]/items/route';

describe('DELETE /api/lists/{id}/items', () => {
  const validListId = '123e4567-e89b-12d3-a456-426614174000';
  const validMagicItemId = 'ring-of-protection';

  it('should remove item from list with valid data', async () => {
    const url = new URL(`http://localhost:3000/api/lists/${validListId}/items`);
    url.searchParams.set('magicItemId', validMagicItemId);

    const request = new Request(url.toString(), {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    const response = await DELETE(request, { params: { id: validListId } });
    expect(response.status).toBe(204);

    // For 204 responses, there should be no content
    const text = await response.text();
    expect(text).toBe('');
  });

  it('should return 400 for missing magicItemId query parameter', async () => {
    const request = new Request(`http://localhost:3000/api/lists/${validListId}/items`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    const response = await DELETE(request, { params: { id: validListId } });
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toContain('magicItemId');
  });

  it('should return 400 for empty magicItemId query parameter', async () => {
    const url = new URL(`http://localhost:3000/api/lists/${validListId}/items`);
    url.searchParams.set('magicItemId', '');

    const request = new Request(url.toString(), {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    const response = await DELETE(request, { params: { id: validListId } });
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBeDefined();
  });

  it('should return 400 for invalid list ID format', async () => {
    const invalidListId = 'invalid-uuid';
    const url = new URL(`http://localhost:3000/api/lists/${invalidListId}/items`);
    url.searchParams.set('magicItemId', validMagicItemId);

    const request = new Request(url.toString(), {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    const response = await DELETE(request, { params: { id: invalidListId } });
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBeDefined();
  });

  it('should return 401 without authentication', async () => {
    const url = new URL(`http://localhost:3000/api/lists/${validListId}/items`);
    url.searchParams.set('magicItemId', validMagicItemId);

    const request = new Request(url.toString(), {
      method: 'DELETE'
    });

    const response = await DELETE(request, { params: { id: validListId } });
    expect(response.status).toBe(401);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Authentication required');
  });

  it('should return 403 for unauthorized list access', async () => {
    const url = new URL(`http://localhost:3000/api/lists/${validListId}/items`);
    url.searchParams.set('magicItemId', validMagicItemId);

    const request = new Request(url.toString(), {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer other-user-jwt-token'
      }
    });

    const response = await DELETE(request, { params: { id: validListId } });
    expect(response.status).toBe(403);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Access denied');
  });

  it('should return 404 for non-existent list', async () => {
    const nonExistentListId = '999e9999-e99b-99d9-a999-999999999999';
    const url = new URL(`http://localhost:3000/api/lists/${nonExistentListId}/items`);
    url.searchParams.set('magicItemId', validMagicItemId);

    const request = new Request(url.toString(), {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    const response = await DELETE(request, { params: { id: nonExistentListId } });
    expect(response.status).toBe(404);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Resource not found');
  });

  it('should return 404 for non-existent magic item in list', async () => {
    const nonExistentMagicItemId = 'non-existent-item';
    const url = new URL(`http://localhost:3000/api/lists/${validListId}/items`);
    url.searchParams.set('magicItemId', nonExistentMagicItemId);

    const request = new Request(url.toString(), {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    const response = await DELETE(request, { params: { id: validListId } });
    expect(response.status).toBe(404);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Resource not found');
  });

  it('should handle multiple query parameters correctly', async () => {
    const url = new URL(`http://localhost:3000/api/lists/${validListId}/items`);
    url.searchParams.set('magicItemId', validMagicItemId);
    url.searchParams.set('extraParam', 'should-be-ignored');

    const request = new Request(url.toString(), {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    const response = await DELETE(request, { params: { id: validListId } });
    expect(response.status).toBe(204);

    // For 204 responses, there should be no content
    const text = await response.text();
    expect(text).toBe('');
  });

  it('should handle URL-encoded query parameters', async () => {
    const encodedMagicItemId = encodeURIComponent('item-with-special-chars');
    const url = new URL(`http://localhost:3000/api/lists/${validListId}/items`);
    url.searchParams.set('magicItemId', encodedMagicItemId);

    const request = new Request(url.toString(), {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    const response = await DELETE(request, { params: { id: validListId } });
    // This should succeed (204) or fail with proper error handling (400/404)
    expect([204, 400, 404]).toContain(response.status);
  });

  it('should validate authorization header format', async () => {
    const url = new URL(`http://localhost:3000/api/lists/${validListId}/items`);
    url.searchParams.set('magicItemId', validMagicItemId);

    const request = new Request(url.toString(), {
      method: 'DELETE',
      headers: {
        'Authorization': 'InvalidFormat'
      }
    });

    const response = await DELETE(request, { params: { id: validListId } });
    expect(response.status).toBe(401);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Authentication required');
  });

  it('should handle case-sensitive query parameter names', async () => {
    const url = new URL(`http://localhost:3000/api/lists/${validListId}/items`);
    url.searchParams.set('MagicItemId', validMagicItemId); // Wrong case

    const request = new Request(url.toString(), {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    const response = await DELETE(request, { params: { id: validListId } });
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toContain('magicItemId');
  });
});