// webrtc-audio.js - Gestion du groupe audio WebRTC

export class WebRTCAudioManager {
  constructor(socket, localStream) {
    this.socket = socket;
    this.localStream = localStream;
    this.peerConnections = {}; // { peerId: RTCPeerConnection }
    this.remoteTracks = {}; // { peerId: MediaStream }
    this.audioContexts = {}; // { peerId: AudioContext }
    this.onRemoteStream = null;
    this.onRemoteStreamRemoved = null;
    
    // Configuration WebRTC optimisée pour audio clair avec peu de bande passante
    this.peerConfig = {
      iceServers: [
        { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }
      ]
    };
    
    this.setupSocketListeners();
  }

  setupSocketListeners() {
    // Recevoir une offre d'un autre pair
    this.socket.on('webrtc-offer', async (data) => {
      await this.handleOffer(data.from, data.offer);
    });

    // Recevoir une réponse d'un autre pair
    this.socket.on('webrtc-answer', async (data) => {
      await this.handleAnswer(data.from, data.answer);
    });

    // Recevoir un candidat ICE
    this.socket.on('webrtc-ice-candidate', async (data) => {
      await this.handleIceCandidate(data.from, data.candidate);
    });

    // Quand un nouveau joueur rejoint (créer une offre)
    this.socket.on('newPlayerJoined', async (playerId) => {
      console.log(`[🎙️] Création d'appel audio avec ${playerId}`);
      await this.callPeer(playerId);
    });

    // Retirer les connexions quand un joueur se déconnecte
    this.socket.on('playerDisconnected', (playerId) => {
      this.closePeerConnection(playerId);
    });
  }

  // Créer une offre SDP pour appeler un pair
  async callPeer(peerId) {
    try {
      const peerConnection = this.createPeerConnection(peerId);
      
      // Ajouter les pistes audio locales
      if (this.localStream) {
        this.localStream.getAudioTracks().forEach(track => {
          peerConnection.addTrack(track, this.localStream);
        });
      }

      // Créer une offre
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      });
      
      await peerConnection.setLocalDescription(offer);

      // Envoyer l'offre via Socket.io
      this.socket.emit('webrtc-offer', {
        to: peerId,
        from: this.socket.id,
        offer: offer
      });

      console.log(`[📤] Offre envoyée à ${peerId}`);
    } catch (error) {
      console.error('[✗] Erreur lors de la création de l\'offre:', error);
    }
  }

  // Gérer une offre reçue
  async handleOffer(fromPeerId, offer) {
    try {
      let peerConnection = this.peerConnections[fromPeerId];
      
      if (!peerConnection) {
        peerConnection = this.createPeerConnection(fromPeerId);
      }

      // Ajouter les pistes audio locales si pas déjà fait
      if (peerConnection.getSenders().length === 0 && this.localStream) {
        this.localStream.getAudioTracks().forEach(track => {
          peerConnection.addTrack(track, this.localStream);
        });
      }

      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

      // Créer une réponse
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      // Envoyer la réponse
      this.socket.emit('webrtc-answer', {
        to: fromPeerId,
        from: this.socket.id,
        answer: answer
      });

      console.log(`[📥] Réponse envoyée à ${fromPeerId}`);
    } catch (error) {
      console.error('[✗] Erreur lors du traitement de l\'offre:', error);
    }
  }

  // Gérer une réponse reçue
  async handleAnswer(fromPeerId, answer) {
    try {
      const peerConnection = this.peerConnections[fromPeerId];
      
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        console.log(`[✓] Connexion établie avec ${fromPeerId}`);
      }
    } catch (error) {
      console.error('[✗] Erreur lors du traitement de la réponse:', error);
    }
  }

  // Gérer les candidats ICE
  async handleIceCandidate(fromPeerId, candidate) {
    try {
      const peerConnection = this.peerConnections[fromPeerId];
      
      if (peerConnection && candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('[✗] Erreur lors de l\'ajout du candidat ICE:', error);
    }
  }

  createPeerConnection(peerId) {
    const peerConnection = new RTCPeerConnection(this.peerConfig);
    
    this.peerConnections[peerId] = peerConnection;

    // Événement: piste audio reçue
    peerConnection.ontrack = (event) => {
      console.log(`[🔊] Piste audio reçue de ${peerId}`);
      
      if (event.streams && event.streams[0]) {
        this.remoteTracks[peerId] = event.streams[0];
        
        if (this.onRemoteStream) {
          this.onRemoteStream(peerId, event.streams[0]);
        }
      }
    };

    // Événement: changement d'état de connexion
    peerConnection.onconnectionstatechange = () => {
      console.log(`[🔗] État connexion ${peerId}: ${peerConnection.connectionState}`);
      
      if (peerConnection.connectionState === 'failed' || 
          peerConnection.connectionState === 'disconnected' ||
          peerConnection.connectionState === 'closed') {
        this.closePeerConnection(peerId);
      }
    };

    // Événement: candidat ICE trouvé
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Envoyer le candidat ICE à l'autre pair
        this.socket.emit('webrtc-ice-candidate', {
          to: peerId,
          from: this.socket.id,
          candidate: event.candidate
        });
      }
    };

    return peerConnection;
  }

  // Fermer une connexion pair
  closePeerConnection(peerId) {
    const peerConnection = this.peerConnections[peerId];
    
    if (peerConnection) {
      peerConnection.close();
      delete this.peerConnections[peerId];
    }
    
    delete this.remoteTracks[peerId];
    
    if (this.onRemoteStreamRemoved) {
      this.onRemoteStreamRemoved(peerId);
    }
    
    console.log(`[🔌] Connexion fermée avec ${peerId}`);
  }

  // Arrêter tout
  closeAll() {
    Object.keys(this.peerConnections).forEach(peerId => {
      this.closePeerConnection(peerId);
    });
  }

  // Mettre en sourdine/désactiver le microphone
  muteAudio(mute = true) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !mute;
      });
    }
  }

  // Obtenir tous les streams audio distants
  getRemoteStreams() {
    return this.remoteTracks;
  }
}
