import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

(() => {
  const sourceCanvas = document.querySelector('.hero-pin .world');
  const heroPin = document.querySelector('.hero-pin');
  if (!sourceCanvas || !heroPin) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = () => window.matchMedia('(max-width: 700px)').matches;

  const stage = document.createElement('div');
  stage.className = 'daf-webgl-stage';
  sourceCanvas.replaceWith(stage);

  if (reduceMotion || !window.WebGLRenderingContext) {
    stage.classList.add('is-fallback');
    return;
  }

  const hud = document.createElement('div');
  hud.className = 'daf-webgl-hud';
  hud.innerHTML = '<div class="hud-top"><i class="hud-dot"></i><span class="hud-state">RECEIVE</span></div><div class="hud-bottom"><div>CASE / DAF-001</div><div class="hud-rule"></div><div>SCROLL STATE <span class="hud-value">00%</span></div></div>';
  stage.appendChild(hud);
  const stateEl = hud.querySelector('.hud-state');
  const valueEl = hud.querySelector('.hud-value');

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch (error) {
    stage.classList.add('is-fallback');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile() ? 1.35 : 1.7));
  renderer.setSize(stage.clientWidth, stage.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.88;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x090b09);
  scene.fog = new THREE.FogExp2(0x090b09, mobile() ? 0.045 : 0.032);

  const camera = new THREE.PerspectiveCamera(34, stage.clientWidth / stage.clientHeight, 0.1, 100);
  camera.position.set(0.35, 0.45, 8.8);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.HemisphereLight(0xdfe8df, 0x11130f, 1.15));
  const key = new THREE.DirectionalLight(0xf4f0e4, 3.1);
  key.position.set(-3.5, 5.5, 5.5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fbcae, 1.35);
  rim.position.set(4, 2, -3);
  scene.add(rim);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 22),
    new THREE.MeshStandardMaterial({ color: 0x11140f, roughness: 0.94, metalness: 0 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.08;
  floor.receiveShadow = true;
  scene.add(floor);

  const world = new THREE.Group();
  world.rotation.x = -0.08;
  world.rotation.y = -0.12;
  scene.add(world);

  const coverMat = new THREE.MeshPhysicalMaterial({ color: 0x20231e, roughness: 0.7, metalness: 0.05, clearcoat: 0.12 });
  const cover = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.16, 3.35), coverMat);
  cover.position.set(0, -0.9, 0.15);
  cover.rotation.x = -0.02;
  cover.castShadow = true;
  cover.receiveShadow = true;
  world.add(cover);

  function textureFor(title, code, accent, fields) {
    const c = document.createElement('canvas');
    c.width = 900; c.height = 1260;
    const x = c.getContext('2d');
    x.fillStyle = '#f3f0e7'; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = '#dedbd2';
    for (let i = 0; i < 14000; i++) {
      const px = Math.random() * c.width, py = Math.random() * c.height;
      const a = Math.random() * 0.08;
      x.fillStyle = `rgba(30,32,28,${a})`; x.fillRect(px, py, 1, 1);
    }
    x.fillStyle = '#1a1c18'; x.font = '500 23px monospace'; x.fillText(code, 68, 74);
    x.fillStyle = '#777a73'; x.font = '500 17px monospace'; x.fillText('DOCUMENT / SOURCE RECORD', 68, 106);
    x.strokeStyle = '#c8c4b9'; x.lineWidth = 2; x.beginPath(); x.moveTo(68, 132); x.lineTo(832, 132); x.stroke();
    x.fillStyle = '#171914'; x.font = '600 43px Georgia'; x.fillText(title, 68, 205);
    let y = 290;
    fields.forEach((field, index) => {
      x.fillStyle = '#777970'; x.font = '500 15px monospace'; x.fillText(field[0].toUpperCase(), 68, y);
      x.fillStyle = '#171914'; x.font = '500 24px monospace'; x.fillText(field[1], 68, y + 34);
      if (field[2]) { x.strokeStyle = accent; x.lineWidth = 6; x.beginPath(); x.moveTo(64, y + 47); x.lineTo(440, y + 47); x.stroke(); }
      x.strokeStyle = '#d2cec3'; x.lineWidth = 1; x.beginPath(); x.moveTo(68, y + 66); x.lineTo(832, y + 66); x.stroke();
      y += 135;
    });
    x.fillStyle = '#74776f'; x.font = '500 14px monospace'; x.fillText('CHECKED AGAINST / ATTACHMENT SET 01', 68, 1190);
    x.fillStyle = accent; x.fillRect(750, 1152, 82, 38);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  }

  const docsData = [
    ['IDENTITY', 'DOC 01', '#9a5d53', [['FULL NAME','MUSTAFA RAZA',0],['DATE OF BIRTH','14 / 08 / 1997',0],['PASSPORT NO.','PK7A-392814',1],['NATIONALITY','PAKISTAN',0]]],
    ['APPLICATION', 'DOC 02', '#8f6d43', [['FULL NAME','MUSTAFA RAZA',0],['DATE OF BIRTH','14 / 08 / 1997',0],['PASSPORT NO.','PK7A-392814',0],['CASE TYPE','BUSINESS VISIT',0]]],
    ['INVITATION', 'DOC 03', '#8b5d54', [['APPLICANT','MUSTAFA RAZA',0],['DATE OF BIRTH','13 / 08 / 1997',1],['HOST','NORTHFIELD LTD.',0],['REFERENCE','INV-2041',0]]],
    ['EMPLOYMENT', 'DOC 04', '#6c766b', [['EMPLOYEE','MUSTAFA RAZA',0],['ROLE','OPERATIONS LEAD',0],['JOIN DATE','02 / 11 / 2021',0],['EMPLOYER','NORTHFIELD LTD.',0]]],
    ['BANK RECORD', 'DOC 05', '#716b59', [['ACCOUNT HOLDER','MUSTAFA RAZA',0],['STATEMENT DATE','30 / 06 / 2026',0],['CLOSING BALANCE','PKR 1,842,000',0],['CURRENCY','PKR',0]]],
    ['COVER NOTE', 'DOC 06', '#80625b', [['APPLICANT','MUSTAFA RAZA',0],['TRAVEL WINDOW','18–29 SEP 2026',0],['PURPOSE','CLIENT MEETINGS',0],['STATUS','DRAFT',0]]]
  ];

  const docs = docsData.map((d, i) => {
    const texture = textureFor(d[0], d[1], d[2], d[3]);
    const mat = new THREE.MeshPhysicalMaterial({ map: texture, roughness: 0.86, metalness: 0, clearcoat: 0.02, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.25, 3.15), mat);
    mesh.castShadow = true; mesh.receiveShadow = true;
    mesh.userData.index = i;
    world.add(mesh);
    return mesh;
  });

  const redMat = new THREE.MeshBasicMaterial({ color: 0xb86458, transparent: true, opacity: 0 });
  const greenMat = new THREE.MeshBasicMaterial({ color: 0xb8d2c2, transparent: true, opacity: 0 });
  const conflictLines = [];
  for (let i = 0; i < 3; i++) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.018, 0.018), redMat.clone());
    line.rotation.z = -0.06;
    world.add(line); conflictLines.push(line);
  }
  const verifiedRing = new THREE.Mesh(new THREE.RingGeometry(0.34, 0.365, 48), greenMat);
  verifiedRing.rotation.x = 0;
  world.add(verifiedRing);

  const particleCount = mobile() ? 140 : 260;
  const pgeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - .5) * 15;
    positions[i*3+1] = (Math.random() - .5) * 8;
    positions[i*3+2] = (Math.random() - .5) * 10 - 1;
  }
  pgeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(pgeo, new THREE.PointsMaterial({ color: 0xb8d2c2, size: mobile() ? .012 : .016, transparent: true, opacity: .26 }));
  scene.add(particles);

  const phases = [
    [0, 'RECEIVE'], [0.10, 'OPEN'], [0.25, 'EXTRACT'], [0.40, 'RECONCILE'],
    [0.55, 'CONFLICTS'], [0.68, 'RESOLVE'], [0.82, 'VERIFY'], [0.94, 'PACKAGE'], [1, 'REVIEW-READY']
  ];
  let targetProgress = 0, currentProgress = 0, last = performance.now();

  const clamp01 = v => Math.max(0, Math.min(1, v));
  const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
  function phaseAt(p) {
    let name = phases[0][1];
    for (const phase of phases) if (p >= phase[0]) name = phase[1];
    return name;
  }

  function layout(p) {
    const open = ease(clamp01(p / .16));
    const explode = ease(clamp01((p - .16) / .38));
    const conflict = clamp01((p - .44) / .20);
    const resolve = ease(clamp01((p - .60) / .18));
    const packageIn = ease(clamp01((p - .78) / .22));

    cover.position.y = -0.9 + open * 1.55;
    cover.position.z = 0.15 + open * 0.75;
    cover.rotation.x = -0.02 - open * 0.42;
    cover.rotation.z = open * 0.015;

    docs.forEach((doc, i) => {
      const angle = (i - 2.5) * 0.12;
      const ex = (i - 2.5) * 0.88;
      const ey = Math.sin(i * 1.7) * 0.28;
      const ez = 0.65 + Math.cos(i * 1.2) * 0.45;
      const closedX = (i - 2.5) * 0.075;
      const closedY = -0.68 + i * 0.018;
      const closedZ = 0.38 + i * 0.025;
      const explodedX = ex, explodedY = ey + 0.05, explodedZ = ez + i * 0.13;
      const resolvedX = (i - 2.5) * 0.43, resolvedY = (i % 2 ? 0.08 : -0.04), resolvedZ = 0.7 + i * 0.04;
      const packagedX = (i - 2.5) * 0.075, packagedY = -0.69 + i * 0.018, packagedZ = 0.42 + i * 0.022;
      let x = THREE.MathUtils.lerp(closedX, explodedX, explode);
      let y = THREE.MathUtils.lerp(closedY, explodedY, explode);
      let z = THREE.MathUtils.lerp(closedZ, explodedZ, explode);
      if (resolve > 0) { x = THREE.MathUtils.lerp(x, resolvedX, resolve); y = THREE.MathUtils.lerp(y, resolvedY, resolve); z = THREE.MathUtils.lerp(z, resolvedZ, resolve); }
      if (packageIn > 0) { x = THREE.MathUtils.lerp(x, packagedX, packageIn); y = THREE.MathUtils.lerp(y, packagedY, packageIn); z = THREE.MathUtils.lerp(z, packagedZ, packageIn); }
      doc.position.set(x, y, z);
      doc.rotation.x = -0.03 + Math.sin(i * 2.1) * 0.06 * explode;
      doc.rotation.y = angle * explode + (i - 2.5) * 0.025 * resolve;
      doc.rotation.z = Math.sin(i * 1.4) * 0.035 * explode;
      doc.material.opacity = 1;
    });

    conflictLines.forEach((line, i) => {
      line.material.opacity = conflict * (1 - resolve * .8);
      line.position.set((i - 1) * 1.15, .42 - i*.46, 2.1);
      line.rotation.y = (i - 1) * .1;
    });
    verifiedRing.material.opacity = clamp01((p - .72) / .12) * (1 - packageIn * .35);
    verifiedRing.position.set(0, 0.05, 2.45);
    verifiedRing.scale.setScalar(1 + Math.sin(performance.now() * .004) * .04);

    const cameraZ = THREE.MathUtils.lerp(8.8, 7.1, open) - explode * 0.65 + packageIn * 0.7;
    camera.position.z = cameraZ;
    camera.position.x = THREE.MathUtils.lerp(.35, .75, explode) - resolve * .35;
    camera.position.y = THREE.MathUtils.lerp(.45, .12, explode) + Math.sin(p * Math.PI) * .12;
    camera.lookAt(0, -0.05, .35 + explode * .35);
    world.rotation.y = THREE.MathUtils.lerp(-.12, -.025, resolve);
    particles.rotation.y = p * .12;
  }

  function readScroll() {
    const rect = heroPin.getBoundingClientRect();
    const travel = Math.max(1, heroPin.offsetHeight - window.innerHeight);
    targetProgress = clamp01(-rect.top / travel);
  }

  function resize() {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile() ? 1.35 : 1.7));
    renderer.setSize(stage.clientWidth, stage.clientHeight, false);
    camera.aspect = stage.clientWidth / stage.clientHeight;
    camera.updateProjectionMatrix();
  }

  function render(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    readScroll();
    currentProgress += (targetProgress - currentProgress) * Math.min(1, dt * 8.5);
    layout(currentProgress);
    stateEl.textContent = phaseAt(currentProgress);
    valueEl.textContent = `${String(Math.round(currentProgress * 100)).padStart(2, '0')}%`;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('scroll', readScroll, { passive: true });
  resize(); readScroll(); layout(0); requestAnimationFrame(render);
})();
