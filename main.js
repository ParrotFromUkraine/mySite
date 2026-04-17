const express = require('express');
const multer = require('multer')
const os = require('os');
const path = require('path');
const readline = require('readline');
const pg = require('pg');

const app = express();
const port = 3000;

const data_DB = new pg.Client({
  user: process.env.database_username,
  host: process.env.database_host,
  database: process.env.database_name,
  password: process.env.database_password,
  port: process.env.database_port,
});

async function connectionDB () {
 await data_DB.connect();
  console.log('Подключение к базе данных прошло успешно');
  const res = await data_DB.query('SELECT * FROM users');
  console.log(res.rows);
  await data_DB.end();  
}

function getDatabaseUsers() {
  console.log('Fetching users from DB...');

}

function sayHello() {
  console.log('Привет, пользователь!');
}

console.log('Операционная система:', os.type());

let storageDisk;
let upload;
let cloudEnabled = false;
let rl;

function askCloudEnable() {
  const rlCloud = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rlCloud.question('Включить облако? [Y/N] ', (answer) => {
    rlCloud.close();
    
    if (answer === 'Y') {
      cloudEnabled = true;
      console.log('Облако включено');

      if (os.type() === 'Windows_NT') {
        storageDisk = multer.diskStorage({
          destination: function (req, file, cb) {
            cb(null, 'D:/DataCloud');
          },
          filename: function (req, file, cb) {
            const uniqueName = Date.now() + '-' + file.originalname;
            cb(null, uniqueName);
          }
        });
      } else {
        storageDisk = multer.diskStorage({
          destination: function (req, file, cb) {
            cb(null, path.join(os.homedir(), 'DataCloud'));
          },
          filename: function (req, file, cb) {
            const uniqueName = Date.now() + '-' + file.originalname;
            cb(null, uniqueName);
          }
        });
      }

      upload = multer({ storage: storageDisk });

      app.get('/up/cloud', (req, res) => {
        res.send(`
          <h2>Загрузка файлов</h2>
          <form action="/main/upload/files" method="POST" enctype="multipart/form-data">
            <input type="file" name="files" multiple />
            <button type="submit">Отправить</button>
          </form>
        `)
      });

      app.post('/main/upload/files', upload.array('files', 20), (req, res) => {
        res.json({
          message: 'Файлы загружены',
          files: req.files
        });
      });
    } else {
      console.log('Облако отключено');
    }

    initCLI();
    startServer();
  });
}

function initCLI() {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '\x1b[32mlocalServer =>\x1b[0m '
  });

  rl.on('line', (line) => {
    const command = line.trim();
    switch (command) {
      case 'hello':
        sayHello();
        break;
      case 'users':
        getDatabaseUsers();
        break;
      case 'exit':
        console.log('Выход...');
        process.exit(0);
        break;
      default:
        console.log(`Неизвестная команда: '${command}'`);
        break;
    }
    rl.prompt();
  });
}

function startServer() {
  console.log('\nСервер запущен. Теперь можно вводить к��манды: hello, users, exit\n');
  
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
    rl.prompt();
  });
}

askCloudEnable();