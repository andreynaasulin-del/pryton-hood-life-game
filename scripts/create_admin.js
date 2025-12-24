import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { gameState } from '../src/scripts/modules/game-state.js';

async function main() {
    console.log('Starting admin user creation...');

    const db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    const username = 'adminprytona';
    const password = '414151qwe';
    const hashedPassword = await bcrypt.hash(password, 12);

    // 1. Create or Update User
    let user = await db.get('SELECT * FROM users WHERE username = ?', username);

    if (user) {
        console.log(`User '${username}' exists. Updating password...`);
        await db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
    } else {
        console.log(`Creating new user '${username}'...`);
        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();
        await db.run(
            `INSERT INTO users (id, username, password, createdAt) VALUES (?, ?, ?, ?)`,
            [id, username, hashedPassword, createdAt]
        );
        user = { id };
    }

    // 2. Prepare Game State
    console.log('Generating game state...');
    gameState.reset();
    const state = gameState.getState();

    // 3. Set Cash to 5,000,000
    if (!state.kpis) state.kpis = {};
    state.kpis.cash = 5000000;

    // 4. Save Game State
    const stateStr = JSON.stringify(state);
    const lastSaved = new Date().toISOString();

    await db.run(
        `INSERT INTO game_states (userId, state, lastSaved)
         VALUES (?, ?, ?)
         ON CONFLICT(userId) DO UPDATE SET state = ?, lastSaved = ?`,
        [user.id, stateStr, lastSaved, stateStr, lastSaved]
    );

    console.log(`Admin user '${username}' configured with 5,000,000 cash.`);
    await db.close();
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
