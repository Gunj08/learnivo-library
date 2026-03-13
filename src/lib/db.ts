import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "library.db");

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initializeDatabase(db);
  }
  return db;
}

function initializeDatabase(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uid TEXT UNIQUE,
      title TEXT NOT NULL,
      subtitle TEXT,
      slug TEXT UNIQUE NOT NULL,
      author TEXT NOT NULL,
      publisher TEXT,
      description TEXT,
      board TEXT,
      grade TEXT,
      subject TEXT,
      language TEXT DEFAULT 'English',
      tags TEXT,
      file_name TEXT,
      cover_image TEXT,
      status TEXT DEFAULT 'pending',
      downloads INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      rating REAL DEFAULT 0,
      rating_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      approved_at DATETIME,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Try to add uid if table already exists
  try {
    const columns = db.prepare("PRAGMA table_info(books)").all() as any[];
    const hasUid = columns.some(c => c.name === 'uid');
    if (!hasUid) {
      db.exec("ALTER TABLE books ADD COLUMN uid TEXT");
      db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_books_uid ON books(uid)");
    }
  } catch (e) {
    console.error("Migration error:", e);
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      file_name TEXT NOT NULL,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(book_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      details TEXT,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed admin user if not exists
  const bcrypt = require("bcryptjs");
  const adminExists = db.prepare("SELECT * FROM users WHERE username = ?").get(
    process.env.ADMIN_USERNAME || "admin"
  );
  if (!adminExists) {
    const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || "admin123", 10);
    db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run(
      process.env.ADMIN_USERNAME || "admin",
      hash,
      "admin"
    );
  }
}

export default getDb;
