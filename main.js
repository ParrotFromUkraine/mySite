
const express = require('express');
const path = require('path');
const multer = require('multer')


const app = express();
const port = 3000;
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


// @route GET 
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main', 'index.html'));
});

app.get('/weather', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'weather', 'index.html'));
});

app.get('/kbTest', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'kbTest', 'index.html'));
});

app.get('/up/cloud', (req, res) => {
 res.send(`
    <h2>Загрузка файлов</h2>
    <form action="/main/upload/files" method="POST" enctype="multipart/form-data">
      <input type="file" name="files" multiple />
      <button type="submit">Отправить</button>
    </form>
  `)
});

// @route POST
app.post('/main/upload/files', upload.array('files', 20), (req, res) => {
  res.json({
    message: 'Файлы загружены',
    files: req.files
  });
});

// @listener
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});

