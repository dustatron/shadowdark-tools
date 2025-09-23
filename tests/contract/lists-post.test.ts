import { describe, it, expect } from '@jest/globals';
import { POST } from '@/app/api/lists/route';
import { CreateListResponse } from '@/types/api';

describe('POST /api/lists', () => {
  it('should create a new list with valid data', async () => {
    const requestBody = {
      name: 'Test Campaign Items',
      description: 'Items for test campaign'
    };

    const request = new Request('http://localhost:3000/api/lists', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    expect(response.status).toBe(201);

    const json = await response.json() as CreateListResponse;
    expect(json.data).toBeDefined();
    expect(json.data.name).toBe(requestBody.name);
    expect(json.data.description).toBe(requestBody.description);
    expect(json.data.id).toBeDefined();
  });

  it('should return 400 for missing name', async () => {
    const requestBody = {
      description: 'Description without name'
    };

    const request = new Request('http://localhost:3000/api/lists', {
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

  it('should return 409 when list limit exceeded', async () => {
    const requestBody = {
      name: 'List when at limit'
    };

    const request = new Request('http://localhost:3000/api/lists', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer user-with-100-lists-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    expect(response.status).toBe(409);

    const json = await response.json();
    expect(json.error.message).toBe('Max allowed is 100');
  });

  it('should return 401 without authentication', async () => {
    const requestBody = {
      name: 'Unauthorized List'
    };

    const request = new Request('http://localhost:3000/api/lists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});