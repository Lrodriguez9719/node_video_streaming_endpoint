const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Define paths constants
const VIDEO_DIR = path.join(__dirname, 'media', 'videos');
const DB_PATH = path.join(__dirname, 'videos.json');

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Range");
  next();
});

app.get('/', (req, res) => {
  res.send('Video Server Running');
});

// 1. Endpoint to list videos with metadata
app.get('/videos', (req, res) => {
    fs.readFile(DB_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Could not read video database' });
        }
        try {
            const videos = JSON.parse(data);
            res.json(videos);
        } catch (parseError) {
            res.status(500).json({ error: 'Database format error' });
        }
    });
});

// 2. Dynamic endpoint to stream video
app.get('/video/:filename', (req, res) => {
  const fileName = req.params.filename;
  const videoPath = path.join(VIDEO_DIR, fileName);
  
  // Security check
  if (fileName.includes('..') || fileName.includes('/')) {
      return res.status(403).send('Forbidden');
  }

  if (!fs.existsSync(videoPath)) {
      return res.status(404).send('Video file not found');
  }

  const videoStat = fs.statSync(videoPath);
  const fileSize = videoStat.size;
  const videoRange = req.headers.range;

  if (videoRange) {
    const parts = videoRange.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});