const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to allow CORS (Cross-Origin Resource Sharing)
// This allows your personal-site to request resources from this server
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Range");
  next();
});

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>Video Streaming w/ Node</title></head>
      <body>
        <h1>Video Streaming Test</h1>
        <p>Go to /video to stream</p>
      </body>
    </html>
  `);
});

app.get('/video', (req, res) => {
  // Ensure you have a file named 'video.mp4' in this directory
  const videoPath = path.join(__dirname, 'toco-y-me-voy.mp4');
  
  // Check if file exists
  if (!fs.existsSync(videoPath)) {
      return res.status(404).send('Video file not found');
  }

  const videoStat = fs.statSync(videoPath);
  const fileSize = videoStat.size;
  const videoRange = req.headers.range;

  if (videoRange) {
    // Parse Range
    // Example: "bytes=32324-"
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