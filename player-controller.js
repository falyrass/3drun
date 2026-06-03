// player-controller.js - Logique de déplacement, collisions et contrôleur
import * as THREE from 'three';

// Constante de vitesse de déplacement
export const MOVE_SPEED = 3.75; // -25% vitesse

// État du joystick
export const moveData = { active: false, angle: 0, distance: 0 };

export function initJoystick() {
    const manager = nipplejs.create({
        zone: document.getElementById('joystick-zone'),
        mode: 'static',
        position: { left: '50%', top: '50%' },
        color: 'white',
        size: 100
    });

    manager.on('move', (evt, data) => {
        moveData.active = true;
        moveData.angle = data.angle.radian;
        moveData.distance = data.distance / 50;
    });

    manager.on('end', () => {
        moveData.active = false;
    });
}

// Raycaster "en dur" pour éviter d'en allouer pour chaque frame
const collisionRaycaster = new THREE.Raycaster();
const moveDir = new THREE.Vector3();

// --- État de la physique (Gravité / Sauts) ---
let velocityY = 0;
const GRAVITY = -18.0; 
const TERMINAL_VELOCITY = -30.0;

export function updateMovement(delta, model, mixer, camera, controls, walkAction, idleAction, colliders, onUpdate) {
    if (!model || !mixer) return;

    // --- 1. Gestion de la Gravité et Altitudes (Axe Y) ---
    // On veut poser le modèle sur le sol (pente ou plat). Sinon on tombe.
    let onGround = false;
    if (colliders && colliders.length > 0) {
        // Rayon projeté vers le bas depuis la tête du personnage (environ 0.63m de haut, car scale 0.42)
        const originDown = model.position.clone();
        originDown.y += 0.63; 
        const downDir = new THREE.Vector3(0, -1, 0);
        collisionRaycaster.set(originDown, downDir);
        
        const groundIntersects = collisionRaycaster.intersectObjects(colliders, true);
        
        // S'il trouve un sol sous ses pieds (distance < 0.68m pour une petite marge)
        if (groundIntersects.length > 0 && groundIntersects[0].distance <= 0.68) {
            onGround = true;
            model.position.y = groundIntersects[0].point.y; // Snap précis sur le sol pour l'effet Physique (Gravité)
            velocityY = 0;
        } else {
            // Chute libre (Physique pure)
            onGround = false;
        }
    }

    if (!onGround) {
        velocityY += GRAVITY * delta;
        if (velocityY < TERMINAL_VELOCITY) velocityY = TERMINAL_VELOCITY;
        model.position.y += velocityY * delta;
    }

    if (moveData.active) {
        // Orienter le personnage selon la caméra + joystick
        const angleCamera = Math.atan2(
            camera.position.x - model.position.x,
            camera.position.z - model.position.z
        );

        model.rotation.y = angleCamera + moveData.angle - Math.PI / 2;

        const speed = MOVE_SPEED * delta * moveData.distance;

        // --- Système de Collisions ---
        let canMove = true;
        if (colliders && colliders.length > 0) {
            // Calculer la direction "Avant" du personnage
            moveDir.set(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), model.rotation.y).normalize();
            
            // Placer le rayon à mi-hauteur du personnage pour éviter de toucher le sol (0.42m car scale 0.42)
            const origin = model.position.clone().add(new THREE.Vector3(0, 0.42, 0));
            collisionRaycaster.set(origin, moveDir);

            // Vérifier intersection
            const intersects = collisionRaycaster.intersectObjects(colliders, true);
            
            // S'il y a un obstacle devant et très proche, on check la face (mur VS pente)
            if (intersects.length > 0 && intersects[0].distance < speed + 0.25) {
                // Si la normale de la face touchée regarde majoritairement vers le côté/bas, c'est un mur (90°)
                // Si la normale de la face regarde vers le haut (normal.y > 0.4), c'est une pente praticable.
                const normalY = intersects[0].face ? intersects[0].face.normal.y : 0;
                
                if (normalY < 0.4) {
                    // C'est un mur, on bloque complètement le déplacement
                    canMove = false;
                }
                // Si c'est une pente (normalY >= 0.4), on ignore le blocage frontal car la gravité/raycaster vertical s'en chargera.
            }
        }

        if (canMove) {
            model.translateZ(-speed);
        }

        // --- Animations ---
        walkAction.setEffectiveWeight(canMove ? 1 : 0);
        idleAction.setEffectiveWeight(canMove ? 0 : 1);
        // Adapter la vitesse d'animation à la nouvelle vitesse (1.05 au lieu de 1.4)
        walkAction.timeScale = moveData.distance * 1.05;

        // Cible la caméra sur le dos (0.42m de haut) au lieu de la tête
        controls.target.copy(model.position).add(new THREE.Vector3(0, 0.42, 0));
    } else {
        // Mode repos
        walkAction.setEffectiveWeight(0);
        idleAction.setEffectiveWeight(1);
        // Cible la caméra sur le dos
        controls.target.copy(model.position).add(new THREE.Vector3(0, 0.42, 0));
    }

    if (onUpdate) {
        onUpdate(
            model.position,
            model.rotation.y,
            moveData.active ? 'walk' : 'idle'
        );
    }
}
