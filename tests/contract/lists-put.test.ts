import { describe, it, expect } from '@jest/globals';
import { PUT } from '@/app/api/lists/[id]/route';
import { UpdateListResponse } from '@/types/api';

describe('PUT /api/lists/{id}', () => {
  const validListId = '123e4567-e89b-12d3-a456-426614174000';
  const invalidListId = 'invalid-uuid';

  it('should update list with valid data', async () => {
    const requestBody = {
      name: 'Updated Campaign Items',
      description: 'Updated description for campaign items'
    };

    const request = new Request(`http://localhost:3000/api/lists/${validListId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    // Mock the dynamic route parameters
    const params = { params: { id: validListId } };

    const response = await PUT(request, params);
    expect(response.status).toBe(200);

    const json = await response.json() as UpdateListResponse;
    expect(json.data).toBeDefined();
    expect(json.data.name).toBe(requestBody.name);
    expect(json.data.description).toBe(requestBody.description);
    expect(json.data.id).toBe(validListId);
  });

  it('should update list with partial data (name only)', async () => {
    const requestBody = {
      name: 'Just Name Update'
    };

    const request = new Request(`http://localhost:3000/api/lists/${validListId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const params = { params: { id: validListId } };

    const response = await PUT(request, params);
    expect(response.status).toBe(200);

    const json = await response.json() as UpdateListResponse;
    expect(json.data).toBeDefined();
    expect(json.data.name).toBe(requestBody.name);
    expect(json.data.id).toBe(validListId);
  });

  it('should update list with partial data (description only)', async () => {
    const requestBody = {
      description: 'Just description update'
    };

    const request = new Request(`http://localhost:3000/api/lists/${validListId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const params = { params: { id: validListId } };

    const response = await PUT(request, params);
    expect(response.status).toBe(200);

    const json = await response.json() as UpdateListResponse;
    expect(json.data).toBeDefined();
    expect(json.data.description).toBe(requestBody.description);
    expect(json.data.id).toBe(validListId);
  });

  it('should return 400 for invalid request body', async () => {
    const requestBody = {
      name: 'a'.repeat(101), // Exceeds maxLength: 100
      description: 'Valid description'
    };

    const request = new Request(`http://localhost:3000/api/lists/${validListId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const params = { params: { id: validListId } };

    const response = await PUT(request, params);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBeDefined();
  });

  it('should return 400 for invalid UUID format', async () => {
    const requestBody = {
      name: 'Valid Name'
    };

    const request = new Request(`http://localhost:3000/api/lists/${invalidListId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const params = { params: { id: invalidListId } };

    const response = await PUT(request, params);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBeDefined();
  });

  it('should return 400 for description exceeding maxLength', async () => {
    const requestBody = {
      name: 'Valid Name',
      description: 'a'.repeat(501) // Exceeds maxLength: 500
    };

    const request = new Request(`http://localhost:3000/api/lists/${validListId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const params = { params: { id: validListId } };

    const response = await PUT(request, params);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBeDefined();
  });

  it('should return 400 for empty request body', async () => {
    const request = new Request(`http://localhost:3000/api/lists/${validListId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    const params = { params: { id: validListId } };

    const response = await PUT(request, params);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBeDefined();
  });

  it('should return 401 without authentication', async () => {
    const requestBody = {
      name: 'Updated Name'
    };

    const request = new Request(`http://localhost:3000/api/lists/${validListId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const params = { params: { id: validListId } };

    const response = await PUT(request, params);
    expect(response.status).toBe(401);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Authentication required');
  });

  it('should return 401 with invalid token', async () => {
    const requestBody = {
      name: 'Updated Name'
    };

    const request = new Request(`http://localhost:3000/api/lists/${validListId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer invalid-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const params = { params: { id: validListId } };

    const response = await PUT(request, params);
    expect(response.status).toBe(401);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Authentication required');
  });

  it('should return 403 when user does not own the list', async () => {
    const requestBody = {
      name: 'Updated Name'
    };

    const request = new Request(`http://localhost:3000/api/lists/${validListId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer other-user-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const params = { params: { id: validListId } };

    const response = await PUT(request, params);
    expect(response.status).toBe(403);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Access denied');
  });

  it('should return 404 for non-existent list', async () => {
    const nonExistentId = '999e9999-e99b-99d9-a999-999999999999';
    const requestBody = {
      name: 'Updated Name'
    };

    const request = new Request(`http://localhost:3000/api/lists/${nonExistentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const params = { params: { id: nonExistentId } };

    const response = await PUT(request, params);
    expect(response.status).toBe(404);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Resource not found');
  });

  it('should validate Content-Type header', async () => {
    const requestBody = {
      name: 'Updated Name'
    };

    const request = new Request(`http://localhost:3000/api/lists/${validListId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'text/plain'
      },
      body: JSON.stringify(requestBody)
    });

    const params = { params: { id: validListId } };

    const response = await PUT(request, params);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBeDefined();
  });

  it('should validate JSON format', async () => {
    const request = new Request(`http://localhost:3000/api/lists/${validListId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: 'invalid-json'
    });

    const params = { params: { id: validListId } };

    const response = await PUT(request, params);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBeDefined();
  });
});