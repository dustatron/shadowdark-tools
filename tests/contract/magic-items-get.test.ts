import { describe, it, expect } from '@jest/globals';
import { GET } from '@/app/api/magic-items/route';
import { GetMagicItemsResponse } from '@/types/api';

describe('GET /api/magic-items', () => {
  it('should return all magic items without authentication', async () => {
    const request = new Request('http://localhost:3000/api/magic-items');

    const response = await GET(request);
    expect(response.status).toBe(200);

    const json = await response.json() as GetMagicItemsResponse;
    expect(json.data).toBeDefined();
    expect(Array.isArray(json.data.data)).toBe(true);
    expect(typeof json.data.total).toBe('number');
  });

  it('should support search parameter', async () => {
    const request = new Request('http://localhost:3000/api/magic-items?search=ring');

    const response = await GET(request);
    expect(response.status).toBe(200);

    const json = await response.json() as GetMagicItemsResponse;
    expect(json.data).toBeDefined();
    expect(Array.isArray(json.data.data)).toBe(true);
  });

  it('should support type filter', async () => {
    const request = new Request('http://localhost:3000/api/magic-items?type=weapon');

    const response = await GET(request);
    expect(response.status).toBe(200);

    const json = await response.json() as GetMagicItemsResponse;
    expect(json.data).toBeDefined();
  });

  it('should support rarity filter', async () => {
    const request = new Request('http://localhost:3000/api/magic-items?rarity=rare');

    const response = await GET(request);
    expect(response.status).toBe(200);

    const json = await response.json() as GetMagicItemsResponse;
    expect(json.data).toBeDefined();
  });

  it('should return 400 for invalid parameters', async () => {
    const request = new Request('http://localhost:3000/api/magic-items?type=invalid');

    const response = await GET(request);
    expect(response.status).toBe(400);
  });
});