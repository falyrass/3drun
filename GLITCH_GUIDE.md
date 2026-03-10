# 3D Run Multijoueur - Guide Glitch

## 🚀 Déploiement sur Glitch

### Étape 1 : Créer un compte Glitch
1. Aller sur https://glitch.com
2. Se créer un compte gratuit

### Étape 2 : Importer le projet
1. Cliquer sur **"New Project"** → **"Import from GitHub"**
2. Entrer l'URL de votre repository git

### Étape 3 : Configuration des fichiers
1. Les fichiers suivants doivent être dans le projet :
   - `server.js` (serveur Node.js)
   - `package.json` (dépendances)
   - `index.html` (frontend)
   - `map.js` (carte)
   - `client.js` (client Socket.io)

### Étape 4 : Installation des dépendances
Glitch installe automatiquement via `package.json` mais vous pouvez vérifier :
1. Cliquer sur le terminal en bas
2. Taper : `npm install`

### Étape 5 : Récupérer l'URL du serveur
1. Cliquer sur **"Share"** en haut à gauche
2. Copier le lien projet (ex: `https://mon-projet-glitch.glitch.me`)

### Étape 6 : Modifier le URL du client
Dans `client.js`, ligne de la connexion :
```javascript
multiplayerClient = new MultiplayerClient('https://mon-projet-glitch.glitch.me');
```

### Étape 7 : Tester
1. Ouvrir plusieurs onglets du jeu
2. Voir les autres joueurs de chaque côté !

---

## 📊 Architecture

```
Frontend (GitHub Pages / Netlify)
    ↓ WebSocket
Node.js Server (Glitch)
    + Socket.io
    + Synchronisation des joueurs
```

---

## 🎮 Fonctionnalités

✅ Connexion multijoueur en temps réel
✅ Synchronisation des positions
✅ Affichage des autres joueurs
✅ Chat (ready to implement)
✅ Déconnexion automatique

---

## 🛠️ Commandes Glitch

- **npm start** : Lance le serveur
- **npm run dev** : Mode développement avec nodemon

---

## 📍 Variables d'environnement (facultatif)

Pour sécuriser votre serveur, vous pouvez utiliser `.env` :
```
PORT=3000
CORS_ORIGIN=https://votre-domaine.com
```

---

## ✨ Prochaines étapes

- [ ] Déployer le frontend sur GitHub Pages
- [ ] Configurer un domaine personnalisé
- [ ] Ajouter une base de données (Firebase)
- [ ] Ajouter plus d'animations des autres joueurs
- [ ] Système de chat global

Bon jeu ! 🎮
