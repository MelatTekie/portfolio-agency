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

  // Chapters span from about (x:0) out to contact (x:32), so the default
  // shadow frustum (centered at the origin, only a few units wide) only
  // covers the About marker. Re-center the light's target on the middle
  // of that path and widen the frustum to cover the whole thing.
  keyLight.target.position.set(16, 0, -8);
  scene.add(keyLight.target);
  keyLight.shadow.camera.left = -30;
  keyLight.shadow.camera.right = 30;
  keyLight.shadow.camera.top = 20;
  keyLight.shadow.camera.bottom = -20;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 60;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;

  scene.add(keyLight);

  // Fill light — cooler, subtle, prevents shadows from being pure black
  const fillLight = new THREE.DirectionalLight(0x6f8faf, 0.3);
  fillLight.position.set(-5, 3, -5);
  scene.add(fillLight);

  // Ground plane so lighting/fog has something to render against
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ color: 0x2a2018 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  function animate() {
    requestAnimationFrame(animate);
    scene.userData.animated?.forEach((obj) => {
      if (obj.userData.spin) obj.rotation.y += obj.userData.spin;
    });
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

// ---------- Shared face builder (head, hair, curls, eyes, mouth) ----------
function createFaceGroup(skinMat, hairMat) {
  const faceGroup = new THREE.Group();

  const headGeo = new THREE.SphereGeometry(0.28, 20, 20);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.castShadow = true;
  faceGroup.add(head);

  const hairCapGeo = new THREE.SphereGeometry(0.31, 20, 20);
  const hairCap = new THREE.Mesh(hairCapGeo, hairMat);
  hairCap.position.set(0, 0.05, -0.05);
  hairCap.scale.set(1.05, 1, 0.95);
  hairCap.castShadow = true;
  faceGroup.add(hairCap);

  const strandGeo = new THREE.CapsuleGeometry(0.09, 0.75, 4, 8);

  const backStrand = new THREE.Mesh(strandGeo, hairMat);
  backStrand.position.set(0, -0.55, -0.2);
  backStrand.rotation.x = 0.08;
  backStrand.castShadow = true;
  faceGroup.add(backStrand);

  [-1, 1].forEach((side) => {
    const strand = new THREE.Mesh(strandGeo, hairMat);
    strand.position.set(side * 0.26, -0.55, -0.02);
    strand.rotation.z = side * 0.08;
    strand.castShadow = true;
    faceGroup.add(strand);
  });

  const eyeGeo = new THREE.SphereGeometry(0.026, 8, 8);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1a1410 });
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.09, 0.02, 0.25);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.09;
  faceGroup.add(eyeL, eyeR);

  const mouthGeo = new THREE.TorusGeometry(0.06, 0.013, 8, 16, Math.PI);
  const mouthMat = new THREE.MeshStandardMaterial({ color: 0x8a4a3a });
  const mouth = new THREE.Mesh(mouthGeo, mouthMat);
  mouth.position.set(0, -0.06, 0.25);
  mouth.rotation.z = Math.PI;
  faceGroup.add(mouth);

  return faceGroup;
}

// ---------- Seated avatar (About chapter) ----------
function createAvatar() {
  const group = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xd9a679 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x2b1a10 });
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x5f8570 });
  const bodyGeo = new THREE.CapsuleGeometry(0.24, 0.4, 4, 8);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.42;
  body.castShadow = true;
  group.add(body);

  const neckGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.12, 12);
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.y = 0.7;
  group.add(neck);

  const faceGroup = createFaceGroup(skinMat, hairMat);
  faceGroup.position.y = 1.02;
  faceGroup.rotation.x = 0.3;
  group.add(faceGroup);

  const armGeo = new THREE.CapsuleGeometry(0.065, 0.36, 4, 8);
  const armL = new THREE.Mesh(armGeo, skinMat);
  armL.position.set(-0.12, 0.5, 0.18);
  armL.rotation.z = 0.9;
  armL.rotation.y = -0.3;
  armL.castShadow = true;
  group.add(armL);

  const armR = new THREE.Mesh(armGeo, skinMat);
  armR.position.set(0.12, 0.46, 0.2);
  armR.rotation.z = -0.9;
  armR.rotation.y = 0.3;
  armR.castShadow = true;
  group.add(armR);

  const thighGeo = new THREE.CapsuleGeometry(0.09, 0.4, 4, 8);
  const shinGeo = new THREE.CapsuleGeometry(0.08, 0.35, 4, 8);

  [-1, 1].forEach((side) => {
    const thigh = new THREE.Mesh(thighGeo, skinMat);
    thigh.position.set(side * 0.18, 0.1, 0.15);
    thigh.rotation.z = side * -1.1;
    thigh.rotation.x = 0.3;
    thigh.castShadow = true;
    group.add(thigh);

    const shin = new THREE.Mesh(shinGeo, skinMat);
    shin.position.set(side * -0.05, -0.02, 0.32);
    shin.rotation.z = side * 0.5;
    shin.rotation.x = 1.1;
    shin.castShadow = true;
    group.add(shin);

    // Sneaker at the shin's end — position is approximate since the shin
    // is rotated; nudge the 0.2 value (or flip its sign) if it lands
    // near the knee instead of the foot once you see it rendered
    const shoeGeo = new THREE.BoxGeometry(0.12, 0.08, 0.2);
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0xf3ece0 });
    const shoe = new THREE.Mesh(shoeGeo, shoeMat);
    shoe.position.set(0, 0.2, 0);
    shoe.castShadow = true;
    shin.add(shoe);
  });

  return { group };
}

