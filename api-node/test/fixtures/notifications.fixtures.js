const { openDb } = require('../../src/db');
const { hashPassword } = require('../../src/utils/password');
const jwt = require('jsonwebtoken');

/**
 * Test Fixtures for Notifications
 * Provides reusable setup and teardown functions
 */

const TEST_USERS = {
  user1: {
    username: 'testuser1',
    email: 'user1@test.com',
    password: 'Password1'
  },
  user2: {
    username: 'testuser2',
    email: 'user2@test.com',
    password: 'Password2'
  }
};

const TEST_NOTIFICATIONS = {
  notification1: {
    type: 'message',
    message: 'You have a new message'
  },
  notification2: {
    type: 'update',
    message: 'Your profile was updated'
  },
  notification3: {
    type: 'alert',
    message: 'Important alert'
  }
};

/**
 * Create users table if not exists
 */
async function setupDatabase() {
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);
  
  await db.close();
}

/**
 * Create a test user and return user object with id
 */
async function createTestUser(userKey = 'user1') {
  const db = await openDb();
  const user = TEST_USERS[userKey];
  const hashed = await hashPassword(user.password);
  
  const result = await db.run(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [user.username, user.email, hashed]
  );
  
  await db.close();
  
  return {
    id: result.lastID,
    ...user,
    passwordHash: hashed
  };
}

/**
 * Create a test notification for a user
 */
async function createTestNotification(userId, notificationKey = 'notification1') {
  const db = await openDb();
  const notif = TEST_NOTIFICATIONS[notificationKey];
  
  const result = await db.run(
    'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
    [userId, notif.type, notif.message]
  );
  
  await db.close();
  
  return {
    id: result.lastID,
    user_id: userId,
    ...notif,
    is_read: 0
  };
}

/**
 * Create multiple notifications for a user
 */
async function createTestNotifications(userId, count = 3) {
  const notifications = [];
  const notifKeys = ['notification1', 'notification2', 'notification3'];
  
  for (let i = 0; i < Math.min(count, notifKeys.length); i++) {
    const notif = await createTestNotification(userId, notifKeys[i]);
    notifications.push(notif);
  }
  
  return notifications;
}

/**
 * Generate a JWT token for a user
 */
function generateToken(userId) {
  const secret = process.env.JWT_SECRET || 'test-secret-key';
  return jwt.sign({ userId }, secret, { expiresIn: '1h' });
}

/**
 * Clean all data from tables
 */
async function cleanupDatabase() {
  const db = await openDb();
  await db.run('DELETE FROM notifications');
  await db.run('DELETE FROM users');
  await db.close();
}

/**
 * Get notification from database by id
 */
async function getNotificationFromDb(notificationId) {
  const db = await openDb();
  const notif = await db.get(
    'SELECT * FROM notifications WHERE id = ?',
    [notificationId]
  );
  await db.close();
  return notif;
}

/**
 * Get user from database by id
 */
async function getUserFromDb(userId) {
  const db = await openDb();
  const user = await db.get(
    'SELECT id, username, email, created_at FROM users WHERE id = ?',
    [userId]
  );
  await db.close();
  return user;
}

/**
 * Mark notification as read in database
 */
async function markAsReadInDb(notificationId) {
  const db = await openDb();
  await db.run(
    'UPDATE notifications SET is_read = 1 WHERE id = ?',
    [notificationId]
  );
  await db.close();
}

/**
 * Count unread notifications for user
 */
async function countUnreadInDb(userId) {
  const db = await openDb();
  const result = await db.get(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
    [userId]
  );
  await db.close();
  return result.count;
}

module.exports = {
  // Setup/Cleanup
  setupDatabase,
  cleanupDatabase,
  
  // User fixtures
  createTestUser,
  TEST_USERS,
  
  // Notification fixtures
  createTestNotification,
  createTestNotifications,
  TEST_NOTIFICATIONS,
  
  // Token
  generateToken,
  
  // Database helpers
  getNotificationFromDb,
  getUserFromDb,
  markAsReadInDb,
  countUnreadInDb
};
