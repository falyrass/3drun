# 🗺️ Carte et Assets 3D - Guide de Personnalisation

## Architecture Actuelle

La carte se charge **au démarrage** de l'application via `preloadMapAssets()` appelée depuis `index.html`:
1. **Pré-chargement** des modèles 3D externes (glTF/glb)
2. **Fallback automatique** → géométries simples améliorées si le chargement échoue
3. **Placement** des arbres et rochers selon positions prédéfinies

## Remplacer les Modèles Externes

### Étape 1 : Trouver un Modèle glTF/glb

| Source | Avantages | Notes |
|--------|-----------|-------|
| **[Sketchfab](https://sketchfab.com)** | Large sélection, modèles CC0/publics | URL directe rarement dispo, filtraires par license (Royalty Free) |
| **[Quaternius.com](https://quaternius.com)** | Low-poly, gratuit, parfait pour jeux | Format glb téléchargeable |
| **[Poly Haven](https://polyhaven.com/models)** | Assets CC0, qualité pro | Nécessite téléchargement manuel |
| **[Sketchfab API](https://sketchfab.com/developers)** | API embed/download | Nécessite authentification |

### Étape 2 : Héberger le Modèle

**Option A : Localement dans le projet**
```bash
# Créer un dossier assets
mkdir -p /home/falyrass/htdocs/3DRun/assets/models

# Placer le fichier .glb ou .gltf dedans
cp /path/to/tree.glb assets/models/
```

Puis mettre à jour `map.js`:
```javascript
const assetUrls = {
  rock: './assets/models/rock.glb',     // Chemin relatif local
  tree: './assets/models/tree.glb',
};
```

**Option B : CDN externe**
- GitHub Raw (CDN jsdelivr) : `https://cdn.jsdelivr.net/gh/user/repo@branch/path/to/file.glb`
- CORS doit être activé !

### Étape 3 : Mettre à Jour map.js

Éditer les URLs dans `preloadMapAssets()` (lignes ~18-21):

```javascript
const assetUrls = {
  rock: 'https://cdn.jsdelivr.net/gh/user/repo@main/assets/rock.glb',
  tree: 'https://cdn.jsdelivr.net/gh/user/repo@main/assets/tree.glb',
};
```

### Étape 4 : Tester

Ouvrir la console F12 et vérifier:
- ✅ `[✓] Asset externe chargé: rock (URL)` = succès
- ⚠️ `[!] Asset non disponible (rock). Fallback géométrie active.` = fallback activé

## Fallbacks Géométriques (Actuellement Actifs)

Si les modèles externes ne chargent pas, ces génométries de secours s'activent:

### Rochers
```
- Icosaèdre principal (subdivision 4)
- 3 mini-icosaèdres autour pour relief
- Matériau: gris métallique standard
```

### Arbres
```
- Cylindre 0.5→0.7 hauteur 5 (tronc)
- Cône hauteur 6 largeur 3.5 (feuillage)
- Matériaux: écorce + feuilles vertes
```

## Performance et Optimisations

| Approche | VRAM | Bande | FPS | Recommandé |
|----------|------|-------|-----|-----------|
| Modèles externes low-poly | 🟢 30MB | 🟡 5-15MB | 60 | ✅ Oui |
| Fallback géométrie | 🟢 5MB | 🟢 0 | 60 | Fallback |
| Modèles AAA haute-qual | 🔴 200MB+ | 🔴 50MB+ | 30 | ❌ Non |

## Exemples de Modèles Recommandés

### Quaternius.com (Facile)
- [Boulder](https://quaternius.com/index.html) → Télécharger → .glb → `./assets/models/rock.glb`
- [Oak Tree](https://quaternius.com/index.html) → Similar → `./assets/models/tree.glb`

### Sketchfab Recherche
- Chercher: "low poly rock CC0" / "low poly tree CC0"
- Télécharger .glb
- Héberger sur GitHub + CDN jsdelivr

## Dépannage

### "Asset non disponible" mais statut OK
→ CORS bloqué
**Solution:** Héberger localement ou utiliser GitHub + jsdelivr

### Le modèle charge mais pire rendu que fallback
→ Modèle mal importé ou orienté différemment
**Solution:** Modifier scale/position/rotation dans `createTree()` / `createRock()`

### Chargement trop lent
→ Modèles trop lourds (>10MB)
**Solution:** Simplifier le modèle avec Blender ou utiliser version low-poly

---

**Dernière mise à jour:** 10 mars 2026  
**Version:** map.js v2 (assets externes)
