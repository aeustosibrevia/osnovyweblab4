import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(currentDir, '../../data');

fs.mkdirSync(dataDir, { recursive: true });

const database = new Database(path.join(dataDir, 'apartments.db'));

database.pragma('journal_mode = WAL');
database.pragma('foreign_keys = ON');

database.exec(`
  CREATE TABLE IF NOT EXISTS apartments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    district TEXT NOT NULL,
    address TEXT NOT NULL,
    floor INTEGER NOT NULL CHECK (floor BETWEEN 1 AND 100),
    area REAL NOT NULL CHECK (area > 0),
    rooms INTEGER NOT NULL CHECK (rooms BETWEEN 1 AND 20),
    owner_name TEXT NOT NULL,
    owner_phone TEXT NOT NULL,
    price REAL NOT NULL CHECK (price > 0),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

export default database;
