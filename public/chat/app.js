// Secure Chat - Client Application

class ChatApp {
  constructor() {
    this.socket = null;
    this.currentUser = null;
    this.token = localStorage.getItem('chat_token');
    this.connectedUsers = new Map();
    
    this.init();
  }

  init() {
    // Проверка токена при загрузке
    if (this.token) {
      this.checkAuth();
    } else {
      this.showScreen('auth-screen');
    }

    this.setupEventListeners();
  }

  // Проверка аутентификации
  async checkAuth() {
    try {
      const response = await fetch('/apiChat/auth', {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.currentUser = data.user;
        this.connectSocket();
        this.showScreen('chat-screen');
      } else {
        this.logout();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      this.logout();
    }
  }

  // Подключение к Socket.io
  connectSocket() {
    this.socket = io({
      auth: {
        token: this.token
      }
    });

    this.setupSocketEvents();
  }

  // Настройка событий Socket.io
  setupSocketEvents() {
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.socket.emit('authenticate', this.token);
      this.socket.emit('getHistory', 50);
    });

    this.socket.on('authenticated', (data) => {
      console.log('Authenticated:', data);
      this.currentUser = data.user;
      this.showToast('Ласкаво просимо!', 'success');
    });

    this.socket.on('authError', (data) => {
      console.error('Auth error:', data);
      this.showToast(data.error, 'error');
      this.logout();
    });

    this.socket.on('message', (message) => {
      this.addMessage(message);
    });

    this.socket.on('history', (data) => {
      this.loadMessages(data.messages);
    });

    this.socket.on('userJoined', (data) => {
      this.showToast(data.message, 'info');
      this.updateOnlineCount();
    });

    this.socket.on('userLeft', (data) => {
      this.showToast(data.message, 'info');
      this.updateOnlineCount();
    });

    this.socket.on('error', (data) => {
      this.showToast(data.message, 'error');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.showToast('Втрачено з\'єднання', 'error');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.showToast('Помилка з\'єднання', 'error');
    });
  }

  // Настройка обработчиков событий
  setupEventListeners() {
    // Переключение табов авторизации
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchAuthTab(tab.dataset.tab));
    });

    // Форма входа
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.login();
    });

    // Форма регистрации
    document.getElementById('register-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.register();
    });

    // Форма сообщения
    document.getElementById('message-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.sendMessage();
    });

    // Выход
    document.getElementById('logout-btn').addEventListener('click', () => {
      this.logout();
    });

    // Меню на мобиле
    document.getElementById('menu-toggle').addEventListener('click', () => {
      this.toggleSidebar();
    });

    // Enter для отправки
    document.getElementById('message-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Закрытие сайдбара при клике вне его на мобиле
    document.addEventListener('click', (e) => {
      const sidebar = document.getElementById('users-sidebar');
      const menuBtn = document.getElementById('menu-toggle');
      if (window.innerWidth <= 768 && 
          !sidebar.contains(e.target) && 
          !menuBtn.contains(e.target) &&
          sidebar.classList.contains('open')) {
        this.toggleSidebar();
      }
    });
  }

  // Переключение табов
  switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

    if (tab === 'login') {
      document.getElementById('login-form').classList.remove('hidden');
      document.getElementById('register-form').classList.add('hidden');
    } else {
      document.getElementById('login-form').classList.add('hidden');
      document.getElementById('register-form').classList.remove('hidden');
    }
    this.hideError();
  }

  // Вход
  async login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
      this.showError('Заповніть всі поля');
      return;
    }

    try {
      const response = await fetch('/apiChat/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        this.token = data.token;
        this.currentUser = data.user;
        localStorage.setItem('chat_token', this.token);
        this.connectSocket();
        this.showScreen('chat-screen');
        document.getElementById('login-form').reset();
      } else {
        this.showError(data.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showError('Помилка з\'єднання');
    }
  }

  // Регистрация
  async register() {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;

    if (!username || !password || !confirm) {
      this.showError('Заповніть всі поля');
      return;
    }

    if (password !== confirm) {
      this.showError('Паролі не співпадають');
      return;
    }

    if (password.length < 6) {
      this.showError('Пароль повинен бути не менше 6 символів');
      return;
    }

    try {
      const response = await fetch('/apiChat/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        this.token = data.token;
        this.currentUser = data.user;
        localStorage.setItem('chat_token', this.token);
        this.connectSocket();
        this.showScreen('chat-screen');
        document.getElementById('register-form').reset();
      } else {
        this.showError(data.error);
      }
    } catch (error) {
      console.error('Register error:', error);
      this.showError('Помилка з\'єднання');
    }
  }

  // Выход
  logout() {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem('chat_token');
    this.showScreen('auth-screen');
    this.hideError();
    document.getElementById('login-form').reset();
    document.getElementById('register-form').reset();
    document.getElementById('messages').innerHTML = '';
    document.getElementById('users-list').innerHTML = '';
  }

  // Отправка сообщения
  sendMessage() {
    const input = document.getElementById('message-input');
    const text = input.value.trim();

    if (!text || !this.socket) return;

    this.socket.emit('message', { text });
    input.value = '';
    input.focus();
  }

  // Загрузка сообщений
  loadMessages(messages) {
    const container = document.getElementById('messages');
    container.innerHTML = '';
    messages.forEach(msg => this.addMessage(msg, false));
    this.scrollToBottom();
  }

  // Добавление сообщения
  addMessage(message, scroll = true) {
    const container = document.getElementById('messages');
    const isOwn = message.userId === this.currentUser?.id;

    const messageEl = document.createElement('div');
    messageEl.className = `message ${isOwn ? 'own' : ''}`;
    messageEl.innerHTML = `
      <div class="message-avatar">${this.getInitials(message.username)}</div>
      <div class="message-content">
        <div class="message-header">
          <span class="message-username">${this.escapeHtml(message.username)}</span>
          <span class="message-time">${this.formatTime(message.timestamp)}</span>
        </div>
        <div class="message-bubble">${this.escapeHtml(message.text)}</div>
      </div>
    `;

    container.appendChild(messageEl);

    if (scroll) {
      this.scrollToBottom();
    }
  }

  // Прокрутка к низу
  scrollToBottom() {
    const container = document.getElementById('messages');
    container.scrollTop = container.scrollHeight;
  }

  // Обновление счетчика онлайн
  updateOnlineCount() {
    // В реальном приложении это должно приходить с сервера
    const count = this.connectedUsers.size || 1;
    document.getElementById('online-count').textContent = count;
  }

  // Переключение экранов
  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
  }

  // Показать ошибку
  showError(message) {
    const errorEl = document.getElementById('auth-error');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  }

  // Скрыть ошибку
  hideError() {
    document.getElementById('auth-error').classList.add('hidden');
  }

  // Переключение сайдбара на мобиле
  toggleSidebar() {
    const sidebar = document.getElementById('users-sidebar');
    sidebar.classList.toggle('open');
    
    // Создаем оверлей если его нет
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      document.body.appendChild(overlay);
    }
    overlay.classList.toggle('visible');
  }

  // Показать уведомление
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideInRight 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Утилиты
  getInitials(name) {
    return name.charAt(0).toUpperCase();
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('uk-UA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  window.chatApp = new ChatApp();
});
