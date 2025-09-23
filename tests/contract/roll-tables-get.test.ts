import { describe, it, expect } from '@jest/globals';
import { GET } from '@/app/api/roll-tables/route';
import { GetRollTablesResponse } from '@/types/api';

describe('GET /api/roll-tables', () => {
  it('should return user roll tables with authentication', async () => {
    const request = new Request('http://localhost:3000/api/roll-tables', {
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    const response = await GET(request);
    expect(response.status).toBe(200);

    const json = await response.json() as GetRollTablesResponse;
    expect(json.data).toBeDefined();
    expect(Array.isArray(json.data)).toBe(true);

    // Validate roll table structure
    if (json.data.length > 0) {
      const table = json.data[0];
      expect(table.id).toBeDefined();
      expect(table.name).toBeDefined();
      expect(typeof table.dieSize).toBe('number');
      expect(table.dieSize).toBeGreaterThanOrEqual(1);
      expect(table.dieSize).toBeLessThanOrEqual(10000);
      expect(table.shareToken).toBeDefined();
      expect(table.tableData).toBeDefined();
      expect(Array.isArray(table.tableData.rolls)).toBe(true);
      expect(table.tableData.metadata).toBeDefined();
    }
  });

  it('should return 401 without authentication', async () => {
    const request = new Request('http://localhost:3000/api/roll-tables');

    const response = await GET(request);
    expect(response.status).toBe(401);
  });
});