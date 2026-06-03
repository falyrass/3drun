// map.js - Cyberpunk HD City avec Collisions
// Peut charger un modèle GLTF externe, sinon génère une ville "Full HD" réaliste procéduralement.

let externalGridModel = null;
export const collidableObjects = []; // Exporté pour les collisions du player-controller
export const mapBounds = { minY: 0, respawnY: -15 }; // Limites pour la chute

// Fonction utilitaire pour créer des murs d'énergie visibles
function createEnergyWall(scene, THREE, width, height, position, rotation) {
    const geo = new THREE.PlaneGeometry(width, height);
    const mat = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff, 
        transparent: true, 
        opacity: 0.3, 
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(position);
    if (rotation) {
        mesh.rotation.copy(rotation);
    }
    scene.add(mesh);
    
    // Mettre un mesh invisible plus large pour le collider physique (Box) car on evite de collisionner des Planes fin
    const colliderGeo = new THREE.BoxGeometry(width, height, 2);
    const colliderMat = new THREE.MeshBasicMaterial({ visible: false });
    const colliderMesh = new THREE.Mesh(colliderGeo, colliderMat);
    colliderMesh.position.copy(position);
    if (rotation) colliderMesh.rotation.copy(rotation);
    scene.add(colliderMesh);
    collidableObjects.push(colliderMesh);
}

/**
 * Précharge le modèle 3D externe si disponible
 */
export async function preloadMapAssets(THREE) {
    const { GLTFLoader } = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js');
    const loader = new GLTFLoader();

    // Modèle local map.glb
    const cityUrl = './map.glb';

    return new Promise((resolve) => {
        loader.load(
            cityUrl,
            (gltf) => {
                externalGridModel = gltf.scene;
                console.log(`[✓] Modèle de ville externe chargé.`);
                resolve();
            },
            undefined,
            (error) => {
                console.warn(`[!] Modèle externe non trouvé, génération de la ville Cyberpunk procédurale en fallback.`);
                externalGridModel = null;
                resolve();
            }
        );
    });
}

/**
 * Initialise la carte (ajoute la ville générée ou importée à la scène)
 */
export function initMap(scene, THREE) {
    // 1. Ambiance lumineuse pour bien voir le modèle importé
    // Ciel clair ou crépuscule pour révéler la géométrie
    scene.background = new THREE.Color(0x87CEEB); // Bleu ciel clair
    scene.fog = new THREE.FogExp2(0x87CEEB, 0.002); // Brouillard très léger
    
    // Lumière ambiante forte pour éclairer toutes les faces
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    // Lumière directionnelle (Soleil) pour donner du relief et des ombres
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    sunLight.position.set(100, 200, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    const d = 100;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    // Vider le tableau des collisions
    collidableObjects.length = 0;

    // 2. Si on a pu charger un vrai modèle .glb AAA
    if (externalGridModel) {
        externalGridModel.position.set(0, 0, 0);
        // ECHELLE MAP: +20% sur tous les axes (1.2)
        externalGridModel.scale.set(1.2, 1.2, 1.2);
        
        scene.add(externalGridModel);
        
        // Ajouter tous les meshes à la liste des objets solides
        externalGridModel.traverse((child) => {
            if (child.isMesh) {
                collidableObjects.push(child);
            }
        });

        // ---------------- CALCUL AUTO BORDERS ET MURS ENERGETIQUES ----------------
        const box = new THREE.Box3().setFromObject(externalGridModel);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);
        
        mapBounds.minY = box.min.y;
        mapBounds.respawnY = box.min.y - 10; // C'est le "auto"

        const wallHeight = 50;
        const wY = center.y + wallHeight/2;

        // Front Wall
        createEnergyWall(scene, THREE, size.x, wallHeight, new THREE.Vector3(center.x, wY, box.min.z));
        // Back Wall
        createEnergyWall(scene, THREE, size.x, wallHeight, new THREE.Vector3(center.x, wY, box.max.z));
        // Left Wall
        createEnergyWall(scene, THREE, size.z, wallHeight, new THREE.Vector3(box.min.x, wY, center.z), new THREE.Euler(0, Math.PI/2, 0));
        // Right Wall
        createEnergyWall(scene, THREE, size.z, wallHeight, new THREE.Vector3(box.max.x, wY, center.z), new THREE.Euler(0, Math.PI/2, 0));
        // -------------------------------------------------------------------------

        console.log('[✓] Ville GLTF 3D construite avec murs et collisions activés.');
        return;
    }

    // 3. FALLBACK : GÉNÉRATION VILLE CYBERPUNK "FULL HD" PROCÉDURALE
    // Matériau du sol : asphalte sombre très réflectif (mouillé)
    const floorGeo = new THREE.PlaneGeometry(300, 300);
    const floorMat = new THREE.MeshStandardMaterial({ 
        color: 0x050505,
        roughness: 0.15, // Réflectivité forte
        metalness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor); // Pas dans collidableObjects car c'est le sol

    // Matériau pour les bâtiments métalliques sombres
    const buildingMat = new THREE.MeshStandardMaterial({ 
        color: 0x0a0a0f,
        roughness: 0.6,
        metalness: 0.7, // Effet vitre/métal
    });

    const cityGroup = new THREE.Group();
    const neonColors = [0x00ffff, 0xff00ff, 0xff0055, 0x00ffaa, 0xfaea00];

    // Boucle de génération des blocs de la ville avec des routes
    for (let x = -100; x <= 100; x += 25) {
        for (let z = -100; z <= 100; z += 25) {
            
            // Ne pas mettre de bâtiments au centre (zone de spawn / grande place)
            if (Math.abs(x) < 30 && Math.abs(z) < 30) continue;
            
            // Laisser certaines zones vides aléatoirement
            if (Math.random() > 0.8) continue;

            const bWidth = 10 + Math.random() * 10;
            const bDepth = 10 + Math.random() * 10;
            const bHeight = 20 + Math.random() * 60; // Gratte-ciels très hauts

            const bGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
            const building = new THREE.Mesh(bGeo, buildingMat);
            
            building.position.set(
                x + (Math.random() - 0.5) * 5, 
                bHeight / 2, 
                z + (Math.random() - 0.5) * 5
            );
            
            building.castShadow = true;
            building.receiveShadow = true;

            // Ajouter le bâtiment comme OBSTACLE
            collidableObjects.push(building);
            cityGroup.add(building);

            // Ajouter des bandes de Néons brillants sur les edges
            if (Math.random() > 0.3) {
                const nColor = neonColors[Math.floor(Math.random() * neonColors.length)];
                const neonMat = new THREE.MeshBasicMaterial({ color: nColor });
                
                const stripGeo = new THREE.BoxGeometry(0.6, bHeight - 5, 0.6);
                const stripMesh = new THREE.Mesh(stripGeo, neonMat);
                
                stripMesh.position.set(
                    building.position.x + bWidth / 2,
                    bHeight / 2,
                    building.position.z + bDepth / 2
                );
                cityGroup.add(stripMesh);

                // Effet de halo avec PointLight sur le sol glissant
                if (Math.random() > 0.5) {
                    const neonLight = new THREE.PointLight(nColor, 3, 35);
                    neonLight.position.set(
                        building.position.x + bWidth / 2 + 1,
                        2, 
                        building.position.z + bDepth / 2 + 1
                    );
                    cityGroup.add(neonLight);
                }
            }
        }
    }

    scene.add(cityGroup);
    console.log('[✓] Ville procédurale Cyberpunk Haute Qualité générée avec Collisions.');
}
