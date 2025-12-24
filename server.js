import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import {
  initDB,
  createUser,
  findUserByUsername,
  findUserByTelegramId,
  findUserById,
  saveGameState,
  loadGameState,
  getAllGameStates
} from './database.js';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not defined.');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Database
initDB().catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Middleware Security
// 0. Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many login attempts, please try again later' }
});

const gameLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per windowMs
  message: { error: 'Too many requests, please slow down' }
});

// 1. CORS Restriction (В продакшене замени '*' на свой домен)
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? 'https://your-game-domain.com' : '*',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// 2. Body size limit (защита от переполнения)
app.use(express.json({ limit: '1mb' }));
app.use(express.static('src'));

// Helper: Input Validation
function validateInput(data, type) {
  if (type === 'username') {
    return (
      typeof data === 'string' &&
      data.length >= 3 &&
      data.length <= 20 &&
      /^[a-zA-Z0-9_]+$/.test(data)
    );
  }
  if (type === 'password') {
    return typeof data === 'string' && data.length >= 6;
  }
  return true;
}

function verifyTelegramWebAppData(telegramInitData) {
  const encoded = decodeURIComponent(telegramInitData);
  const secret = crypto
    .createHmac('sha256', 'WebAppData')
    .update(process.env.TELEGRAM_BOT_TOKEN)
    .digest();
  const arr = encoded.split('&');
  const hashIndex = arr.findIndex((str) => str.startsWith('hash='));
  const hash = arr.splice(hashIndex, 1)[0].split('=')[1];

  const dataCheckString = arr.sort().join('\n');
  const _hash = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');
  return _hash === hash;
}

function validateRegistration(username, password, email) {
  if (!username || username.length < 3) return 'Username must be at least 3 characters';
  if (!password || password.length < 6) return 'Password must be at least 6 characters';
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
  return null;
}

function validateGameState(state) {
  if (!state || typeof state !== 'object') return false;

  // Validate KPIs
  if (state.kpis) {
    if (typeof state.kpis.cash !== 'number' || !Number.isFinite(state.kpis.cash)) return false;
  }

  // Validate Stats
  if (state.stats) {
    const statKeys = ['health', 'energy', 'hunger', 'mood', 'withdrawal', 'stability', 'adequacy'];
    for (const key of statKeys) {
      if (state.stats[key] !== undefined) {
        if (typeof state.stats[key] !== 'number' || !Number.isFinite(state.stats[key])) return false;
        // Allow slight buffer for floating point or temporary overflow before clamping
        if (state.stats[key] < -50 || state.stats[key] > 150) return false;
      }
    }
  }

  return true;
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Routes

// Register with Validation
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!validateInput(username, 'username')) {
      return res.status(400).json({ error: 'Username must be 3-20 chars, alphanumeric.' });
    }
    if (!validateInput(password, 'password')) {
      return res.status(400).json({ error: 'Password must be at least 6 chars.' });
    }

    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = {
      id: crypto.randomUUID(), // Better ID generation
      username,
      email: email || null,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      telegramId: null,
      telegramUsername: null,
      telegramFirstName: null
    };

    await createUser(user);

    const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      message: 'User created',
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login with Rate Limiting (Simulated via delay to prevent brute-force)
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    // Artificial delay against timing attacks
    await new Promise((resolve) => setTimeout(resolve, 500));

    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

    const user = await findUserByUsername(username);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Telegram auth
