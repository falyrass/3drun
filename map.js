// map.js - Plaine naturelle avec arbres et pierres

export function initMap(scene, THREE) {
  // Matériaux naturels
  const treeBarkMaterial = new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.8 });
  const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22, roughness: 0.9 });
  const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.9, metalness: 0.1 });
  const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5016, roughness: 0.95 });
  
  // Fonction pour créer un arbre simple
  function createTree(x, z) {
    // Tronc
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.7, 5, 8),
      treeBarkMaterial
    );
    trunk.position.set(x, 2.5, z);
    trunk.castShadow = true;
    scene.add(trunk);
    
    // Feuillage (cône)
    const foliage = new THREE.Mesh(
      new THREE.ConeGeometry(3.5, 6, 16),
      leafMaterial
    );
    foliage.position.set(x, 6.5, z);
    foliage.castShadow = true;
    scene.add(foliage);
  }
  
  // Fonction pour créer une pierre/rocher
  function createRock(x, z, scale = 1) {
    const geometry = new THREE.IcosahedronGeometry(scale, 3);
    const rock = new THREE.Mesh(geometry, stoneMaterial);
    rock.position.set(x, scale * 0.8, z);
    rock.castShadow = true;
    rock.receiveShadow = true;
    scene.add(rock);
  }
  
  // Créer des arbres disséminés dans la plaine
  const treePositions = [
    // Groupes d'arbres
    { x: -30, z: -30 }, { x: -25, z: -28 }, { x: -35, z: -32 },
    { x: -10, z: -40 }, { x: -5, z: -38 }, { x: -15, z: -42 },
    { x: 20, z: -35 }, { x: 25, z: -30 }, { x: 15, z: -32 },
    { x: 35, z: -25 }, { x: 40, z: -20 }, { x: 38, z: -28 },
    
    { x: -40, z: 0 }, { x: -42, z: 5 }, { x: -38, z: -5 },
    { x: -15, z: 10 }, { x: -10, z: 15 }, { x: -20, z: 12 },
    { x: 10, z: 8 }, { x: 15, z: 12 }, { x: 5, z: 10 },
    { x: 32, z: 15 }, { x: 38, z: 20 }, { x: 35, z: 10 },
    
    { x: -28, z: 35 }, { x: -22, z: 38 }, { x: -35, z: 40 },
    { x: -5, z: 42 }, { x: 0, z: 38 }, { x: 5, z: 40 },
    { x: 25, z: 35 }, { x: 30, z: 40 }, { x: 20, z: 38 },
    { x: 40, z: 30 }, { x: 42, z: 35 }, { x: 38, z: 40 }
  ];
  
  treePositions.forEach(pos => {
    createTree(pos.x, pos.z);
  });
  
  // Créer des rochers/ pierres
  const rockPositions = [
    { x: -15, z: -15, s: 1.2 }, { x: -10, z: -10, s: 0.8 }, { x: -20, z: -5, s: 1 },
    { x: 5, z: -20, s: 0.9 }, { x: 10, z: -15, s: 1.1 }, { x: -5, z: 5, s: 0.7 },
    { x: 20, z: 10, s: 1.3 }, { x: 15, z: 5, s: 1 }, { x: 25, z: 0, s: 0.85 },
    { x: -25, z: 20, s: 1.2 }, { x: -30, z: 15, s: 1 }, { x: 30, z: 25, s: 0.95 },
    { x: 0, z: 30, s: 1.1 }, { x: 35, z: 5, s: 1.2 }, { x: -35, z: 10, s: 0.9 },
    { x: 12, z: 35, s: 1 }, { x: -8, z: -35, s: 1.3 }, { x: 28, z: -25, s: 0.8 }
  ];
  
  rockPositions.forEach(pos => {
    createRock(pos.x, pos.z, pos.s);
  });
  
  // Herbe/Végétation au sol (texture subtile à travers la grille)
  const grassQuads = [
    { x: -20, z: -20, w: 40, h: 40 },
    { x: 20, z: -20, w: 40, h: 40 },
    { x: -20, z: 20, w: 40, h: 40 },
    { x: 20, z: 20, w: 40, h: 40 }
  ];
  
  grassQuads.forEach(zone => {
    const grass = new THREE.Mesh(
      new THREE.PlaneGeometry(zone.w, zone.h),
      grassMaterial
    );
    grass.rotation.x = -Math.PI / 2;
    grass.position.set(zone.x, 0.01, zone.z);
    grass.receiveShadow = true;
    scene.add(grass);
  });
  
  console.log('Plaine naturelle chargée avec succès !');
}

export function addGroundDetails(scene, THREE) {
  // Ajouter des détails réalistes au sol
  
  // Matériaux
  const smallRockMaterial = new THREE.MeshStandardMaterial({ color: 0x696969, roughness: 0.95 });
  const flowerColor1 = new THREE.MeshBasicMaterial({ color: 0xff69b4 }); // Rose
  const flowerColor2 = new THREE.MeshBasicMaterial({ color: 0xffd700 }); // Or
  const flowerColor3 = new THREE.MeshBasicMaterial({ color: 0xff6347 }); // Tomate/Rouge
  
  // Fonction pour générer positions aléatoires
  function getRandomPosition() {
    return {
      x: (Math.random() - 0.5) * 95,
      z: (Math.random() - 0.5) * 95
    };
  }
  
  // Ajouter des petits cailloux dispersés
  for (let i = 0; i < 60; i++) {
    const pos = getRandomPosition();
    const scale = Math.random() * 0.4 + 0.1;
    
    const rock = new THREE.Mesh(
      new THREE.IcosahedronGeometry(scale, 2),
      smallRockMaterial
    );
    rock.position.set(pos.x, 0.15, pos.z);
    rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    rock.castShadow = true;
    scene.add(rock);
  }
  
  // Ajouter des fleurs/herbes hautes
  const flowerMaterials = [flowerColor1, flowerColor2, flowerColor3];
  
  for (let i = 0; i < 80; i++) {
    const pos = getRandomPosition();
    const material = flowerMaterials[Math.floor(Math.random() * flowerMaterials.length)];
    
    // Créer une petite sphère pour les fleurs
    const flower = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 6, 6),
      material
    );
    flower.position.set(pos.x, 0.3, pos.z);
    scene.add(flower);
    
    // Petite tige
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.4, 4),
      new THREE.MeshStandardMaterial({ color: 0x228b22 })
    );
    stem.position.set(pos.x, 0.2, pos.z);
    scene.add(stem);
  }
  
  // Ajouter des touffes d'herbe haute (détails supplémentaires)
  const grassTuftMaterial = new THREE.MeshStandardMaterial({ color: 0x1a4d1a, roughness: 1 });
  
  for (let i = 0; i < 100; i++) {
    const pos = getRandomPosition();
    
    const tuft = new THREE.Mesh(
      new THREE.ConeGeometry(0.2, 0.6, 6),
      grassTuftMaterial
    );
    tuft.position.set(pos.x, 0.3, pos.z);
    tuft.scale.set(
      0.8 + Math.random() * 0.4,
      0.6 + Math.random() * 0.8,
      0.8 + Math.random() * 0.4
    );
    scene.add(tuft);
  }
  
  console.log('Détails du sol ajoutés avec succès !');
}
