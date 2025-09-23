import { describe, it, expect } from '@jest/globals';
import { PUT } from '@/app/api/roll-tables/[id]/route';
import { UpdateRollTableResponse } from '@/types/api';
import { UpdateRollTableRequest, RollTableData } from '@/types/tables';

describe('PUT /api/roll-tables/{id}', () => {
  const validTableData: RollTableData = {
    rolls: [
      { roll: 1, magicItemId: 'sword-of-flame', customText: null },
      { roll: 2, magicItemId: 'ring-of-protection', customText: null },
      { roll: 3, magicItemId: null, customText: 'Updated custom treasure' }
    ],
    metadata: {
      generatedAt: '2025-01-23T11:00:00Z',
      sourceListName: 'Updated Test List',
      fillStrategy: 'manual'
    }
  };

  const validTableId = '123e4567-e89b-12d3-a456-426614174000';

  it('should update a roll table with valid data', async () => {
    const requestBody: UpdateRollTableRequest = {
      name: 'Updated Treasure Table d20',
      dieSize: 12,
      tableData: validTableData
    };

    const request = new Request(`http://localhost:3000/api/roll-tables/${validTableId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await PUT(request, { params: { id: validTableId } });
    expect(response.status).toBe(200);

    const json = await response.json() as UpdateRollTableResponse;
    expect(json.data).toBeDefined();
    expect(json.data.name).toBe(requestBody.name);
    expect(json.data.dieSize).toBe(requestBody.dieSize);
    expect(json.data.tableData).toEqual(requestBody.tableData);
    expect(json.data.id).toBe(validTableId);
    expect(json.data.updatedAt).toBeDefined();
  });

  it('should update only name', async () => {
    const requestBody: UpdateRollTableRequest = {
      name: 'Just Updated Name'
    };

    const request = new Request(`http://localhost:3000/api/roll-tables/${validTableId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await PUT(request, { params: { id: validTableId } });
    expect(response.status).toBe(200);

    const json = await response.json() as UpdateRollTableResponse;
    expect(json.data).toBeDefined();
    expect(json.data.name).toBe(requestBody.name);
  });

  it('should update only die size', async () => {
    const requestBody: UpdateRollTableRequest = {
      dieSize: 8
    };

    const request = new Request(`http://localhost:3000/api/roll-tables/${validTableId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await PUT(request, { params: { id: validTableId } });
    expect(response.status).toBe(200);

    const json = await response.json() as UpdateRollTableResponse;
    expect(json.data).toBeDefined();
    expect(json.data.dieSize).toBe(requestBody.dieSize);
  });

  it('should update only table data', async () => {
    const requestBody: UpdateRollTableRequest = {
      tableData: validTableData
    };

    const request = new Request(`http://localhost:3000/api/roll-tables/${validTableId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await PUT(request, { params: { id: validTableId } });
    expect(response.status).toBe(200);

    const json = await response.json() as UpdateRollTableResponse;
    expect(json.data).toBeDefined();
    expect(json.data.tableData).toEqual(requestBody.tableData);
  });

  it('should return 400 for invalid die size', async () => {
    const requestBody: UpdateRollTableRequest = {
      dieSize: 0 // Invalid - below minimum
    };

    const request = new Request(`http://localhost:3000/api/roll-tables/${validTableId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await PUT(request, { params: { id: validTableId } });
    expect(response.status).toBe(400);
  });

  it('should return 400 for die size above maximum', async () => {
    const requestBody: UpdateRollTableRequest = {
      dieSize: 10001 // Invalid - above maximum
    };

    const request = new Request(`http://localhost:3000/api/roll-tables/${validTableId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await PUT(request, { params: { id: validTableId } });
    expect(response.status).toBe(400);
  });

  it('should return 400 for name too long', async () => {
    const requestBody: UpdateRollTableRequest = {
      name: 'a'.repeat(101) // Exceeds maxLength of 100
    };

    const request = new Request(`http://localhost:3000/api/roll-tables/${validTableId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await PUT(request, { params: { id: validTableId } });
    expect(response.status).toBe(400);
  });

  it('should return 400 for empty request body', async () => {
    const request = new Request(`http://localhost:3000/api/roll-tables/${validTableId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({}) // Empty update
    });

    const response = await PUT(request, { params: { id: validTableId } });
    expect(response.status).toBe(400);
  });

  it('should return 400 for invalid UUID format', async () => {
    const invalidId = 'invalid-uuid';
    const requestBody: UpdateRollTableRequest = {
      name: 'Valid Name'
    };

    const request = new Request(`http://localhost:3000/api/roll-tables/${invalidId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await PUT(request, { params: { id: invalidId } });
    expect(response.status).toBe(400);
  });

  it('should return 401 without authentication', async () => {
    const requestBody: UpdateRollTableRequest = {
      name: 'Unauthorized Update'
    };

    const request = new Request(`http://localhost:3000/api/roll-tables/${validTableId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await PUT(request, { params: { id: validTableId } });
    expect(response.status).toBe(401);
  });

  it('should return 401 with invalid token', async () => {
    const requestBody: UpdateRollTableRequest = {
      name: 'Invalid Token Update'
    };

    const request = new Request(`http://localhost:3000/api/roll-tables/${validTableId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer invalid-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await PUT(request, { params: { id: validTableId } });
    expect(response.status).toBe(401);
  });

  it('should return 403 for table owned by different user', async () => {
    const requestBody: UpdateRollTableRequest = {
      name: 'Forbidden Update'
    };

    const request = new Request(`http://localhost:3000/api/roll-tables/${validTableId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer different-user-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await PUT(request, { params: { id: validTableId } });
    expect(response.status).toBe(403);
  });

  it('should return 404 for non-existent table', async () => {
    const nonExistentId = '987fcdeb-51a2-43d1-9c45-123456789abc';
    const requestBody: UpdateRollTableRequest = {
      name: 'Update Non-Existent'
    };

    const request = new Request(`http://localhost:3000/api/roll-tables/${nonExistentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer valid-jwt-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const response = await PUT(request, { params: { id: nonExistentId } });
    expect(response.status).toBe(404);
  });
});