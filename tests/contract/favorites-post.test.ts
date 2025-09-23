import { describe, it, expect } from '@jest/globals';
import { POST } from '@/app/api/favorites/route';
import { AddToFavoritesResponse } from '@/types/api';

describe('POST /api/favorites - Contract Test T022', () => {
  it('should add item to favorites with valid data', async () => {
    const requestBody = {
      magicItemId: 'sword-of-flame'
    };

    const request = new Request('http://localhost:3000/api/favorites', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    expect(response.status).toBe(201);

    const json = await response.json() as AddToFavoritesResponse;

    // Validate response schema structure
    expect(json.data).toBeDefined();

    // Required fields from Favorite schema
    expect(json.data.id).toBeDefined();
    expect(typeof json.data.id).toBe('string');
    expect(json.data.userId).toBeDefined();
    expect(typeof json.data.userId).toBe('string');
    expect(json.data.magicItemId).toBe(requestBody.magicItemId);
    expect(json.data.createdAt).toBeDefined();
    expect(typeof json.data.createdAt).toBe('string');

    // Validate ISO 8601 date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    expect(dateRegex.test(json.data.createdAt)).toBe(true);
  });

  it('should return 400 for missing magicItemId', async () => {
    const requestBody = {};

    const request = new Request('http://localhost:3000/api/favorites', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBeDefined();
    expect(typeof json.error.message).toBe('string');
  });

  it('should return 400 for invalid magicItemId type', async () => {
    const requestBody = {
      magicItemId: 123 // Should be string
    };

    const request = new Request('http://localhost:3000/api/favorites', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBeDefined();
  });

  it('should return 400 for empty magicItemId', async () => {
    const requestBody = {
      magicItemId: ''
    };

    const request = new Request('http://localhost:3000/api/favorites', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 400 for invalid JSON', async () => {
    const request = new Request('http://localhost:3000/api/favorites', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: '{"invalid": json}'
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should return 400 for non-existent magic item', async () => {
    const requestBody = {
      magicItemId: 'non-existent-item-id'
    };

    const request = new Request('http://localhost:3000/api/favorites', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBeDefined();
  });

  it('should return 401 without authentication', async () => {
    const requestBody = {
      magicItemId: 'sword-of-flame'
    };

    const request = new Request('http://localhost:3000/api/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    expect(response.status).toBe(401);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Authentication required');
  });

  it('should return 401 with invalid token', async () => {
    const requestBody = {
      magicItemId: 'sword-of-flame'
    };

    const request = new Request('http://localhost:3000/api/favorites', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer invalid-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    expect(response.status).toBe(401);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Authentication required');
  });

  it('should return 409 when item already favorited', async () => {
    const requestBody = {
      magicItemId: 'already-favorited-item'
    };

    const request = new Request('http://localhost:3000/api/favorites', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer user-with-existing-favorite-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    expect(response.status).toBe(409);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBeDefined();
    expect(typeof json.error.message).toBe('string');
  });

  it('should handle missing Content-Type header', async () => {
    const requestBody = {
      magicItemId: 'sword-of-flame'
    };

    const request = new Request('http://localhost:3000/api/favorites', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    // Should still process JSON or return appropriate error
    expect([201, 400]).toContain(response.status);
  });

  it('should reject requests with wrong Content-Type', async () => {
    const requestBody = {
      magicItemId: 'sword-of-flame'
    };

    const request = new Request('http://localhost:3000/api/favorites', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should validate magicItemId matches example format from spec', async () => {
    const requestBody = {
      magicItemId: 'sword-of-flame' // Format from OpenAPI spec example
    };

    const request = new Request('http://localhost:3000/api/favorites', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    // Should either succeed (201) or fail with specific error (400/409)
    expect([201, 400, 409]).toContain(response.status);

    if (response.status === 201) {
      const json = await response.json() as AddToFavoritesResponse;
      expect(json.data.magicItemId).toBe('sword-of-flame');
    }
  });
});