// ---------- Standing avatar (next to the Journey signpost) ----------
function createStandingAvatar() {
  const group = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xd9a679 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x2b1a10 });
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x5f8570 });

  const bodyGeo = new THREE.CapsuleGeometry(0.22, 0.5, 4, 8);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.58;
  body.castShadow = true;
  group.add(body);

  const neckGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.1, 12);
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.y = 0.95;
  group.add(neck);

  const faceGroup = createFaceGroup(skinMat, hairMat);
  faceGroup.position.y = 1.25;
  faceGroup.rotation.x = 0.1;
  group.add(faceGroup);

  const armGeo = new THREE.CapsuleGeometry(0.055, 0.42, 4, 8);
  const armL = new THREE.Mesh(armGeo, skinMat);
  armL.position.set(-0.26, 0.6, 0);
  armL.rotation.z = 0.12;
  armL.castShadow = true;
  group.add(armL);

  const armR = new THREE.Mesh(armGeo, skinMat);
  armR.position.set(0.26, 0.6, 0);
  armR.rotation.z = -0.12;
  armR.castShadow = true;
  group.add(armR);

  const legGeo = new THREE.CapsuleGeometry(0.08, 0.5, 4, 8);
  [-1, 1].forEach((side) => {
    const leg = new THREE.Mesh(legGeo, skinMat);
    leg.position.set(side * 0.1, 0.03, 0);
    leg.castShadow = true;
    group.add(leg);

    const shoeGeo = new THREE.BoxGeometry(0.13, 0.08, 0.22);
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0xf3ece0 });
    const shoe = new THREE.Mesh(shoeGeo, shoeMat);
    shoe.position.set(0, -0.33, 0.06);
    shoe.castShadow = true;
    leg.add(shoe);

    const soleGeo = new THREE.BoxGeometry(0.135, 0.025, 0.23);
    const soleMat = new THREE.MeshStandardMaterial({ color: 0xe8c9a0 });
    const sole = new THREE.Mesh(soleGeo, soleMat);
    sole.position.set(0, -0.38, 0.06);
    sole.castShadow = true;
    leg.add(sole);
  });

  return { group };
}

// ---------- Themed chapter markers ----------
function createJourneyMarker(color) {
  const group = new THREE.Group();

  const poleGeo = new THREE.CylinderGeometry(0.04, 0.05, 1.1, 8);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x3a2a18 });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.set(0.45, 0.55, 0);
  pole.castShadow = true;
  group.add(pole);

  const signGeo = new THREE.BoxGeometry(0.5, 0.3, 0.05);
  const signMat = new THREE.MeshStandardMaterial({ color });
  const sign = new THREE.Mesh(signGeo, signMat);
  sign.position.set(0.7, 0.95, 0);
  sign.rotation.y = 0.15;
  sign.castShadow = true;
  group.add(sign);

  const avatar = createStandingAvatar();
  avatar.group.position.set(-0.35, 0, 0);
  group.add(avatar.group);

  return group;
}

function createSkillsMarker(color) {
  const group = new THREE.Group();

  const bodyGeo = new THREE.BoxGeometry(0.6, 0.32, 0.35);
  const bodyMat = new THREE.MeshStandardMaterial({ color });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.2;
  body.castShadow = true;
  group.add(body);

  const lidGeo = new THREE.BoxGeometry(0.62, 0.08, 0.37);
  const lidMat = new THREE.MeshStandardMaterial({ color: 0x3a2a18 });
  const lid = new THREE.Mesh(lidGeo, lidMat);
  lid.position.y = 0.4;
  lid.castShadow = true;
  group.add(lid);

  const handleGeo = new THREE.TorusGeometry(0.16, 0.025, 8, 16, Math.PI);
  const handleMat = new THREE.MeshStandardMaterial({ color: 0x3a2a18 });
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.position.y = 0.44;
  handle.rotation.z = Math.PI;
  handle.castShadow = true;
  group.add(handle);

  const latchGeo = new THREE.BoxGeometry(0.08, 0.08, 0.02);
  const latchMat = new THREE.MeshStandardMaterial({ color: 0xe8c9a0 });
  const latch = new THREE.Mesh(latchGeo, latchMat);
  latch.position.set(0, 0.32, 0.185);
  latch.castShadow = true;
  group.add(latch);

  return group;
}

