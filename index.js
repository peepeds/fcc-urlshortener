require('dotenv').config({path:'./.env'});
// Mengimpor modul yang diperlukan
const express = require('express');
const cors = require('cors');
const path = require('path'); // Mengimpor path untuk menangani jalur file
const app = express();
const port = process.env.PORT || 3000;
const router = require('./Router/urlRoute')


const connectDB = require('./models/connection');
const bodyParser = require('body-parser');
const { getUrl } = require('./controller/urlController');
connectDB();

// Konfigurasi dasar

// Menggunakan CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Menyajikan file statis dari folder public
app.use('/public', express.static(path.join(__dirname, 'public')));

// Route untuk mengakses index.html
app.get('/', function (req, res) {
  const filePath = path.join(__dirname, 'views', 'index.html'); // Menggunakan path.join untuk jalur yang aman
  console.log('Trying to send file:', filePath); // Menampilkan jalur file di konsol
  res.sendFile(filePath, function (err) {
    if (err) {
      console.error('Error sending file:', err); // Menangani error jika ada
      res.status(err.status).send('Error loading the page.');
    }
  });
});

// Route untuk ping
app.get('/ping', async (req, res) => {
  res.send(req.body);
});

// Menambahkan route baru
app.get('/:short_url', getUrl);
app.use('/api', router);

// Middleware untuk menangani 404 (route tidak ditemukan)
app.use((req, res, next) => {
  res.status(404).redirect('/');
});

// Menjalankan server
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
