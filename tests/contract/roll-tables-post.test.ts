import { describe, it, expect } from '@jest/globals';
import { POST } from '@/app/api/roll-tables/route';
import { CreateRollTableResponse } from '@/types/api';
import { CreateRollTableRequest, RollTableData } from '@/types/tables';

describe('POST /api/roll-tables', () => {
  const validTableData: RollTableData = {
    rolls: [
      { roll: 1, magicItemId: 'sword-of-flame', customText: null },
      { roll: 2, magicItemId: 'ring-of-protection', customText: null },
      { roll: 3, magicItemId: null, customText: 'Custom treasure' }
    ],
    metadata: {
      generatedAt: '2025-01-23T10:30:00Z',
      sourceListName: 'Test List',
      fillStrategy: 'auto'
    }
  };

  it('should create a new roll table with valid data', async () => {
    const requestBody: CreateRollTableRequest = {
      name: 'Test Treasure Table d20',
      dieSize: 20,
      sourceListId: '123e4567-e89b-12d3-a456-426614174000',
      tableData: validTableData
    };

    const request = new Request('http://localhost:3000/api/roll-tables', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    expect(response.status).toBe(201);

    const json = await response.json() as CreateRollTableResponse;
    expect(json.data).toBeDefined();
    expect(json.data.name).toBe(requestBody.name);
    expect(json.data.dieSize).toBe(requestBody.dieSize);
    expect(json.data.sourceListId).toBe(requestBody.sourceListId);
    expect(json.data.id).toBeDefined();
    expect(json.data.shareToken).toBeDefined();
    expect(json.data.tableData).toEqual(requestBody.tableData);
    expect(json.data.createdAt).toBeDefined();
    expect(json.data.updatedAt).toBeDefined();
  });

  it('should create a roll table without source list', async () => {
    const requestBody: CreateRollTableRequest = {
      name: 'Manual Roll Table',
      dieSize: 6,
      sourceListId: null,
      tableData: {
        rolls: [
          { roll: 1, magicItemId: null, customText: 'First option' },
          { roll: 2, magicItemId: null, customText: 'Second option' }
        ],
        metadata: {
          generatedAt: '2025-01-23T10:30:00Z',
          fillStrategy: 'manual'
        }
      }
    };

    const request = new Request('http://localhost:3000/api/roll-tables', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    expect(response.status).toBe(201);

    const json = await response.json() as CreateRollTableResponse;
    expect(json.data).toBeDefined();
    expect(json.data.sourceListId).toBeNull();
    expect(json.data.tableData.metadata.fillStrategy).toBe('manual');
  });

  it('should return 400 for missing required fields', async () => {
    const requestBody = {
      dieSize: 20,
      tableData: validTableData
      // Missing name
    };

    const request = new Request('http://localhost:3000/api/roll-tables', {
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

  it('should return 400 for invalid die size', async () => {
    const requestBody: CreateRollTableRequest = {
      name: 'Invalid Die Size Table',
      dieSize: 0, // Invalid - below minimum
      tableData: validTableData
    };

    const request = new Request('http://localhost:3000/api/roll-tables', {
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

  it('should return 400 for die size above maximum', async () => {
    const requestBody: CreateRollTableRequest = {
      name: 'Too Large Die Size Table',
      dieSize: 10001, // Invalid - above maximum
      tableData: validTableData
    };

    const request = new Request('http://localhost:3000/api/roll-tables', {
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

  it('should return 400 for invalid table data structure', async () => {
    const requestBody = {
      name: 'Invalid Table Data',
      dieSize: 20,
      tableData: {
        rolls: [], // Empty rolls array
        metadata: {
          generatedAt: '2025-01-23T10:30:00Z',
          fillStrategy: 'auto'
        }
      }
    };

    const request = new Request('http://localhost:3000/api/roll-tables', {
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

  it('should return 400 for name too long', async () => {
    const requestBody: CreateRollTableRequest = {
      name: 'a'.repeat(101), // Exceeds maxLength of 100
      dieSize: 20,
      tableData: validTableData
    };

    const request = new Request('http://localhost:3000/api/roll-tables', {
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

  it('should return 401 without authentication', async () => {
    const requestBody: CreateRollTableRequest = {
      name: 'Unauthorized Table',
      dieSize: 20,
      tableData: validTableData
    };

    const request = new Request('http://localhost:3000/api/roll-tables', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should return 401 with invalid token', async () => {
    const requestBody: CreateRollTableRequest = {
      name: 'Invalid Token Table',
      dieSize: 20,
      tableData: validTableData
    };

    const request = new Request('http://localhost:3000/api/roll-tables', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer invalid-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});