const telegram = require('node-telegram-bot-api');
const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const multer = require('multer')

// Database module
const { users, messages: messageOps } = require('./database');

const storageDisk = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, 'G:/dataUp'); // <-- ТВОЙ второй диск
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
})
const upload = multer({ storage: storageDisk });

const TOKEN = process.env.TOKEN || '8487545614:AAF6ga69RrV40F_syKH1Y14NoUbv1DSzGwQ';
const bot = new telegram(TOKEN, { polling: true });
const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';// Секретный ключ для JWT (в продакшене использовать env переменные)
// Removed in-memory storage - now using database
// const users = new Map(); // userId -> { id, username, password, createdAt }
// const sessions = new Map(); // token -> userId
// const messages = []; // [{ id, userId, username, text, timestamp }]

// Настройка Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

// Ограничение частоты запросов
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100,
  message: { error: 'Слишком много запросов, попробуйте позже' }
});

// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Неверный токен' });
    }
    req.userId = decoded.userId;
    req.username = decoded.username;
    next();
  });
};

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "ws:", "wss:"],
      upgradeInsecureRequests: []
    }
  }
}));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/apiChat/', limiter);
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// <--- Routes --->

app.get('/', (req, res) => {
  res.send('Hello From My Server!');
});

app.get('/main', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main', 'index.html'));
});

app.get('/weather', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'weather', 'index.html'));
});

app.get('/kbTest', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'kbTest', 'index.html'));
});

app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tests', 'index.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat', 'index.html'));
});





// HTML страница
app.get('/main/upload/cloud', (req, res) => {
  res.send(`
    <h2>Загрузка файлов</h2>
    <form action="/main/upload/files" method="POST" enctype="multipart/form-data">
      <input type="file" name="files" multiple />
      <button type="submit">Отправить</button>
    </form>
  `);
});

// загрузка нескольких файлов
app.post('/main/upload/files', upload.array('files', 20), (req, res) => {
  res.json({
    message: 'Файлы загружены',
    files: req.files
  });
});



// <--- Finish routes --->

// Removed app.listen to prevent port conflict with Socket.IO server.
// Socket.IO server starts later with server.listen(PORT, ...).

// <--- Telegram Bot --->

bot.on('message', (msg) => {
  console.log('[TELEGRAM]', msg);
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    bot.sendMessage(chatId, 'Hello! I am your bot.');
  } else {
    bot.sendMessage(chatId, `You said: ${text}`);
  }
});


// <--- Chat API --->


// API: Регистрация
app.post('/apiChat/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Имя пользователя и пароль обязательны' });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: 'Имя пользователя должно быть от 3 до 20 символов' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
    }

    // Проверка уникальности
    const existingUser = users.findByUsername(username.trim().toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    // Создание пользователя в БД
    const user = users.create(username.trim(), password);
   
    // Создание токена
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    sessions.set(token, user.id);

    res.json({
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    console.error('[ERROR] Регистрация:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// API: Вход
app.post('/apiChat/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Имя пользователя и пароль обязательны' });
    }

    // Поиск пользователя в БД
    const user = users.findByUsername(username.toLowerCase());

    if (!user) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    // Проверка пароля
    const validPassword = users.verifyPassword(user, password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    // Создание токена
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    sessions.set(token, user.id);

    res.json({
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    console.error('[ERROR] Вход:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// API: Валидация токена
app.get('/apiChat/auth', authenticateToken, (req, res) => {
  const user = users.findById(req.userId);
  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }
  res.json({ user: { id: user.id, username: user.username } });
});

// API: Получить историю сообщений
app.get('/apiChat/messages', authenticateToken, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const recentMessages = messageOps.getRecent(limit);
  res.json({ messages: recentMessages });
});

// API: Получить список пользователей
app.get('/apiChat/users', authenticateToken, (req, res) => {
  const userList = users.getAll();
  res.json({ users: userList });
});

// Socket.io: Real-time чат
io.on('connection', (socket) => {
  let currentUser = null;

  // Аутентификация при подключении
  socket.on('authenticate', (token) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = users.findById(decoded.userId);
     
      if (user) {
        currentUser = { id: user.id, username: user.username };
        socket.userId = user.id;
        socket.username = user.username;
       
        socket.emit('authenticated', {
          user: { id: user.id, username: user.username }
        });
       
        // Уведомление о входе
        socket.broadcast.emit('userJoined', {
          username: user.username,
          message: `${user.username} присоединился к чату`
        });
       
        console.log(`User connected: ${user.username}`);
      }
    } catch (err) {
      socket.emit('authError', { error: 'Неверный токен' });
    }
  });

  // Отправка сообщения
  socket.on('message', (data) => {
    if (!currentUser) {
      socket.emit('error', { message: 'Требуется авторизация' });
      return;
    }

    const { text } = data;
   
    // Валидация
    if (!text || typeof text !== 'string') {
      socket.emit('error', { message: 'Сообщение не может быть пустым' });
      return;
    }

    const trimmedText = text.trim();
    if (trimmedText.length === 0 || trimmedText.length > 1000) {
      socket.emit('error', { message: 'Сообщение должно быть от 1 до 1000 символов' });
      return;
    }

    // Сохранение сообщения в БД
    const message = messageOps.create(currentUser.id, currentUser.username, trimmedText);

    // Очистка старых сообщений (максимум 1000)
    messageOps.cleanup(1000);

    // Отправка всем
    io.emit('message', message);
  });

  // Отключение
  socket.on('disconnect', () => {
    if (currentUser) {
      socket.broadcast.emit('userLeft', {
        username: currentUser.username,
        message: `${currentUser.username} покинул чат`
      });
      console.log(`User disconnected: ${currentUser.username}`);
    }
  });

  // Запрос истории
  socket.on('getHistory', (limit = 50) => {
    const recentMessages = messageOps.getRecent(Math.min(limit, 100));
    socket.emit('history', { messages: recentMessages });
  });
});

// Обработка ошибок
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

// Запуск сервера
server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  console.log(`База даних: SQLite (data/chat.db)`);
});