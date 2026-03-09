// server.js - Serveur Glitch pour 3D Run Multijoueur
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.static('public'));

// Stockage des joueurs connectés
const players = {};

// Event: Nouvelle connexion
io.on('connection', (socket) => {
  console.log(`[✓] Joueur connecté: ${socket.id}`);
  
  // Envoyer la liste des joueurs existants au nouveau joueur
  socket.emit('playersExist', players);
  
  // Notifier les autres qu'un nouveau joueur a rejoint
  socket.broadcast.emit('playerJoined', {
    id: socket.id,
    position: { x: 0, y: 0, z: 0 },
    rotation: 0
  });

  // Event: Mouvement du joueur
  socket.on('playerUpdate', (data) => {
    if (players[socket.id]) {
      players[socket.id] = {
        ...players[socket.id],
        ...data
      };
    } else {
      players[socket.id] = {
        id: socket.id,
        ...data
      };
    }
    
    // Broadcaster à tous les autres joueurs
    socket.broadcast.emit('otherPlayerUpdate', {
      id: socket.id,
      ...data
    });
  });

  // Event: Chat/Message
  socket.on('chat', (message) => {
    io.emit('chat', {
      playerId: socket.id,
      message: message,
      timestamp: new Date()
    });
  });

  // Event: Déconnexion
  socket.on('disconnect', () => {
    console.log(`[✗] Joueur déconnecté: ${socket.id}`);
    delete players[socket.id];
    
    // Notifier les autres de la déconnexion
    io.emit('playerDisconnected', socket.id);
  });

  // Garder une connexion active (heartbeat)
  socket.on('ping', () => {
    socket.emit('pong');
  });
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    playersConnected: Object.keys(players).length,
    timestamp: new Date()
  });
});

// Route pour obtenir les stats
app.get('/stats', (req, res) => {
  res.json({
    playersOnline: Object.keys(players).length,
    players: Object.values(players)
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur 3D Run lancé sur le port ${PORT}`);
  console.log(`📍 URL du serveur: http://localhost:${PORT}`);
});

// Gestion des erreurs
process.on('uncaughtException', (err) => {
  console.error('Erreur non capturée:', err);
});
