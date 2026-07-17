import * as THREE from 'three';

export function initScene(container) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x1a1410, 0.035);
  scene.background = new THREE.Color(0x1a1410);

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 2, 8);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // Warm ambient light — sets the base mood
  const ambient = new THREE.AmbientLight(0xffcf9e, 0.4);
  scene.add(ambient);

  // Key light — warm directional, casts soft shadows
  const keyLight = new THREE.DirectionalLight(0xffb877, 1.2);
  keyLight.position.set(5, 8, 5);
  keyLight.castShadow = true;
  scene.add(keyLight);

  // Fill light — cooler, subtle, prevents shadows from being pure black
  const fillLight = new THREE.DirectionalLight(0x6f8faf, 0.3);
  fillLight.position.set(-5, 3, -5);
  scene.add(fillLight);

  // Temporary ground plane so you have something to see lighting/fog against
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ color: 0x2a2018 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer };
}