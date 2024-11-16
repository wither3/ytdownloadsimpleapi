const { ddownr } = require('../../ddownr'); // Import modul ddownr Anda
const cors = require('cors');

// Middleware CORS untuk mendukung request dari domain lain
const corsMiddleware = cors({ origin: '*' });

// Fungsi handler utama
module.exports = async (req, res) => {
  // Bungkus dengan middleware CORS
  await new Promise((resolve) => corsMiddleware(req, res, resolve));

  // Hanya izinkan metode GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Hanya metode GET yang didukung.',
    });
  }

  const { url, format } = req.query;

  // Validasi input
  if (!url) {
    return res.status(400).json({
      success: false,
      message: 'Parameter "url" harus disertakan.',
    });
  }

  const selectedFormat = format || 'mp3';
  const formatAudio = ['mp3', 'm4a', 'webm', 'acc', 'flac', 'opus', 'ogg', 'wav', '4k'];
  const formatVideo = ['360', '480', '720', '1080', '1440'];
  const validFormats = [...formatAudio, ...formatVideo];

  if (!validFormats.includes(selectedFormat)) {
    return res.status(400).json({
      success: false,
      message: 'Format tidak valid. Pilih format yang didukung.',
    });
  }

  try {
    // Proses unduhan
    const result = await ddownr.download(url, selectedFormat);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengunduh.',
      error: error.message,
    });
  }
};
