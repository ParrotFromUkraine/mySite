// Database module for chat application
// Uses SQLite for persistent storage

const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, 'data', 'chat.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    text TEXT NOT NULL,
    timestamp TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
  CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
`);

// User operations
const userOps = {
  // Create new user
  create(username, password) {
    const hashedPassword = bcrypt.hashSync(password, 12);
    const id = uuidv4();
    
    const stmt = db.prepare(`
      INSERT INTO users (id, username, password) VALUES (?, ?, ?)
    `);
    
    try {
      stmt.run(id, username, hashedPassword);
      return { id, username };
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('Користувач вже існує');
      }
      throw error;
    }
  },

  // Find user by username
  findByUsername(username) {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username);
  },

  // Find user by ID
  findById(id) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  },

  // Get all users
  getAll() {
    const stmt = db.prepare('SELECT id, username, created_at FROM users ORDER BY username');
    return stmt.all();
  },

  // Verify password
  verifyPassword(user, password) {
    return bcrypt.compareSync(password, user.password);
  }
};

// Message operations
const messageOps = {
  // Save new message
  create(userId, username, text) {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO messages (id, user_id, username, text) VALUES (?, ?, ?, ?)
    `);
    
    stmt.run(id, userId, username, text);
    
    // Get the created message with timestamp
    const getStmt = db.prepare('SELECT * FROM messages WHERE id = ?');
    return getStmt.get(id);
  },

  // Get recent messages
  getRecent(limit = 50) {
    const stmt = db.prepare(`
      SELECT * FROM messages ORDER BY timestamp DESC LIMIT ?
    `);
    const messages = stmt.all(limit);
    return messages.reverse();
  },

  // Get messages by user
  getByUser(userId, limit = 50) {
    const stmt = db.prepare(`
      SELECT * FROM messages WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?
    `);
    return stmt.all(userId, limit).reverse();
  },

  // Get total message count
  getCount() {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM messages');
    return stmt.get().count;
  },

  // Delete old messages (keep last N messages)
  cleanup(keepLast = 1000) {
    const count = this.getCount();
    if (count > keepLast) {
      const deleteCount = count - keepLast;
      const stmt = db.prepare(`
        DELETE FROM messages WHERE id IN (
          SELECT id FROM messages ORDER BY timestamp ASC LIMIT ?
        )
      `);
      stmt.run(deleteCount);
      console.log(`[DB] Видалено ${deleteCount} старих повідомлень`);
    }
  }
};

module.exports = {
  db,
  users: userOps,
  messages: messageOps
};
