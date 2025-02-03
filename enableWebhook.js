const axios = require('axios');

// Access Token yang kamu dapatkan dari Qontak
const accessToken = 'Kl-jMC2CKiwnMGNT87JJxr0n6cokWtVuWDbnrpN05zE';

// URL webhook yang akan menerima event dari Qontak
const webhookUrl = 'https://your-webhook-endpoint.com/receive-webhook';  // Gantilah dengan URL valid kamu

// Data payload untuk mengaktifkan webhook
const data = {
  receive_message_from_customer: true,
  receive_message_from_agent: true,
  broadcast_log_status: true,
  status_message: true,
  url: webhookUrl  // Mengirimkan URL webhook untuk menerima event
};

// Fungsi untuk mengaktifkan webhook
const enableWebhook = async () => {
  try {
    // Request PUT ke API untuk mengaktifkan webhook
    const response = await axios.put(
      'https://service-chat.qontak.com/api/open/v1/message_interactions',  // Sesuaikan dengan endpoint API yang benar dari dokumentasi Qontak
      data, 
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,  // Menyertakan token API dalam header Authorization
          'Content-Type': 'application/json'  // Menetapkan Content-Type sebagai JSON
        }
      }
    );

    console.log('Webhook berhasil diaktifkan:', response.data);
  } catch (error) {
    console.error('Gagal mengaktifkan webhook:', error.response ? error.response.data : error.message);
  }
};

// Panggil fungsi untuk mengaktifkan webhook
enableWebhook();
