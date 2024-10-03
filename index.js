// Mengimpor modul yang diperlukan
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // Mengimpor path untuk menangani jalur file

const app = express();

// Konfigurasi dasar
const port = process.env.PORT || 3000;

// Menggunakan CORS
app.use(cors());

// Menyajikan file statis dari folder public
app.use('/public', express.static(path.join(__dirname, 'public')));

// Route untuk mengakses index.html
app.get('/', function(req, res) {
  const filePath = path.join(__dirname, 'views', 'index.html'); // Menggunakan path.join untuk jalur yang aman
  console.log('Trying to send file:', filePath); // Menampilkan jalur file di konsol
  res.sendFile(filePath, function(err) {
    if (err) {
      console.error('Error sending file:', err); // Menangani error jika ada
      res.status(err.status).send('Error loading the page.');
    }
  });
});

// Endpoint API pertama
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Menjalankan server
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
