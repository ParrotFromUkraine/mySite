# SQL Гід для чату

## Підключення до бази даних

### Через командний рядок (sqlite3)
```bash
sqlite3 data/chat.db
```

### Основні команди SQLite

```sql
-- Показати всі таблиці
.tables

-- Показати структуру таблиці
.schema users
.schema messages

-- Вийти з sqlite3
.exit
```

---

## Таблиця users (Користувачі)

### Структура таблиці
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
```

### Приклади запитів:

#### Показати всіх користувачів
```sql
SELECT * FROM users;
```

#### Показати тільки імена користувачів
```sql
SELECT id, username, created_at FROM users ORDER BY created_at DESC;
```

#### Знайти користувача за ім'ям
```sql
SELECT * FROM users WHERE username = 'admin';
```

#### Знайти користувача за ID
```sql
SELECT * FROM users WHERE id = 'uuid-тут-ід';
```

#### Кількість користувачів
```sql
SELECT COUNT(*) FROM users;
```

#### Видалити користувача
```sql
DELETE FROM users WHERE id = 'uuid-тут-ід';
```

---

## Таблиця messages (Повідомлення)

### Структура таблиці
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  text TEXT NOT NULL,
  timestamp TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Приклади запитів:

#### Показати всі повідомлення
```sql
SELECT * FROM messages;
```

#### Останні 50 повідомлень
```sql
SELECT * FROM messages ORDER BY timestamp DESC LIMIT 50;
```

#### Перші 50 повідомлень (найстаріші)
```sql
SELECT * FROM messages ORDER BY timestamp ASC LIMIT 50;
```

#### Повідомлення конкретного користувача
```sql
SELECT * FROM messages WHERE username = 'admin' ORDER BY timestamp DESC;
```

#### Повідомлення за останню добу
```sql
SELECT * FROM messages 
WHERE timestamp >= datetime('now', '-1 day') 
ORDER BY timestamp DESC;
```

#### Пошук по тексту
```sql
SELECT * FROM messages WHERE text LIKE '%привіт%';
```

#### Кількість повідомлень
```sql
SELECT COUNT(*) FROM messages;
```

#### Видалити повідомлення за ID
```sql
DELETE FROM messages WHERE id = 'uuid-тут-ід';
```

#### Видалити всі повідомлення користувача
```sql
DELETE FROM messages WHERE user_id = 'uuid-тут-ід';
```

---

## JOIN запити

### Отримати повідомлення з іменами користувачів
```sql
SELECT 
  m.id,
  m.text,
  m.timestamp,
  u.username
FROM messages m
JOIN users u ON m.user_id = u.id
ORDER BY m.timestamp DESC
LIMIT 20;
```

---

## Корисні команди

### Увімкнути режим таблиці (зручніше читати)
```sql
.mode column
.headers on
```

### Зберегти результат у файл
```sql
.output filename.txt
SELECT * FROM users;
.output stdout
```

### Зробити резервну копію
```sql
.backup chat_backup.db
```

---

## Приклад повного сеансу

```bash
$ sqlite3 data/chat.db

sqlite> .mode column
sqlite> .headers on

-- Перегляд користувачів
sqlite> SELECT id, username, created_at FROM users;
id          username    created_at
----------  ----------  -------------------
abc123      admin       2024-01-15 10:30:00
def456      user1       2024-01-15 11:00:00

-- Перегляд повідомлень
sqlite> SELECT username, text, timestamp FROM messages ORDER BY timestamp DESC LIMIT 10;
username    text                  timestamp
----------  --------------------  -------------------
user1       Привіт всім!          2024-01-15 12:00:00
admin       Ласкаво просимо       2024-01-15 10:35:00

sqlite> .exit
```