function createProjectsMarker(color) {
  const group = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x3a2a18 });

  const legGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.75, 6);
  const legPositions = [
    { x: 0, z: 0.22, rotZ: 0, rotX: -0.25 },
    { x: -0.22, z: -0.12, rotZ: 0.2, rotX: 0.12 },
    { x: 0.22, z: -0.12, rotZ: -0.2, rotX: 0.12 },
  ];
  legPositions.forEach(({ x, z, rotZ, rotX }) => {
    const leg = new THREE.Mesh(legGeo, woodMat);
    leg.position.set(x, 0.35, z);
    leg.rotation.z = rotZ;
    leg.rotation.x = rotX;
    leg.castShadow = true;
    group.add(leg);
  });

  const ledgeGeo = new THREE.BoxGeometry(0.55, 0.04, 0.06);
  const ledge = new THREE.Mesh(ledgeGeo, woodMat);
  ledge.position.set(0, 0.5, 0.12);
  ledge.castShadow = true;
  group.add(ledge);

  const frameGeo = new THREE.BoxGeometry(0.5, 0.65, 0.04);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xe8c9a0 });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.set(0, 0.85, 0.1);
  frame.rotation.x = -0.15;
  frame.castShadow = true;
  group.add(frame);

  const artGeo = new THREE.PlaneGeometry(0.4, 0.55);
  const artMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.25 });
  const art = new THREE.Mesh(artGeo, artMat);
  art.position.set(0, 0.85, 0.123);
  art.rotation.x = -0.15;
  group.add(art);

  group.scale.set(1.6, 1.6, 1.6);
  return group;
}

function createContactMarker(color) {
  const group = new THREE.Group();

  const envelopeGeo = new THREE.BoxGeometry(0.55, 0.38, 0.04);
  const envelopeMat = new THREE.MeshStandardMaterial({ color: 0xf3e4c8 });
  const envelope = new THREE.Mesh(envelopeGeo, envelopeMat);
  envelope.position.y = 0.5;
  envelope.castShadow = true;
  group.add(envelope);

  const flapGeo = new THREE.ConeGeometry(0.32, 0.22, 4);
  const flapMat = new THREE.MeshStandardMaterial({ color });
  const flap = new THREE.Mesh(flapGeo, flapMat);
  flap.position.set(0, 0.62, 0.02);
  flap.rotation.y = Math.PI / 4;
  flap.rotation.x = Math.PI;
  flap.scale.set(1, 0.5, 0.7);
  flap.castShadow = true;
  group.add(flap);

  group.scale.set(1.8, 1.8, 1.8);
  return group;
}

// ---------- Chapter marker placement ----------
export function addChapterMarkers(scene, chapters) {
  const markers = [];
  scene.userData.animated = scene.userData.animated || [];

  chapters.forEach((chapter, index) => {
    let mesh;

    if (chapter.id === 'about') {
      mesh = createAvatar().group;
    } else if (chapter.id === 'experience') {
      mesh = createJourneyMarker(chapter.color);
    } else if (chapter.id === 'skills') {
      mesh = createSkillsMarker(chapter.color);
    } else if (chapter.id === 'projects') {
      mesh = createProjectsMarker(chapter.color);
    } else if (chapter.id === 'contact') {
      mesh = createContactMarker(chapter.color);
    } else {
      const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
      const material = new THREE.MeshStandardMaterial({ color: chapter.color });
      mesh = new THREE.Mesh(geometry, material);
    }

    if (chapter.id !== 'contact' && chapter.id !== 'experience') {
      mesh.userData.spin = 0.0015;
      scene.userData.animated.push(mesh);
    }

    mesh.position.set(chapter.lookAt.x, chapter.lookAt.y, chapter.lookAt.z);
    mesh.traverse((child) => {
      child.userData.chapterIndex = index;
    });
    scene.add(mesh);
    markers.push(mesh);
  });

  return markers;
}

// ---------- Click-to-navigate on the 3D markers themselves ----------
export function setupMarkerInteraction(camera, renderer, markers, onMarkerClick) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function getHoveredIndex(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(markers, true);
    return intersects.length > 0 ? intersects[0].object.userData.chapterIndex : undefined;
  }

  renderer.domElement.addEventListener('click', (event) => {
    const index = getHoveredIndex(event);
    if (index !== undefined) onMarkerClick(index);
  });

  renderer.domElement.addEventListener('mousemove', (event) => {
    const index = getHoveredIndex(event);
    renderer.domElement.style.cursor = index !== undefined ? 'pointer' : 'default';
  });
}
