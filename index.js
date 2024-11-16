const express = require('express');
const axios = require('axios');
const cors = require('cors');

// Inisialisasi Express
const app = express();
const port = 3000;

// Middleware CORS
const corsMiddleware = cors({ origin: '*' });

// Fungsi utama untuk download media
const ddownr = {
  download: async (url, format) => {
    try {
      const response = await axios.get(
        `https://p.oceansaver.in/ajax/download.php?copyright=0&format=${format}&url=${url}`,
        {
          headers: {
            'User-Agent': 'MyApp/1.0',
            Referer: 'https://ddownr.com/enW7/youtube-video-downloader',
          },
        }
      );

      const data = response.data;
      const media = await ddownr.cekProgress(data.id);
      return {
        success: true,
        format: format,
        title: data.title,
        thumbnail: data.info.image,
        downloadUrl: media,
      };
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      return { success: false, message: error.message };
    }
  },

  cekProgress: async (id) => {
    try {
      const progressResponse = await axios.get(
        `https://p.oceansaver.in/ajax/progress.php?id=${id}`,
        {
          headers: {
            'User-Agent': 'MyApp/1.0',
            Referer: 'https://ddownr.com/enW7/youtube-video-downloader',
          },
        }
      );

      const data = progressResponse.data;

      if (data.progress === 1000) {
        return data.download_url;
      } else {
        console.log('Masih belum selesai, sabar...');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return ddownr.cekProgress(id);
      }
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      return { success: false, message: error.message };
    }
  },
};

// Endpoint API untuk mengunduh media
app.get('/api/downloader/ytdownload', corsMiddleware, async (req, res) => {
  // Mendapatkan parameter query url dan format
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
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
