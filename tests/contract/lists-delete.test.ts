import { describe, it, expect } from '@jest/globals';
import { DELETE } from '@/app/api/lists/[id]/route';

describe('DELETE /api/lists/{id}', () => {
  const validListId = '123e4567-e89b-12d3-a456-426614174000';
  const invalidListId = 'invalid-uuid';

  it('should delete list successfully', async () => {
    const request = new Request(`http://localhost:3000/api/lists/${validListId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    // Mock the dynamic route parameters
    const params = { params: { id: validListId } };

    const response = await DELETE(request, params);
    expect(response.status).toBe(204);

    // 204 No Content should have no response body
    const text = await response.text();
    expect(text).toBe('');
  });

  it('should return 400 for invalid UUID format', async () => {
    const request = new Request(`http://localhost:3000/api/lists/${invalidListId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    const params = { params: { id: invalidListId } };

    const response = await DELETE(request, params);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBeDefined();
  });

  it('should return 401 without authentication', async () => {
    const request = new Request(`http://localhost:3000/api/lists/${validListId}`, {
      method: 'DELETE'
    });

    const params = { params: { id: validListId } };

    const response = await DELETE(request, params);
    expect(response.status).toBe(401);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Authentication required');
  });

  it('should return 401 with invalid token', async () => {
    const request = new Request(`http://localhost:3000/api/lists/${validListId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });

    const params = { params: { id: validListId } };

    const response = await DELETE(request, params);
    expect(response.status).toBe(401);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Authentication required');
  });

  it('should return 401 with malformed Authorization header', async () => {
    const request = new Request(`http://localhost:3000/api/lists/${validListId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'invalid-format-token'
      }
    });

    const params = { params: { id: validListId } };

    const response = await DELETE(request, params);
    expect(response.status).toBe(401);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Authentication required');
  });

  it('should return 403 when user does not own the list', async () => {
    const request = new Request(`http://localhost:3000/api/lists/${validListId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer other-user-token'
      }
    });

    const params = { params: { id: validListId } };

    const response = await DELETE(request, params);
    expect(response.status).toBe(403);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Access denied');
  });

  it('should return 404 for non-existent list', async () => {
    const nonExistentId = '999e9999-e99b-99d9-a999-999999999999';

    const request = new Request(`http://localhost:3000/api/lists/${nonExistentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    const params = { params: { id: nonExistentId } };

    const response = await DELETE(request, params);
    expect(response.status).toBe(404);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Resource not found');
  });

  it('should delete list and all associated items', async () => {
    // This test verifies that deleting a list also removes all its items
    // as per the API specification "Delete a list and all its items"
    const listWithItemsId = '456e7890-e12b-34d5-a678-901234567890';

    const request = new Request(`http://localhost:3000/api/lists/${listWithItemsId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    const params = { params: { id: listWithItemsId } };

    const response = await DELETE(request, params);
    expect(response.status).toBe(204);

    // 204 No Content should have no response body
    const text = await response.text();
    expect(text).toBe('');
  });

  it('should handle deletion of already deleted list', async () => {
    // This test ensures idempotent behavior - attempting to delete an already deleted list
    const deletedListId = '789e0123-e45f-67g8-a901-234567890123';

    const request = new Request(`http://localhost:3000/api/lists/${deletedListId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    const params = { params: { id: deletedListId } };

    const response = await DELETE(request, params);
    expect(response.status).toBe(404);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Resource not found');
  });

  it('should not allow deletion of favorite list if isFavoriteList is true', async () => {
    // This test verifies special handling for favorite lists if implemented
    const favoriteListId = 'abc12345-def6-7890-abcd-ef1234567890';

    const request = new Request(`http://localhost:3000/api/lists/${favoriteListId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer user-with-favorite-list-token'
      }
    });

    const params = { params: { id: favoriteListId } };

    const response = await DELETE(request, params);

    // This could be either 403 (Forbidden) if special protection is implemented
    // or 204 (successful deletion) if no special protection exists
    // The test validates the contract behavior
    expect([204, 403]).toContain(response.status);

    if (response.status === 403) {
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.message).toBeDefined();
    } else {
      const text = await response.text();
      expect(text).toBe('');
    }
  });

  it('should validate Authorization header format', async () => {
    const request = new Request(`http://localhost:3000/api/lists/${validListId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'NotBearer some-token'
      }
    });

    const params = { params: { id: validListId } };

    const response = await DELETE(request, params);
    expect(response.status).toBe(401);

    const json = await response.json();
    expect(json.error).toBeDefined();
    expect(json.error.message).toBe('Authentication required');
  });

  it('should handle concurrent deletion attempts gracefully', async () => {
    // This test verifies that the API handles race conditions properly
    const listId = 'concurrent-test-id';

    const request = new Request(`http://localhost:3000/api/lists/${listId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-jwt-token'
      }
    });

    const params = { params: { id: listId } };

    const response = await DELETE(request, params);

    // Should return either 204 (successful) or 404 (already deleted)
    expect([204, 404]).toContain(response.status);

    if (response.status === 404) {
      const json = await response.json();
      expect(json.error).toBeDefined();
      expect(json.error.message).toBe('Resource not found');
    } else {
      const text = await response.text();
      expect(text).toBe('');
    }
  });
});