import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

export async function initDB() {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      email TEXT,
      password TEXT,
      telegramId TEXT,
      telegramUsername TEXT,
      telegramFirstName TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS game_states (
      userId TEXT PRIMARY KEY,
      state TEXT,
      lastSaved TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    );
  `);

  console.log('📦 Database initialized');
}

export async function createUser(user) {
  const {
    id,
    username,
    email,
    password,
    telegramId,
    telegramUsername,
    telegramFirstName,
    createdAt
  } = user;
  await db.run(
    `INSERT INTO users (id, username, email, password, telegramId, telegramUsername, telegramFirstName, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, username, email, password, telegramId, telegramUsername, telegramFirstName, createdAt]
  );
}

export async function findUserByUsername(username) {
  return await db.get('SELECT * FROM users WHERE username = ?', username);
}

export async function findUserByTelegramId(telegramId) {
  return await db.get('SELECT * FROM users WHERE telegramId = ?', telegramId);
}

export async function findUserById(id) {
  return await db.get('SELECT * FROM users WHERE id = ?', id);
}

export async function saveGameState(userId, state) {
  const stateStr = JSON.stringify(state);
  const lastSaved = new Date().toISOString();
  await db.run(
    `INSERT INTO game_states (userId, state, lastSaved)
     VALUES (?, ?, ?)
     ON CONFLICT(userId) DO UPDATE SET state = ?, lastSaved = ?`,
    [userId, stateStr, lastSaved, stateStr, lastSaved]
  );
}

export async function loadGameState(userId) {
  const row = await db.get('SELECT state FROM game_states WHERE userId = ?', userId);
  return row ? JSON.parse(row.state) : null;
}

export async function getAllGameStates() {
  const rows = await db.all(
    'SELECT users.username, game_states.state FROM game_states JOIN users ON game_states.userId = users.id'
  );
  return rows.map((row) => {
    const state = JSON.parse(row.state);
    return {
      username: row.username,
      state
    };
  });
}
