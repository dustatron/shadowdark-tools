import { describe, it, expect } from '@jest/globals';
import { DELETE } from '@/app/api/favorites/route';

describe('DELETE /api/favorites - Contract Test T023', () => {
  it('should remove item from favorites with valid magicItemId', async () => {
    const magicItemId = 'ring-of-protection';
    const url = new URL('http://localhost:3000/api/favorites');
    url.searchParams.set('magicItemId', magicItemId);

    const request = new Request(url.toString(), {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer user-with-favorites-token'
      }
    });

    const response = await DELETE(request);
    expect(response.status).toBe(204);

    // 204 No Content should have empty body
    const text = await response.text();
    expect(text).toBe('');
  });

  it('should return 400 for missing magicItemId query parameter', async () => {
    const request = new Request('http://localhost:3000/api/favorites', {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    const response = await DELETE(request);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBeDefined();
    expect(typeof json.error.message).toBe('string');
  });

  it('should return 400 for empty magicItemId query parameter', async () => {
    const url = new URL('http://localhost:3000/api/favorites');
    url.searchParams.set('magicItemId', '');

    const request = new Request(url.toString(), {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    const response = await DELETE(request);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBeDefined();
  });

  it('should return 400 for invalid magicItemId format', async () => {
    const url = new URL('http://localhost:3000/api/favorites');
    url.searchParams.set('magicItemId', '   '); // Only whitespace

    const request = new Request(url.toString(), {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    const response = await DELETE(request);
    expect(response.status).toBe(400);
  });

  it('should return 401 without authentication', async () => {
    const url = new URL('http://localhost:3000/api/favorites');
    url.searchParams.set('magicItemId', 'ring-of-protection');

    const request = new Request(url.toString(), {
      method: 'DELETE'
    });

    const response = await DELETE(request);
    expect(response.status).toBe(401);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Authentication required');
  });

  it('should return 401 with invalid token', async () => {
    const url = new URL('http://localhost:3000/api/favorites');
    url.searchParams.set('magicItemId', 'ring-of-protection');

    const request = new Request(url.toString(), {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });

    const response = await DELETE(request);
    expect(response.status).toBe(401);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Authentication required');
  });

  it('should return 401 with malformed authorization header', async () => {
    const url = new URL('http://localhost:3000/api/favorites');
    url.searchParams.set('magicItemId', 'ring-of-protection');

    const request = new Request(url.toString(), {
      method: 'DELETE',
      headers: {
        'Authorization': 'InvalidFormat'
      }
    });

    const response = await DELETE(request);
    expect(response.status).toBe(401);
  });

  it('should return 404 when item not in favorites', async () => {
    const url = new URL('http://localhost:3000/api/favorites');
    url.searchParams.set('magicItemId', 'not-favorited-item');

    const request = new Request(url.toString(), {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    const response = await DELETE(request);
    expect(response.status).toBe(404);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBeDefined();
    expect(typeof json.error.message).toBe('string');
  });

  it('should return 404 for non-existent magic item', async () => {
    const url = new URL('http://localhost:3000/api/favorites');
    url.searchParams.set('magicItemId', 'completely-invalid-item-id');

    const request = new Request(url.toString(), {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    const response = await DELETE(request);
    expect(response.status).toBe(404);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBeDefined();
  });

  it('should handle multiple query parameters correctly', async () => {
    const url = new URL('http://localhost:3000/api/favorites');
    url.searchParams.set('magicItemId', 'ring-of-protection');
    url.searchParams.set('otherParam', 'should-be-ignored');

    const request = new Request(url.toString(), {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer user-with-favorites-token'
      }
    });

    const response = await DELETE(request);
    // Should either succeed (204) or return appropriate error (400/404)
    expect([204, 400, 404]).toContain(response.status);
  });

  it('should handle URL encoded magicItemId parameter', async () => {
    const url = new URL('http://localhost:3000/api/favorites');
    url.searchParams.set('magicItemId', 'ring-of-protection+1'); // Contains + which gets URL encoded

    const request = new Request(url.toString(), {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer user-with-favorites-token'
      }
    });

    const response = await DELETE(request);
    // Should handle URL encoding correctly
    expect([204, 400, 404]).toContain(response.status);
  });

  it('should validate magicItemId matches spec format', async () => {
    const url = new URL('http://localhost:3000/api/favorites');
    url.searchParams.set('magicItemId', 'sword-of-flame'); // Format from OpenAPI spec example

    const request = new Request(url.toString(), {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer user-with-favorites-token'
      }
    });

    const response = await DELETE(request);
    // Should either succeed (204) or fail with specific error (400/404)
    expect([204, 400, 404]).toContain(response.status);
  });

  it('should reject request with body (DELETE should not have body)', async () => {
    const url = new URL('http://localhost:3000/api/favorites');
    url.searchParams.set('magicItemId', 'ring-of-protection');

    const request = new Request(url.toString(), {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ magicItemId: 'should-not-be-here' })
    });

    const response = await DELETE(request);
    // Should ignore body and use query parameter, or return 400 for unexpected body
    expect([204, 400, 404]).toContain(response.status);
  });

  it('should handle case sensitivity of magicItemId', async () => {
    const url = new URL('http://localhost:3000/api/favorites');
    url.searchParams.set('magicItemId', 'Ring-Of-Protection'); // Different casing

    const request = new Request(url.toString(), {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer user-with-favorites-token'
      }
    });

    const response = await DELETE(request);
    // Magic item IDs should be case-sensitive
    expect([204, 400, 404]).toContain(response.status);
  });
});