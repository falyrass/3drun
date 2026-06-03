# 3DRun

**3DRun** is a real-time multiplayer 3D game server and client built with **Node.js**, **Express**, and **Socket.IO**. It enables real-time collaboration and gameplay synchronization between multiple players within a 3D environment, featuring WebRTC-based audio communication.

## 🚀 Features

- **Real-Time Multiplayer:** Synchronized player movements and actions using Socket.IO.
- **3D Environment:** Client-side 3D rendering and map interaction.
- **Voice Communication:** Proximity-based audio chat powered by WebRTC.
- **Node.js Server:** Robust backend serving HTTP requests via Express and WebSocket connections.

## 🛠️ Stack

- **Backend:** Node.js, Express.js, Socket.IO, CORS
- **Frontend / Client:** HTML5, JavaScript (3D Context context, WebRTC audio support, Socket.IO client)
- **Dev Tools:** Nodemon

## ⚙️ Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd 3DRun
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## 🎮 Usage

**Start the development server (with hot reload):**
```bash
npm run dev
```

**Start the production server:**
```bash
npm start
```

Once the server is running, you can access the game via your web browser at `http://localhost:3000` *(assuming default port 3000)*. Open multiple tabs or use different devices within the same network to test the multiplayer functionality.

## 📁 Project Structure

- `server.js` - Main entry point; initializes Express server and Socket.IO for game event broadcasting.
- `index.html` - Main frontend interface for the 3D game.
- `client.js` - Core client-side game logic and Socket.IO integration.
- `player-controller.js` - Dedicated logic for character movement and interaction.
- `map.js` / `map.glb` - 3D assets and map management geometry logic.
- `webrtc-audio.js` - WebRTC implementation for peer-to-peer voice communication.

## 📄 License

This project is licensed under the MIT License.
