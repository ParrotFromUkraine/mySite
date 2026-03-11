const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

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

app.get('/api', (req, res) => {
  res.json({ message: 'Hello from API!' });
});

// <--- Finish routes --->

app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
});

app.listen(PORT, () => {
  console.log(`✅ Server running http://localhost:${PORT}`);
});
