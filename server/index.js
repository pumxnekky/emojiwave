/**
 * EmojiWave Backend Server
 * Node.js + Express + Socket.io + Redis
 *
 * Deploy on: Railway, Render, Fly.io, or any Node.js host
 * Install: npm install express socket.io redis ioredis jsonwebtoken uuid cors helmet
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket'],
});

app.use(helmet());
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-production';
const PORT = process.env.PORT || 3000;

// In-memory stores (replace with Redis in production)
const users = new Map();       // userId -> { emoji, nickname, socketId, lat, lng, pushToken }
const connections = new Map(); // connectionId -> { userA, userB, messages[] }
const rateLimits = new Map();  // userId -> { count, resetAt }

// ─── Rate limiting ─────────────────────────────────────────────────────────
function checkRateLimit(userId, maxPerMinute = 10) {
  const now = Date.now();
  const entry = rateLimits.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(userId, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= maxPerMinute) return false;
  entry.count++;
  return true;
}

// ─── Auth middleware ────────────────────────────────────────────────────────
function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ─── REST API ───────────────────────────────────────────────────────────────
app.post('/auth/anonymous', (req, res) => {
  const { id, emoji } = req.body;
  if (!id || !emoji) return res.status(400).json({ error: 'Missing id or emoji' });

  const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: '90d' });
  users.set(id, { emoji, nickname: 'Usuario', socketId: null, lat: null, lng: null });

  res.json({ token, userId: id });
});

app.patch('/users/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  if (req.user.userId !== id) return res.status(403).json({ error: 'Forbidden' });
  const user = users.get(id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { emoji, nickname } = req.body;
  if (emoji) user.emoji = emoji;
  if (nickname && nickname.length >= 2 && nickname.length <= 30) user.nickname = nickname;
  users.set(id, user);

  res.json({ success: true });
});

// Web Push fallback deep-link (for users without the app)
app.get('/r/:reactionId', (req, res) => {
  const { reactionId } = req.params;
  // Redirect to deep link or web landing page
  res.redirect(`emojiwave://reaction/${reactionId}`);
});

app.get('/health', (_, res) => res.json({ status: 'ok', users: users.size }));

// ─── Socket.io ──────────────────────────────────────────────────────────────
io.use((socket, next) => {
  const { userId, token } = socket.handshake.auth;
  if (!userId || !token) return next(new Error('Missing auth'));
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.userId !== userId) return next(new Error('Token mismatch'));
    socket.userId = userId;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const { userId } = socket;
  console.log(`[Socket] Connected: ${userId}`);

  // Update socket ID
  const user = users.get(userId) || { emoji: '😎', nickname: 'Usuario', socketId: null };
  user.socketId = socket.id;
  users.set(userId, user);

  // ── Join radar ──
  socket.on('join_radar', () => {
    socket.join(`radar`);
    const nearby = getNearbyUsers(userId);
    socket.emit('nearby_users', nearby);
    socket.to('radar').emit('user_appeared', formatUser(userId));
  });

  // ── Position update ──
  socket.on('update_position', ({ lat, lng }) => {
    const u = users.get(userId);
    if (!u) return;
    u.lat = lat; u.lng = lng;
    users.set(userId, u);
  });

  // ── Send emoji reaction ──
  socket.on('send_reaction', ({ toUserId, emoji, fromId, fromEmoji, fromNickname }) => {
    if (!checkRateLimit(userId, 5)) {
      socket.emit('error', { code: 'RATE_LIMIT', message: 'Demasiadas reacciones. Espera un momento.' });
      return;
    }
    const target = users.get(toUserId);
    if (!target?.socketId) return;

    io.to(target.socketId).emit('incoming_reaction', {
      fromId, fromEmoji, fromNickname, emoji, timestamp: Date.now(),
    });
  });

  // ── Accept reaction → create connection ──
  socket.on('accept_reaction', ({ fromId, myId, myEmoji, myNickname }) => {
    const connId = [myId, fromId].sort().join(':');
    if (!connections.has(connId)) {
      connections.set(connId, { userA: myId, userB: fromId, messages: [] });
    }
    // Notify both parties
    const fromUser = users.get(fromId);
    if (fromUser?.socketId) {
      io.to(fromUser.socketId).emit('connection_accepted', {
        connectionId: connId, userId: myId, emoji: myEmoji, nickname: myNickname,
      });
    }
    socket.emit('connection_accepted', {
      connectionId: connId, userId: fromId,
      emoji: fromUser?.emoji, nickname: fromUser?.nickname,
    });
  });

  // ── Chat message ──
  socket.on('send_message', ({ connectionId, message }) => {
    if (!checkRateLimit(userId, 30)) return;
    const conn = connections.get(connectionId);
    if (!conn) return;

    const otherId = conn.userA === userId ? conn.userB : conn.userA;
    const other = users.get(otherId);

    // Save message
    conn.messages.push(message);
    if (conn.messages.length > 200) conn.messages.shift(); // Keep last 200

    // Forward to recipient
    if (other?.socketId) {
      io.to(other.socketId).emit('chat_message', { connectionId, message });
    }
  });

  // ── Disconnect ──
  socket.on('disconnect', () => {
    const u = users.get(userId);
    if (u) { u.socketId = null; users.set(userId, u); }
    socket.to('radar').emit('user_left', { id: userId });
    console.log(`[Socket] Disconnected: ${userId}`);
  });
});

function getNearbyUsers(excludeId) {
  return Array.from(users.entries())
    .filter(([id, u]) => id !== excludeId && u.socketId)
    .slice(0, 20)
    .map(([id]) => formatUser(id));
}

function formatUser(userId) {
  const u = users.get(userId);
  return {
    id: userId,
    displayEmoji: u?.emoji ?? '😊',
    nickname: u?.nickname ?? 'Usuario',
    distance: Math.floor(Math.random() * 45) + 5, // Replace with real BLE/GPS distance
    angle: Math.floor(Math.random() * 360),
    lastSeen: Date.now(),
    connected: false,
  };
}

server.listen(PORT, () => {
  console.log(`🌊 EmojiWave server running on port ${PORT}`);
});
