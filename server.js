const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Range");
  next();
});

app.get('/', (req, res) => {
  res.send('Video Server Running');
});

// 1. Endpoint to list all available video files
app.get('/videos', (req, res) => {
    fs.readdir(__dirname, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to scan directory' });
        }
        // Filter only mp4 files
        const videos = files.filter(file => path.extname(file) === '.mp4');
        res.json(videos);
    });
});

// 2. Dynamic endpoint that accepts a filename
app.get('/video/:filename', (req, res) => {
  const fileName = req.params.filename;
  const videoPath = path.join(__dirname, fileName);
  
  // Security: Prevent directory traversal attacks (e.g. ../../etc/passwd)
  if (fileName.includes('..') || fileName.includes('/')) {
      return res.status(403).send('Forbidden');
  }

  // Check if file exists
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