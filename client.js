// client.js - Client Socket.io pour 3D Run Multijoueur

export class MultiplayerClient {
  constructor(serverUrl = 'http://localhost:3000') {
    this.socket = null;
    this.serverUrl = serverUrl;
    this.playerId = null;
    this.otherPlayers = {}; // { playerId: { position, rotation, mesh } }
    this.onPlayerJoined = null;
    this.onPlayerUpdate = null;
    this.onPlayerDisconnected = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        // Charger Socket.io depuis CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
        script.onload = () => {
          this.socket = io(this.serverUrl);
          this.setupListeners();
          resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
      } catch (err) {
        reject(err);
      }
    });
  }

  setupListeners() {
    // Connexion établie
    this.socket.on('connect', () => {
      this.playerId = this.socket.id;
      console.log(`[✓] Connecté au serveur avec l'ID: ${this.playerId}`);
    });

    // Joueurs existants
    this.socket.on('playersExist', (players) => {
      console.log(`[📊] ${Object.keys(players).length} joueurs en ligne`);
      Object.values(players).forEach(player => {
        if (player.id !== this.playerId) {
          this.otherPlayers[player.id] = player;
          if (this.onPlayerJoined) {
            this.onPlayerJoined(player);
          }
        }
      });
    });

    // Nouveau joueur rejoint
    this.socket.on('playerJoined', (player) => {
      console.log(`[+] Joueur rejoint: ${player.id}`);
      this.otherPlayers[player.id] = player;
      if (this.onPlayerJoined) {
        this.onPlayerJoined(player);
      }
    });

    // Mise à jour d'un autre joueur
    this.socket.on('otherPlayerUpdate', (data) => {
      if (data.id !== this.playerId) {
        this.otherPlayers[data.id] = {
          ...this.otherPlayers[data.id],
          ...data
        };
        if (this.onPlayerUpdate) {
          this.onPlayerUpdate(data);
        }
      }
    });

    // Joueur déconnecté
    this.socket.on('playerDisconnected', (playerId) => {
      console.log(`[-] Joueur déconnecté: ${playerId}`);
      delete this.otherPlayers[playerId];
      if (this.onPlayerDisconnected) {
        this.onPlayerDisconnected(playerId);
      }
    });

    // Reconnexion
    this.socket.on('reconnect', () => {
      console.log('[🔄] Reconnecté au serveur');
    });

    // Erreur de connexion
    this.socket.on('connect_error', (error) => {
      console.error('[✗] Erreur de connexion:', error);
    });
  }

  sendPlayerUpdate(position, rotation, animation = 'idle') {
    if (this.socket) {
      this.socket.emit('playerUpdate', {
        position,
        rotation,
        animation,
        timestamp: Date.now()
      });
    }
  }

  sendChat(message) {
    if (this.socket) {
      this.socket.emit('chat', message);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('[✗] Déconnecté du serveur');
    }
  }

  getOtherPlayers() {
    return Object.values(this.otherPlayers);
  }

  getPlayerCount() {
    return Object.keys(this.otherPlayers).length + 1; // +1 pour le joueur actuel
  }
}
