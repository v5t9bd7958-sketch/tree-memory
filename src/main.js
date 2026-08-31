import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js';

const container = document.getElementById('game');

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.set(0, 2, 7);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

container.appendChild(renderer.domElement);

scene.background = new THREE.Color(0x11100d);

const light = new THREE.HemisphereLight(
  0xffffff,
  0x222222,
  2
);

scene.add(light);

const geometry = new THREE.BoxGeometry(1, 1, 1);

const material = new THREE.MeshStandardMaterial({
  color: 0x8b6f47
});

const cube = new THREE.Mesh(geometry, material);

scene.add(cube);

function animate() {
  requestAnimationFrame(animate);

  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );
});
