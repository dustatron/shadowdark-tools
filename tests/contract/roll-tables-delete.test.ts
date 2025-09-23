import { describe, it, expect } from '@jest/globals';
import { DELETE } from '@/app/api/roll-tables/[id]/route';

describe('DELETE /api/roll-tables/{id}', () => {
  const validTableId = '123e4567-e89b-12d3-a456-426614174000';

  it('should delete a roll table successfully', async () => {
    const request = new Request(`http://localhost:3000/api/roll-tables/${validTableId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    const response = await DELETE(request, { params: { id: validTableId } });
    expect(response.status).toBe(204);

    // 204 No Content should not have a response body
    const text = await response.text();
    expect(text).toBe('');
  });

  it('should return 400 for invalid UUID format', async () => {
    const invalidId = 'invalid-uuid';

    const request = new Request(`http://localhost:3000/api/roll-tables/${invalidId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    const response = await DELETE(request, { params: { id: invalidId } });
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toContain('Invalid');
  });

  it('should return 401 without authentication', async () => {
    const request = new Request(`http://localhost:3000/api/roll-tables/${validTableId}`, {
      method: 'DELETE'
    });

    const response = await DELETE(request, { params: { id: validTableId } });
    expect(response.status).toBe(401);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Authentication required');
  });

  it('should return 401 with invalid token', async () => {
    const request = new Request(`http://localhost:3000/api/roll-tables/${validTableId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });

    const response = await DELETE(request, { params: { id: validTableId } });
    expect(response.status).toBe(401);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Authentication required');
  });

  it('should return 401 with malformed authorization header', async () => {
    const request = new Request(`http://localhost:3000/api/roll-tables/${validTableId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'InvalidFormat'
      }
    });

    const response = await DELETE(request, { params: { id: validTableId } });
    expect(response.status).toBe(401);

    const json = await response.json();
    expect(json.error).toBeDefined();
  });

  it('should return 403 for table owned by different user', async () => {
    const request = new Request(`http://localhost:3000/api/roll-tables/${validTableId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer different-user-token'
      }
    });

    const response = await DELETE(request, { params: { id: validTableId } });
    expect(response.status).toBe(403);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Access denied');
  });

  it('should return 404 for non-existent table', async () => {
    const nonExistentId = '987fcdeb-51a2-43d1-9c45-123456789abc';

    const request = new Request(`http://localhost:3000/api/roll-tables/${nonExistentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    const response = await DELETE(request, { params: { id: nonExistentId } });
    expect(response.status).toBe(404);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Resource not found');
  });

  it('should handle concurrent deletion attempts', async () => {
    // Test race condition where table might be deleted between requests
    const request1 = new Request(`http://localhost:3000/api/roll-tables/${validTableId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    const request2 = new Request(`http://localhost:3000/api/roll-tables/${validTableId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    // First request should succeed
    const response1 = await DELETE(request1, { params: { id: validTableId } });
    expect([204, 404]).toContain(response1.status);

    // Second request should return 404 (already deleted)
    const response2 = await DELETE(request2, { params: { id: validTableId } });
    expect(response2.status).toBe(404);
  });

  it('should validate table belongs to authenticated user before deletion', async () => {
    // Test that we properly check ownership before allowing deletion
    const publicTableId = 'abc12345-def6-7890-abcd-ef1234567890';

    const request = new Request(`http://localhost:3000/api/roll-tables/${publicTableId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer different-user-token'
      }
    });

    const response = await DELETE(request, { params: { id: publicTableId } });
    expect([403, 404]).toContain(response.status);

    if (response.status === 403) {
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.message).toBe('Access denied');
    }
  });
});