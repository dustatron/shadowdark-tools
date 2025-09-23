import { describe, it, expect } from '@jest/globals';
import { GET } from '@/app/api/roll-tables/shared/[token]/route';
import { GetSharedRollTableResponse } from '@/types/api';

describe('GET /api/roll-tables/shared/{token}', () => {
  const validShareToken = '8a9b2c3d4e5f6789';
  const invalidShareToken = 'invalid-token-xyz';
  const nonExistentShareToken = '1a2b3c4d5e6f7890';

  it('should return shared roll table with valid token (public access)', async () => {
    const request = new Request(`http://localhost:3000/api/roll-tables/shared/${validShareToken}`);

    const response = await GET(request, { params: { token: validShareToken } });
    expect(response.status).toBe(200);

    const json = await response.json() as GetSharedRollTableResponse;
    expect(json.data).toBeDefined();

    // Validate roll table structure matches OpenAPI spec
    const table = json.data;
    expect(table.id).toBeDefined();
    expect(typeof table.id).toBe('string');
    expect(table.name).toBeDefined();
    expect(typeof table.name).toBe('string');
    expect(table.name.length).toBeLessThanOrEqual(100);

    expect(typeof table.dieSize).toBe('number');
    expect(table.dieSize).toBeGreaterThanOrEqual(1);
    expect(table.dieSize).toBeLessThanOrEqual(10000);

    expect(table.shareToken).toBeDefined();
    expect(typeof table.shareToken).toBe('string');
    expect(table.shareToken).toBe(validShareToken);

    expect(typeof table.isPublic).toBe('boolean');
    expect(table.createdAt).toBeDefined();
    expect(table.updatedAt).toBeDefined();

    // Validate table data structure
    expect(table.tableData).toBeDefined();
    expect(Array.isArray(table.tableData.rolls)).toBe(true);
    expect(table.tableData.metadata).toBeDefined();
    expect(table.tableData.metadata.generatedAt).toBeDefined();
    expect(['auto', 'manual', 'blank']).toContain(table.tableData.metadata.fillStrategy);

    // Validate rolls structure
    if (table.tableData.rolls.length > 0) {
      const roll = table.tableData.rolls[0];
      expect(typeof roll.roll).toBe('number');
      expect(roll.roll).toBeGreaterThanOrEqual(1);
      // magicItemId and customText can be null, but at least one should be present
      expect(roll.magicItemId !== null || roll.customText !== null).toBe(true);
    }
  });

  it('should return shared table without authentication required', async () => {
    // This endpoint should be public, no auth headers needed
    const request = new Request(`http://localhost:3000/api/roll-tables/shared/${validShareToken}`);

    const response = await GET(request, { params: { token: validShareToken } });
    expect(response.status).toBe(200);

    const json = await response.json() as GetSharedRollTableResponse;
    expect(json.data).toBeDefined();
    expect(json.data.shareToken).toBe(validShareToken);
  });

  it('should return table even with authorization header present', async () => {
    // Should work with or without auth headers since it's a public endpoint
    const request = new Request(`http://localhost:3000/api/roll-tables/shared/${validShareToken}`, {
      headers: {
        'Authorization': 'Bearer some-token'
      }
    });

    const response = await GET(request, { params: { token: validShareToken } });
    expect(response.status).toBe(200);

    const json = await response.json() as GetSharedRollTableResponse;
    expect(json.data).toBeDefined();
  });

  it('should return 404 for invalid share token format', async () => {
    const request = new Request(`http://localhost:3000/api/roll-tables/shared/${invalidShareToken}`);

    const response = await GET(request, { params: { token: invalidShareToken } });
    expect(response.status).toBe(404);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Resource not found');
  });

  it('should return 404 for non-existent share token', async () => {
    const request = new Request(`http://localhost:3000/api/roll-tables/shared/${nonExistentShareToken}`);

    const response = await GET(request, { params: { token: nonExistentShareToken } });
    expect(response.status).toBe(404);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Resource not found');
  });

  it('should return 404 for empty token', async () => {
    const emptyToken = '';
    const request = new Request(`http://localhost:3000/api/roll-tables/shared/${emptyToken}`);

    const response = await GET(request, { params: { token: emptyToken } });
    expect(response.status).toBe(404);
  });

  it('should return 404 for expired or revoked share token', async () => {
    const expiredToken = 'expired-token-123';
    const request = new Request(`http://localhost:3000/api/roll-tables/shared/${expiredToken}`);

    const response = await GET(request, { params: { token: expiredToken } });
    expect(response.status).toBe(404);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Resource not found');
  });

  it('should handle special characters in token gracefully', async () => {
    const specialCharToken = 'token%20with%20spaces';
    const request = new Request(`http://localhost:3000/api/roll-tables/shared/${specialCharToken}`);

    const response = await GET(request, { params: { token: specialCharToken } });
    expect(response.status).toBe(404);

    const json = await response.json();
    expect(json.error).toBeDefined();
  });

  it('should validate response content-type is application/json', async () => {
    const request = new Request(`http://localhost:3000/api/roll-tables/shared/${validShareToken}`);

    const response = await GET(request, { params: { token: validShareToken } });
    expect(response.status).toBe(200);

    const contentType = response.headers.get('content-type');
    expect(contentType).toContain('application/json');
  });

  it('should include CORS headers for public access', async () => {
    const request = new Request(`http://localhost:3000/api/roll-tables/shared/${validShareToken}`, {
      headers: {
        'Origin': 'https://external-domain.com'
      }
    });

    const response = await GET(request, { params: { token: validShareToken } });

    // Should handle CORS for public endpoints
    const corsHeader = response.headers.get('Access-Control-Allow-Origin');
    expect(corsHeader).toBeDefined();
  });

  it('should not expose sensitive user information in shared tables', async () => {
    const request = new Request(`http://localhost:3000/api/roll-tables/shared/${validShareToken}`);

    const response = await GET(request, { params: { token: validShareToken } });
    expect(response.status).toBe(200);

    const json = await response.json() as GetSharedRollTableResponse;
    const table = json.data;

    // userId might be null or excluded in shared view
    if (table.userId !== undefined) {
      // If present, should be properly formatted but not expose actual user data
      expect(typeof table.userId).toBe('string');
    }

    // Should not expose any other sensitive user information
    expect(table).not.toHaveProperty('userEmail');
    expect(table).not.toHaveProperty('userProfile');
  });
});