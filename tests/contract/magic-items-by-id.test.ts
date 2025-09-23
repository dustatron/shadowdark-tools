import { describe, it, expect } from '@jest/globals';
import { GET } from '@/app/api/magic-items/[id]/route';
import { GetMagicItemResponse } from '@/types/api';

describe('GET /api/magic-items/[id]', () => {
  it('should return a specific magic item by slug', async () => {
    const request = new Request('http://localhost:3000/api/magic-items/alabaster_destrier');
    const context = { params: { id: 'alabaster_destrier' } };

    const response = await GET(request, context);
    expect(response.status).toBe(200);

    const json = await response.json() as GetMagicItemResponse;
    expect(json.data).toBeDefined();
    expect(json.data.slug).toBe('alabaster_destrier');
    expect(json.data.name).toBeDefined();
    expect(json.data.description).toBeDefined();
    expect(Array.isArray(json.data.traits)).toBe(true);
  });

  it('should return 404 for non-existent magic item', async () => {
    const request = new Request('http://localhost:3000/api/magic-items/non-existent');
    const context = { params: { id: 'non-existent' } };

    const response = await GET(request, context);
    expect(response.status).toBe(404);
  });

  it('should return 400 for invalid ID format', async () => {
    const request = new Request('http://localhost:3000/api/magic-items/');
    const context = { params: { id: '' } };

    const response = await GET(request, context);
    expect(response.status).toBe(400);
  });
});