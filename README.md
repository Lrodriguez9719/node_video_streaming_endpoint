# Node.js Video Streaming API

A robust video streaming server built with Node.js and Express, designed to handle HTTP Range requests for efficient media playback. This project serves as the backend for my personal video portfolio.

## 🚀 Live Demo
**Base URL:** `https://video-streaming.live`

## 🛠 Technologies
- **Runtime:** Node.js (v20)
- **Framework:** Express.js
- **Deployment:** Linux VPS (Ubuntu), Nginx (Reverse Proxy), PM2
- **Security:** SSL/TLS (Let's Encrypt), CORS configuration

## ✨ Key Features
- **HTTP 206 Partial Content:** Implements standard streaming protocols to serve video in chunks, allowing for seeking and bandwidth efficiency.
- **Node.js Streams:** Uses `fs.createReadStream` to pipe data to the client, ensuring low memory usage even with large files.
- **Dynamic Routing:** Serves video files dynamically based on filename parameters.
- **Metadata API:** Provides a JSON endpoint to list available videos with titles and artist information.

## 🔌 API Endpoints

### 1. Get All Videos
Returns a list of available videos with metadata.
- **URL:** `/videos`
- **Method:** `GET`
- **Response:** JSON Array of objects `{ filename, title, artist, description }`

### 2. Stream Video
Streams the video file using read streams.
- **URL:** `/video/:filename`
- **Method:** `GET`
- **Headers:** Accepts `Range` header (e.g., `bytes=0-`)

## 📦 Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Lrodriguez9719/node_video_streaming_endpoint.git
   ```

2. **Install dependencies**
    ```bash
   npm install
   ```

3. **(Optional) Add Media**
- Add .mp4 files to the media/videos/ folder
- Update videos.json to match your filenames.

4. **Run server**
    ```bash
    node server.js
    ```

Server runs on http://localhost:3000