app.post('/api/auth/telegram', async (req, res) => {
  try {
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({ error: 'No initData provided' });
    }

    // Dev bypass for localhost
    if (
      initData === 'dev_mock_data' &&
      (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV)
    ) {
      const telegramId = '999999999';
      const username = 'dev_guest';
      const firstName = 'Dev User';

      let user = await findUserByTelegramId(telegramId);

      if (!user) {
        user = {
          id: Date.now().toString(),
          username: username,
          email: null,
          password: await bcrypt.hash('dev_password', 12),
          createdAt: new Date().toISOString(),
          telegramId: telegramId,
          telegramUsername: username,
          telegramFirstName: firstName
        };
        await createUser(user);
      }

      const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, {
        expiresIn: '7d'
      });

      return res.json({
        message: 'Dev auth successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          telegramUsername: user.telegramUsername
        }
      });
    }

    if (!process.env.TELEGRAM_BOT_TOKEN) {
      return res.status(500).json({ error: 'Telegram not configured on server' });
    }

    const isValid = verifyTelegramWebAppData(initData);
    if (!isValid) {
      return res.status(403).json({ error: 'Invalid Telegram data' });
    }

    const params = new URLSearchParams(initData);
    const userData = JSON.parse(params.get('user'));

    if (!userData || !userData.id) {
      return res.status(400).json({ error: 'Invalid user data in initData' });
    }

    const telegramId = userData.id.toString();
    const username = userData.username;
    const firstName = userData.first_name;

    let user = await findUserByTelegramId(telegramId);

    if (!user) {
      user = {
        id: Date.now().toString(),
        username: username || `tg_${telegramId}`,
        email: null,
        password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 12),
        createdAt: new Date().toISOString(),
        telegramId: telegramId,
        telegramUsername: username,
        telegramFirstName: firstName
      };
      await createUser(user);
      console.log(`📱 New Telegram user created: ${user.username} (${telegramId})`);
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      message: 'Telegram auth successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        telegramUsername: user.telegramUsername
      }
    });
  } catch (error) {
    console.error('Telegram auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await findUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        telegramUsername: user.telegramUsername
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save Game (Validation added)
app.post('/api/game/save', gameLimiter, authenticateToken, async (req, res) => {
  try {
    const gameState = req.body;

    // Basic validation ensuring it's an object and not too huge
    if (typeof gameState !== 'object' || JSON.stringify(gameState).length > 50000) {
      return res.status(400).json({ error: 'Game state too large or invalid' });
    }

    if (!validateGameState(gameState)) {
      console.warn(`[SECURITY] Invalid game state rejected for user ${req.user.userId}`);
      return res.status(400).json({ error: 'Invalid game state data values' });
    }

    await saveGameState(req.user.userId, gameState);
    res.json({ message: 'Saved' });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: 'Failed to save' });
  }
});

// Load game state
app.get('/api/game/load', authenticateToken, async (req, res) => {
  try {
    const gameState = await loadGameState(req.user.userId);
    res.json({ gameState });
  } catch (error) {
    console.error('Load error:', error);
    res.status(500).json({ error: 'Failed to load game state' });
  }
});

