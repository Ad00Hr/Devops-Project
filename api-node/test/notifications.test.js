const request = require('supertest');
const app = require('../src/index');
const {
  setupDatabase,
  cleanupDatabase,
  createTestUser,
  createTestNotifications,
  generateToken,
  countUnreadInDb,
  getNotificationFromDb
} = require('./fixtures/notifications.fixtures');

/**
 * Integration Tests for Notifications API - GET Endpoints
 * Tests list, read single, and unread count endpoints
 */

let user1, user2, token1, token2, notifications1;

beforeAll(async () => {
  await setupDatabase();
});

beforeEach(async () => {
  await cleanupDatabase();
  
  // Create two test users
  user1 = await createTestUser('user1');
  user2 = await createTestUser('user2');
  
  // Generate tokens
  token1 = generateToken(user1.id);
  token2 = generateToken(user2.id);
  
  // Create notifications for user1
  notifications1 = await createTestNotifications(user1.id, 3);
});

afterAll(async () => {
  await cleanupDatabase();
});

// ============================================================================
// GET /api/notifications - List all notifications
// ============================================================================

describe('GET /api/notifications', () => {
  it('should return list of user notifications in DESC order by created_at', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);
    
    // Check newest first
    expect(res.body[0].id).toBe(notifications1[2].id);
    expect(res.body[1].id).toBe(notifications1[1].id);
    expect(res.body[2].id).toBe(notifications1[0].id);
  });

  it('should support pagination with limit and offset', async () => {
    const res = await request(app)
      .get('/api/notifications?limit=2&offset=0')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(2);
  });

  it('should apply offset correctly', async () => {
    const res = await request(app)
      .get('/api/notifications?limit=2&offset=1')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(2);
    // Should skip first one
    expect(res.body[0].id).toBe(notifications1[1].id);
  });

  it('should use default limit of 10 when not specified', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeLessThanOrEqual(10);
  });

  it('should use default offset of 0 when not specified', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body[0].id).toBe(notifications1[2].id);
  });

  it('should return empty array when no notifications exist', async () => {
    const user3 = await createTestUser('user1');
    const token3 = generateToken(user3.id);
    
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token3}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([]);
  });

  it('should isolate notifications by user', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token2}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(0); // user2 has no notifications
  });

  it('should return 401 when missing authorization header', async () => {
    const res = await request(app)
      .get('/api/notifications');

    expect(res.statusCode).toEqual(401);
  });

  it('should return 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.statusCode).toEqual(401);
  });
});

// ============================================================================
// GET /api/notifications/unread-count - Get unread notifications count
// ============================================================================

describe('GET /api/notifications/unread-count', () => {
  it('should return count of unread notifications', async () => {
    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('unreadCount');
    expect(res.body.unreadCount).toBe(3);
  });

  it('should return 0 when all notifications are read', async () => {
    // Mark all as read via database
    for (const notif of notifications1) {
      const db = require('../src/db').openDb ? await require('../src/db').openDb() : null;
      if (db) {
        await db.run('UPDATE notifications SET is_read = 1 WHERE id = ?', [notif.id]);
        await db.close();
      }
    }

    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.unreadCount).toBe(0);
  });

  it('should return 0 for user with no notifications', async () => {
    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${token2}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.unreadCount).toBe(0);
  });

  it('should only count notifications for current user', async () => {
    // Create notifications for user2
    await createTestNotifications(user2.id, 2);

    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.unreadCount).toBe(3); // Only user1's notifications
  });

  it('should return 401 when missing authorization header', async () => {
    const res = await request(app)
      .get('/api/notifications/unread-count');

    expect(res.statusCode).toEqual(401);
  });

  it('should return 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.statusCode).toEqual(401);
  });
});

// ============================================================================
// GET /api/notifications/:id - Get single notification
// ============================================================================

describe('GET /api/notifications/:id', () => {
  it('should return notification details', async () => {
    const notifId = notifications1[0].id;
    
    const res = await request(app)
      .get(`/api/notifications/${notifId}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toBe(notifId);
    expect(res.body.user_id).toBe(user1.id);
    expect(res.body.type).toBe('message');
    expect(res.body.message).toBeDefined();
    expect(res.body.is_read).toBe(0);
  });

  it('should return notification with all fields', async () => {
    const notifId = notifications1[0].id;
    
    const res = await request(app)
      .get(`/api/notifications/${notifId}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('user_id');
    expect(res.body).toHaveProperty('type');
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('is_read');
    expect(res.body).toHaveProperty('created_at');
  });

  it('should return 404 for non-existent notification', async () => {
    const res = await request(app)
      .get('/api/notifications/99999')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toBe('Notification non trouvée');
  });

  it('should prevent user from reading another user\'s notification', async () => {
    const notifId = notifications1[0].id;
    
    const res = await request(app)
      .get(`/api/notifications/${notifId}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.statusCode).toEqual(404); // User isolation
  });

  it('should return 401 when missing authorization header', async () => {
    const notifId = notifications1[0].id;
    
    const res = await request(app)
      .get(`/api/notifications/${notifId}`);

    expect(res.statusCode).toEqual(401);
  });

  it('should return 401 with invalid token', async () => {
    const notifId = notifications1[0].id;
    
    const res = await request(app)
      .get(`/api/notifications/${notifId}`)
      .set('Authorization', 'Bearer invalid-token');

    expect(res.statusCode).toEqual(401);
  });

  it('should handle invalid notification ID format gracefully', async () => {
    const res = await request(app)
      .get('/api/notifications/invalid-id')
      .set('Authorization', `Bearer ${token1}`);

    // Should return 404 (not found) since invalid ID won't match
    expect(res.statusCode).toEqual(404);
  });
});
