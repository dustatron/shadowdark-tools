import { describe, it, expect } from '@jest/globals';
import { POST } from '@/app/api/lists/[id]/items/route';
import { AddToListResponse } from '@/types/api';

describe('POST /api/lists/{id}/items', () => {
  const validListId = '123e4567-e89b-12d3-a456-426614174000';
  const validMagicItemId = 'ring-of-protection';

  it('should add item to list with valid data', async () => {
    const requestBody = {
      magicItemId: validMagicItemId
    };

    const request = new Request(`http://localhost:3000/api/lists/${validListId}/items`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request, { params: { id: validListId } });
    expect(response.status).toBe(201);

    const json = await response.json() as AddToListResponse;
    expect(json.data).toBeDefined();
    expect(json.data.magicItemId).toBe(validMagicItemId);
    expect(json.data.listId).toBe(validListId);
    expect(json.data.id).toBeDefined();
    expect(json.data.sortOrder).toBeDefined();
    expect(json.data.addedAt).toBeDefined();
  });

  it('should return 400 for missing magicItemId', async () => {
    const requestBody = {};

    const request = new Request(`http://localhost:3000/api/lists/${validListId}/items`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request, { params: { id: validListId } });
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toContain('magicItemId');
  });

  it('should return 400 for invalid magicItemId format', async () => {
    const requestBody = {
      magicItemId: ''
    };

    const request = new Request(`http://localhost:3000/api/lists/${validListId}/items`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request, { params: { id: validListId } });
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBeDefined();
  });

  it('should return 400 for invalid list ID format', async () => {
    const invalidListId = 'invalid-uuid';
    const requestBody = {
      magicItemId: validMagicItemId
    };

    const request = new Request(`http://localhost:3000/api/lists/${invalidListId}/items`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request, { params: { id: invalidListId } });
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBeDefined();
  });

  it('should return 401 without authentication', async () => {
    const requestBody = {
      magicItemId: validMagicItemId
    };

    const request = new Request(`http://localhost:3000/api/lists/${validListId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request, { params: { id: validListId } });
    expect(response.status).toBe(401);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Authentication required');
  });

  it('should return 403 for unauthorized list access', async () => {
    const requestBody = {
      magicItemId: validMagicItemId
    };

    const request = new Request(`http://localhost:3000/api/lists/${validListId}/items`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer other-user-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request, { params: { id: validListId } });
    expect(response.status).toBe(403);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Access denied');
  });

  it('should return 404 for non-existent list', async () => {
    const nonExistentListId = '999e9999-e99b-99d9-a999-999999999999';
    const requestBody = {
      magicItemId: validMagicItemId
    };

    const request = new Request(`http://localhost:3000/api/lists/${nonExistentListId}/items`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request, { params: { id: nonExistentListId } });
    expect(response.status).toBe(404);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Resource not found');
  });

  it('should return 404 for non-existent magic item', async () => {
    const nonExistentMagicItemId = 'non-existent-item';
    const requestBody = {
      magicItemId: nonExistentMagicItemId
    };

    const request = new Request(`http://localhost:3000/api/lists/${validListId}/items`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request, { params: { id: validListId } });
    expect(response.status).toBe(404);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Resource not found');
  });

  it('should return 409 when item already exists in list', async () => {
    const requestBody = {
      magicItemId: 'already-in-list-item'
    };

    const request = new Request(`http://localhost:3000/api/lists/${validListId}/items`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request, { params: { id: validListId } });
    expect(response.status).toBe(409);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBeDefined();
  });

  it('should validate request body structure', async () => {
    const request = new Request(`http://localhost:3000/api/lists/${validListId}/items`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: 'invalid-json'
    });

    const response = await POST(request, { params: { id: validListId } });
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBeDefined();
  });

  it('should validate content-type header', async () => {
    const requestBody = {
      magicItemId: validMagicItemId
    };

    const request = new Request(`http://localhost:3000/api/lists/${validListId}/items`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request, { params: { id: validListId } });
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBeDefined();
  });
});