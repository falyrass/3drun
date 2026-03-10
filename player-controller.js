// player-controller.js - Logique de déplacement et contrôleur de personnage
// ================================================================
// ⚠️  NE PAS MODIFIER CE FICHIER
//     La logique de déplacement et du contrôleur de personnage est
//     validée et fonctionnelle. Toute modification peut casser le
//     comportement du joueur. Modifier uniquement si absolument
//     nécessaire et après tests approfondis.
// ================================================================

import * as THREE from 'three';

// Constante de vitesse de déplacement
export const MOVE_SPEED = 5.0;

// État du joystick — partagé en lecture par le reste de l'app
export const moveData = { active: false, angle: 0, distance: 0 };

/**
 * Initialise le joystick NippleJS dans la zone #joystick-zone
 * et met à jour moveData en temps réel.
 */
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

/**
 * Met à jour la position et les animations du personnage local.
 *
 * @param {number}   delta      - Temps écoulé depuis la dernière frame (clock.getDelta())
 * @param {Object}   model      - THREE.Object3D du personnage local
 * @param {Object}   mixer      - THREE.AnimationMixer du personnage local
 * @param {Object}   camera     - THREE.Camera de la scène
 * @param {Object}   controls   - OrbitControls associés à la caméra
 * @param {Object}   walkAction - AnimationAction de marche
 * @param {Object}   idleAction - AnimationAction idle
 * @param {Function} onUpdate   - Callback appelé avec (position, rotationY, animation)
 *                               pour transmettre la position au multijoueur
 */
export function updateMovement(delta, model, mixer, camera, controls, walkAction, idleAction, onUpdate) {
    if (!model || !mixer) return;

    if (moveData.active) {
        // Orienter le personnage selon la direction de la caméra + joystick
        const angleCamera = Math.atan2(
            camera.position.x - model.position.x,
            camera.position.z - model.position.z
        );

        model.rotation.y = angleCamera + moveData.angle - Math.PI / 2;

        // Déplacer vers l'avant selon la vitesse du joystick
        const speed = MOVE_SPEED * delta * moveData.distance;
        model.translateZ(-speed);

        // Animation marche
        walkAction.setEffectiveWeight(1);
        idleAction.setEffectiveWeight(0);
        walkAction.timeScale = moveData.distance * 1.4;

        controls.target.copy(model.position).add(new THREE.Vector3(0, 1.5, 0));
    } else {
        // Animation idle
        walkAction.setEffectiveWeight(0);
        idleAction.setEffectiveWeight(1);

        controls.target.copy(model.position).add(new THREE.Vector3(0, 1.5, 0));
    }

    // Notifier le multijoueur de la nouvelle position
    if (onUpdate) {
        onUpdate(
            model.position,
            model.rotation.y,
            moveData.active ? 'walk' : 'idle'
        );
    }
}