// Leaderboard
app.get('/api/game/leaderboard', async (req, res) => {
  try {
    const type = req.query.type || 'respect';
    const allStates = await getAllGameStates();

    const leaderboard = allStates
      .filter((item) => item.state.kpis && item.state.kpis[type])
      .map((item) => ({
        username: item.username || 'Anonymous',
        value: item.state.kpis[type],
        day: item.state.day || 1
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    res.json({ leaderboard, type });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Doctor chat (context-aware)
app.post('/api/doctor/chat', authenticateToken, async (req, res) => {
  try {
    const { message, gameState } = req.body;

    // Default responses
    let responses = [
      'Расскажи подробнее, что тебя беспокоит?',
      'Это нормально в твоём положении. Главное — не сдаваться.',
      'Вижу, что стабильность проседает. Может, стоит снизить темп?',
      'Ты уже давно не спал нормально. Это сказывается.',
      'Если совсем плохо — всегда можно в стационар. Но лучше не доводить.',
      'Как твоя адекватность? Выглядит не очень.',
      'Дух опять злится? Он всегда так.',
      'Попробуй поспать нормально пару дней.',
      'Может, таблетки назначить? Но это игровые, конечно.'
    ];

    // Context-aware responses based on gameState
    if (gameState && gameState.stats) {
      const stats = gameState.stats;
      const spirit = gameState.spirit;

      // Critical Health
      if (stats.health < 30) {
        responses = [
          'Твое здоровье критическое. Тебе нужен стационар или хотя бы сон.',
          'Ты выглядишь ужасно. Если продолжишь в том же духе, трип закончится плохо.',
          'Я серьезно, тебе нужно отдохнуть. Организм не железный.'
        ];
      }
      // Low Adequacy / Trip
      else if (stats.adequacy < 40) {
        responses = [
          'Ты меня вообще слышишь? Твои зрачки... они огромные.',
          'Кажется, у тебя начинается психоз. Прими "Резак тревоги", срочно.',
          'Ты говоришь с голосами в голове или со мной?'
        ];
      }
      // High Withdrawal
      else if (stats.withdrawal > 60) {
        responses = [
          'У тебя сильная ломка. Это опасно. Держись.',
          'Вижу, как тебя трясет. Может, стоит снизить дозу хаоса?',
          'Ломка — это цена за твои "мутки".'
        ];
      }
      // Spirit Rage
      else if (spirit && spirit.rage > 70) {
        responses = [
          'Я чувствую, что Дух давит на тебя. Не поддавайся.',
          'Атмосфера вокруг тебя тяжелая. Дух в ярости?',
          'Постарайся успокоиться, иначе Дух тебя сожрет.'
        ];
      }
      // Good State
      else if (stats.health > 80 && stats.adequacy > 80) {
        responses = [
          'Ты выглядишь на удивление здоровым для этого места.',
          'Продолжай в том же духе. Баланс — это ключ.',
          'Рад видеть тебя в ясном сознании.'
        ];
      }
    }

    const response = responses[Math.floor(Math.random() * responses.length)];
    res.json({ response });
  } catch (error) {
    console.error('Doctor chat error:', error);
    res.status(500).json({ error: 'Failed to get doctor response' });
  }
});

// Doctor session
app.post('/api/doctor/session', authenticateToken, async (req, res) => {
  try {
    const { gameState } = req.body;

    if (!gameState) {
      return res.status(400).json({ error: 'Game state required' });
    }

    // Validate cash
    if (gameState.kpis.cash < 500) {
      return res.status(400).json({ error: 'Not enough cash' });
    }

    // Apply effects
    gameState.kpis.cash -= 500;

    // Update stats (clamp to limits would be good, but simple addition for now)
    gameState.stats.adequacy = Math.min(100, gameState.stats.adequacy + 20);
    gameState.stats.stability = Math.min(100, gameState.stats.stability + 10);

    // Add log
    const logEntry = {
      text: 'Сессия с ДОКом: +адекватность, +стабильность, -₽500',
      type: 'good',
      time: new Date()
    };
    gameState.log.unshift(logEntry);
    if (gameState.log.length > 50) gameState.log.pop();

    // Save to DB
    await saveGameState(req.user.userId, gameState);

    res.json({
      success: true,
      gameState,
      message: 'Сессия прошла успешно. Ты чувствуешь себя лучше.'
    });
  } catch (error) {
    console.error('Doctor session error:', error);
    res.status(500).json({ error: 'Failed to process session' });
  }
});

// Doctor medication
app.post('/api/doctor/medication', authenticateToken, async (req, res) => {
  try {
    const { gameState, type } = req.body;

    if (!gameState || !type) {
      return res.status(400).json({ error: 'Game state and medication type required' });
    }

    const costs = {
      sleep: 500,
      anxiety: 750,
      focus: 600,
      blocker: 800
    };

    const cost = costs[type];
    if (!cost) {
      return res.status(400).json({ error: 'Invalid medication type' });
    }

    if (gameState.kpis.cash < cost) {
      return res.status(400).json({ error: 'Not enough cash' });
    }

    // Deduct cost
    gameState.kpis.cash -= cost;

    // Apply effects
    let message = '';
    switch (type) {
      case 'sleep':
        gameState.stats.stability = Math.min(100, gameState.stats.stability + 20);
        gameState.stats.energy = Math.max(0, gameState.stats.energy - 15);
        message = 'Принял стабилизатор сна. Чувствую себя спокойнее, но энергии меньше.';
        break;
      case 'anxiety':
        gameState.stats.adequacy = Math.min(100, gameState.stats.adequacy + 25);
        gameState.stats.withdrawal = Math.max(0, gameState.stats.withdrawal - 10);
        message = 'Принял резак тревоги. Голова стала яснее, ломка уменьшилась.';
        break;
      case 'focus':
        gameState.stats.energy = Math.min(100, gameState.stats.energy + 20);
        gameState.stats.mood = Math.max(0, gameState.stats.mood - 10);
        message = 'Принял фокус для студии. Энергия появилась, но настроение упало.';
        break;
      case 'blocker':
        gameState.stats.stability = Math.min(100, gameState.stats.stability + 15);
        message = 'Принял блокиратор токсичного отдыха. Стабильность повысилась.';
        break;
    }

    // Add log
    gameState.log.unshift({
      text: message,
      type: type === 'focus' ? 'neutral' : 'good',
      time: new Date()
    });
    if (gameState.log.length > 50) gameState.log.pop();

    // Save to DB
    await saveGameState(req.user.userId, gameState);

    res.json({
      success: true,
      gameState,
      message
    });
  } catch (error) {
    console.error('Doctor medication error:', error);
    res.status(500).json({ error: 'Failed to process medication' });
  }
});

// Casino: Slots Spin
app.post('/api/casino/slots/spin', authenticateToken, async (req, res) => {
  try {
    const { gameState, bet, isGhostActive } = req.body;

    if (!gameState || !bet) {
      return res.status(400).json({ error: 'Game state and bet required' });
    }

    // Validate Chips (not cash)
    if (!gameState.casino || typeof gameState.casino.chips !== 'number') {
      return res.status(400).json({ error: 'Casino state invalid' });
    }

    if (bet <= 0 || gameState.casino.chips < bet) {
      return res.status(400).json({ error: 'Invalid bet or insufficient chips' });
    }

    // Deduct bet
    gameState.casino.chips -= bet;

    // Ghost Luck Check (Server-side validation of resources)
    if (isGhostActive) {
      if (gameState.stats.health < 10) {
        return res.status(400).json({ error: 'Not enough health for Ghost Luck' });
      }
      gameState.stats.health -= 10;
    }

    // Game Logic
    const symbols = ['seven', 'diamond', 'bar', 'cherry'];
    let result = [];

    // Ghost Logic (Rigged for win)
    if (isGhostActive) {
      result[0] = 'ghost';
      result[1] = Math.random() > 0.5 ? 'ghost' : symbols[Math.floor(Math.random() * symbols.length)];
      result[2] = Math.random() > 0.3 ? result[1] : symbols[Math.floor(Math.random() * symbols.length)];
      // High chance of 3 ghosts or at least a pair
      if (Math.random() > 0.7) result = ['ghost', 'ghost', 'ghost'];
    } else {
      // Normal Logic
      // 5% chance of jackpot (3 ghosts)
      if (Math.random() < 0.05) {
        result = ['ghost', 'ghost', 'ghost'];
      } else {
        // Random spin
        // Actually in client logic: "regularKeys = keys.filter(k => k !== 'ghost')"
        // So ghost is NOT in normal pool except via 5% jackpot check.
        for (let i = 0; i < 3; i++) {
          result.push(symbols[Math.floor(Math.random() * symbols.length)]);
        }
      }
    }

    // Calculate Win
    const [s1, s2, s3] = result;
    let win = 0;
    let message = "Пусто...";
    let isWin = false;

    if (s1 === s2 && s2 === s3) {
      isWin = true;
      if (s1 === 'ghost') { win = bet * 50; message = "JACKPOT! ДУХИ С ТОБОЙ!"; }
      else if (s1 === 'seven') { win = bet * 20; message = "777! БИНГО!"; }
      else { win = bet * 5; message = "ТРОЙНОЙ УЛОВ!"; }
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
      isWin = true;
      win = Math.floor(bet * 1.5);
      message = "Пара. Неплохо.";
    }

    // Apply Win
    if (win > 0) {
      gameState.casino.chips += win;
      // Add XP
      if (gameState.casino.casinoXP !== undefined) {
        gameState.casino.casinoXP += 10; // Base XP
        if (win > 1000) gameState.casino.casinoXP += 50; // Big win bonus
      }
    }

    // Save State
    await saveGameState(req.user.userId, gameState);

    res.json({
      success: true,
      result,
      win,
      message,
      gameState
    });
  } catch (error) {
    console.error('Slots error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', version: '1.0.1-secure' });
});

app.listen(PORT, () => {
  console.log(`🛡️ Secure Server running on port ${PORT}`);
});
