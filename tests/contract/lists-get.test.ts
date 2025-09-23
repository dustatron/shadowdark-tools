import { describe, it, expect } from '@jest/globals';
import { GET } from '@/app/api/lists/route';
import { GetListsResponse } from '@/types/api';

describe('GET /api/lists', () => {
  it('should return user lists with authentication', async () => {
    const request = new Request('http://localhost:3000/api/lists', {
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    const response = await GET(request);
    expect(response.status).toBe(200);

    const json = await response.json() as GetListsResponse;
    expect(json.data).toBeDefined();
    expect(Array.isArray(json.data)).toBe(true);
  });

  it('should return 401 without authentication', async () => {
    const request = new Request('http://localhost:3000/api/lists');

    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it('should return 401 with invalid token', async () => {
    const request = new Request('http://localhost:3000/api/lists', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });

    const response = await GET(request);
    expect(response.status).toBe(401);
  });
});