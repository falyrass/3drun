# 🎙️ Système d'Audio Multijoueur - 3D Run

## Architecture Audio WebRTC

### Description
Un système d'appel audio de groupe où **tous les joueurs connectés s'entendent en temps réel**.

### Configuration
- **Codec**: Opus (WebRTC standard)
- **Fréquence d'échantillonnage**: 16 kHz (optimisé pour la parole)
- **Canaux**: Mono (1 canal pour économiser la bande passante)
- **Bitrate**: ~20-40 kbps par pair
- **Latence**: < 150ms typiquement

### Fonctionnalités
✅ Suppression d'écho automatique
✅ Suppression du bruit de fond
✅ Appel de groupe (mesh topology)
✅ P2P direct entre les pairs
✅ Qualité audio claire pour la voix
✅ Faible consommation de bande passante

### Flux de connexion

```
1. Joueur A se connecte
   ↓
2. Serveur notifie tous les autres (newPlayerJoined)
   ↓
3. Chaque joueur B crée une offre SDP
   ↓
4. Échange offre/réponse via Socket.io (signalisation)
   ↓
5. Échange candidats ICE
   ↓
6. Connexion P2P établie
   ↓
7. Flux audio direct entre les pairs
```

### Architecture Mesh
```
        [Joueur A]
        /   |   \
       /    |    \
    [B]    [C]    [D]
      \    |    /
       \   |   /
        Direct P2P
```

Chaque joueur se connecte directement à tous les autres
= Pas de goulot d'étranglement serveur
= Latence minimale

### Codage du protocole WebRTC

**Signalisation via Socket.io:**
- `webrtc-offer`: Envoie une offre SDP
- `webrtc-answer`: Envoie une réponse SDP
- `webrtc-ice-candidate`: Envoie les candidats ICE pour la traversée NAT

**Flux de données:**
- RTP (Real-Time Protocol) pour l'audio
- DTLS/TLS pour la sécurité

### Qualité vs Bande Passante

| Paramètre | Valeur | Raison |
|-----------|--------|--------|
| Sample Rate | 16 kHz | Suffisant pour la parole intelligible |
| Channels | 1 (Mono) | Économise 50% bande vs stéréo |
| Bitrate | 20-40 kbps | Très compressé mais clair pour voix |
| Echo Cancel | Actif | Évite larsen |
| Noise Filter | Actif | Réduit bruits de fond |

### Débits estimés

- **Par pair**: 25 kbps en moyenne
- **Avec 3 joueurs**: 50 kbps upload + 50 kbps download = 100 kbps total
- **Avec 10 joueurs**: ~240 kbps total

**Compatible avec:**
- Connexions 3G (> 200 kbps)
- WiFi faible
- Connexions mobiles

## Test local

```bash
npm install
npm start
# Ouvrir 2-3 onglets à http://localhost:3000
# Vous devriez entendre les autres joueurs parler
```

## Évolutif

Pour plus de joueurs (> 30), considérez:
1. **SFU (Selective Forwarding Unit)** - Serveur relai audio
2. **Jitsi Meet** - Solution complète
3. **Twilio** - Service professionnel

## Troubleshooting

| Problème | Solution |
|----------|----------|
| No audio | Vérifier permissions micro |
| Larsen/Echo | Réduire vol mic ou activer headset |
| Lag élevé | Vérifier latence réseau (ping) |
| Bruit | Vérifier suppression bruit activée |
