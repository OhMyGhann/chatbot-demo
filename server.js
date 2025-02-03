const http = require('http');
const axios = require('axios');
const url = require('url');
require('dotenv').config();  // Untuk load variabel dari .env

const PORT = 3000;

// Data uji lab palsu (bisa disimpan di file terpisah atau langsung di sini)
const labResults = [
  {
    patientId: '12345',
    name: 'John Doe',
    test: 'Cholesterol',
    result: 'Normal',
    date: '2025-02-03',
    phoneNumber: '6281234567890'  // Menambahkan nomor telepon
  },
  {
    patientId: '67890',
    name: 'Jane Smith',
    test: 'Blood Sugar',
    result: 'High',
    date: '2025-02-02',
    phoneNumber: '6289876543210'  // Menambahkan nomor telepon
  }
];

// Fungsi untuk mengirimkan pesan ke API Mekari Qontact
const sendMessageToQontact = async (patient) => {
  const accessToken = process.env.QONTACT_ACCESS_TOKEN;  // Token API disimpan di .env
  const apiUrl = 'https://service-chat.qontak.com/api/open/v1/messages';

  const message = `
    Hasil Uji Lab untuk ${patient.name}:
    Tes: ${patient.test}
    Hasil: ${patient.result}
    Tanggal: ${patient.date}
  `;

  try {
    // Menyusun payload dan headers untuk request
    const payload = {
      to_number: patient.phoneNumber,  // Nomor telepon pasien
      message: {
        text: message,  // Pesan yang dikirim berupa hasil uji lab
      }
    };

    const response = await axios.post(apiUrl, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,  // Token API di Authorization header
        'Content-Type': 'application/json',  // Menetapkan konten tipe sebagai JSON
      }
    });

    console.log(`Pesan berhasil dikirim ke ${patient.name} (${patient.phoneNumber}):`, response.data);
  } catch (error) {
    console.error(`Gagal mengirim pesan ke ${patient.name}:`, error.response ? error.response.data : error.message);
  }
};

// Membuat server HTTP
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true); // Parsing URL
  const pathname = parsedUrl.pathname;

  res.setHeader('Content-Type', 'application/json'); // Menetapkan header sebagai JSON

  // Endpoint untuk mengambil hasil uji lab berdasarkan ID pasien
  if (pathname === '/chat' && req.method === 'GET') {
    const patientId = parsedUrl.query.patientId;  // Ambil parameter patientId dari query string

    const labResult = labResults.find(result => result.patientId === patientId); // Cari data pasien

    if (labResult) {
      const message = `
        Hasil Uji Lab untuk ${labResult.name}:
        Tes: ${labResult.test}
        Hasil: ${labResult.result}
        Tanggal: ${labResult.date}
      `;
      sendMessageToQontact(labResult); // Kirim pesan hasil lab ke Mekari Qontact
      res.statusCode = 200;
      res.end(JSON.stringify({ message: 'Pesan dikirim', data: message })); // Kirim response sukses
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: 'Pasien tidak ditemukan.' }));
    }

  }
  // Endpoint untuk webhook
  else if (pathname === '/webhook' && req.method === 'POST') {
    let body = '';

    // Ambil data dari request body (untuk webhook)
    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (data.event === 'broadcast_log_status') {
          console.log('Status Broadcast:', data.status);
        }

        res.statusCode = 200;
        res.end(JSON.stringify({ message: 'Webhook diterima' }));
      } catch (err) {
        res.statusCode = 400;
        res.end(JSON.stringify({ message: 'Data webhook tidak valid' }));
      }
    });
  }
  // Jika endpoint tidak ditemukan
  else {
    res.statusCode = 404;
    res.end(JSON.stringify({ message: 'Endpoint tidak ditemukan' }));
  }
});

// Jalankan server
server.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
