const express = require('express');
const multer = require('multer')
const os = require('os');
const path = require('path');
const prompt = require('prompt-sync')();

const app = express();
const port = 3000;

console.log('Операционная система:', os.type());

if (prompt('Включить облако? [Y] ') === 'Y') {
  console.log('Облако включено');

  if (os.type() === 'Windows_NT') {
    console.log('Операционная система: Windows');
    return multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, 'D:/DataCloud'); // <-- ТВОЙ второй диск
      },
      filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
      }
    });
  }
  
  const upload = multer({ storage: storageDisk }); 

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

} else { 
  console.log('Ответ не понятен, облако отключено по умолчанию');
}

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

app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tests', 'index.html'));
});



// @listener
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});

