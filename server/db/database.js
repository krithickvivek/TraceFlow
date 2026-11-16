/**
 * @file database.js
 * @description Initializes better-sqlite3 database, runs schema migration on startup.
 * @module db/database
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

/* SCALING PATH:
 * Current: better-sqlite3 (single file, zero-config, great for <10k users)
 * Next: Replace with PostgreSQL via pg or Prisma ORM
 * Then: Add Redis for session caching + rate limiting
 * Then: Extract algorithm step generation to a worker service
 * Then: Add WebSocket support for collaborative/live sessions
 */

/** Path to the SQLite database file. */
/* On Vercel the project directory is read-only; /tmp is the only writable path
 * (data there is ephemeral — fine for a demo, replace with a hosted DB later). */
const DB_PATH = process.env.VERCEL
  ? path.join('/tmp', 'traceflow.db')
  : path.join(__dirname, '..', 'traceflow.db');

/** Path to the schema SQL file. */
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

/** @type {import('better-sqlite3').Database} */
let db;

/**
 * Initialize the database connection and run schema migration.
 *
 * @returns {import('better-sqlite3').Database} The database instance.
 */
function initDatabase() {
  if (db) return db;

  db = new Database(DB_PATH);

  /* Enable WAL mode for better concurrent read performance. */
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  /* Run schema migration. */
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schema);

  /* Add new profile columns to existing databases. */
  const newColumns = [
    { name: 'role', definition: "TEXT DEFAULT ''" },
    { name: 'organization', definition: "TEXT DEFAULT ''" },
    { name: 'experience_level', definition: "TEXT DEFAULT ''" },
    { name: 'bio', definition: "TEXT DEFAULT ''" },
    { name: 'profile_pic', definition: "TEXT DEFAULT ''" }
  ];
  for (const col of newColumns) {
    try {
      db.exec(`ALTER TABLE users ADD COLUMN ${col.name} ${col.definition}`);
    } catch (_err) {
      /* Column already exists – ignore. */
    }
  }

  /* Add new columns to saved_visualizations for existing databases. */
  const savedCols = [
    { name: 'speed_ms', definition: 'INTEGER DEFAULT 0' },
    { name: 'difficulty', definition: "TEXT DEFAULT ''" },
  ];
  for (const col of savedCols) {
    try {
      db.exec(`ALTER TABLE saved_visualizations ADD COLUMN ${col.name} ${col.definition}`);
    } catch (_err) {
      /* Column already exists – ignore. */
    }
  }

  console.log('[DB] SQLite database initialized at', DB_PATH);
  return db;
}

/**
 * Get the active database instance.
 *
 * @returns {import('better-sqlite3').Database}
 */
function getDatabase() {
  if (!db) return initDatabase();
  return db;
}

module.exports = { initDatabase, getDatabase };
