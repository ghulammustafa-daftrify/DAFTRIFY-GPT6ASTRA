import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

(() => {
  const hero = document.querySelector('.hero-pin');
  const source = hero?.querySelector('.world');
  if (!hero || !source) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = () => window.matchMedia('(max-width: 760px)').matches;

  const stage = document.createElement('div');
  stage.className = 'daf-webgl-stage daf-v3';
  source.replaceWith(stage);

  if (reduce || !window.WebGLRenderingContext) {
    stage.classList.add('is-fallback');
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch {
    stage.classList.add('is-fallback');
    return;
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080a08);
  scene.fog = new THREE.Fog(0x080a08, 7, 18);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.05, 40);
  scene.add(camera);

  scene.add(new THREE.HemisphereLight(0xe9e4d7, 0x11130f, 1.05));
  const key = new THREE.DirectionalLight(0xfff5df, 3.9);
  key.position.set(-4.5, 7.5, 5.5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 24;
  key.shadow.camera.left = -9;
  key.shadow.camera.right = 9;
  key.shadow.camera.top = 8;
  key.shadow.camera.bottom = -8;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9bb9a8, 1.15);
  rim.position.set(5, 3, -4);
  scene.add(rim);
  const soft = new THREE.PointLight(0xd9e6dc, 0.55, 12);
  soft.position.set(-1, 1.5, 4);
  scene.add(soft);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(28, 20),
    new THREE.MeshStandardMaterial({ color: 0x0e110e, roughness: 0.97, metalness: 0 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.35;
  floor.receiveShadow = true;
  scene.add(floor);

  const world = new THREE.Group();
  scene.add(world);

  const dossier = new THREE.Group();
  dossier.position.set(0.35, -0.12, 0);
  dossier.rotation.set(-0.13, -0.22, 0);
  world.add(dossier);

  function roundedShape(w, h, r) {
    const s = new THREE.Shape();
    const x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }

  const coverMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x20251f,
    roughness: 0.78,
    metalness: 0.03,
    clearcoat: 0.16,
    clearcoatRoughness: 0.75
  });
  const edgeMaterial = new THREE.MeshStandardMaterial({ color: 0x10130f, roughness: 0.92 });

  function makeCover(w, h, depth) {
    const geometry = new THREE.ExtrudeGeometry(roundedShape(w, h, 0.12), {
      depth,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.035,
      bevelThickness: 0.035,
      curveSegments: 6
    });
    geometry.translate(0, 0, -depth / 2);
    return new THREE.Mesh(geometry, coverMaterial);
  }

  const base = makeCover(5.35, 3.95, 0.18);
  base.position.set(0, -0.98, 0.18);
  base.castShadow = base.receiveShadow = true;
  dossier.add(base);

  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.24, 3.7), edgeMaterial);
  spine.position.set(-2.52, -0.83, 0.17);
  spine.castShadow = true;
  dossier.add(spine);

  const lidPivot = new THREE.Group();
  lidPivot.position.set(-2.39, -0.83, 0.18);
  dossier.add(lidPivot);
  const lid = makeCover(5.05, 3.72, 0.15);
  lid.position.set(2.52, 0.01, 0);
  lid.castShadow = lid.receiveShadow = true;
  lidPivot.add(lid);

  const lidInset = new THREE.Mesh(
    new THREE.BoxGeometry(4.5, 0.018, 3.15),
    new THREE.MeshStandardMaterial({ color: 0x171a16, roughness: 0.95 })
  );
  lidInset.position.set(2.52, 0.085, 0);
  lidPivot.add(lidInset);

  // A restrained metal closure gives the dossier a physical focal detail.
  const clasp = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.06, 0.62),
    new THREE.MeshPhysicalMaterial({ color: 0x8b9188, roughness: 0.32, metalness: 0.72 })
  );
  clasp.position.set(2.0, -0.87, 0.19);
  clasp.castShadow = true;
  dossier.add(clasp);

  function rng(seed) {
    let s = seed >>> 0;
    return () => ((s = Math.imul(1664525, s) + 1013904223) >>> 0) / 4294967296;
  }

  function paperTexture(title, code, fields, accent, seed) {
    const c = document.createElement('canvas');
    c.width = 900; c.height = 1160;
    const g = c.getContext('2d');
    const r = rng(seed);
    g.fillStyle = '#f4f0e6';
    g.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < 8500; i++) {
      const a = 0.008 + r() * 0.028;
      g.fillStyle = `rgba(30,32,28,${a})`;
      g.fillRect(r() * c.width, r() * c.height, 1 + r() * 1.5, 1 + r() * 1.5);
    }
    g.fillStyle = '#6f746d';
    g.font = '500 15px monospace';
    g.fillText('SIMULATED DEMONSTRATION', 60, 52);
    g.fillStyle = '#171914';
    g.font = '500 22px monospace';
    g.fillText(code, 60, 88);
    g.strokeStyle = '#c9c4b8';
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(60, 116); g.lineTo(840, 116); g.stroke();
    g.fillStyle = '#151713';
    g.font = '600 42px Georgia';
    g.fillText(title, 60, 184);
    let y = 265;
    fields.forEach(([label, value, conflict]) => {
      g.fillStyle = '#777b73';
      g.font = '500 14px monospace';
      g.fillText(label, 60, y);
      g.fillStyle = '#171914';
      g.font = '500 23px monospace';
      g.fillText(value, 60, y + 32);
      if (conflict) {
        g.strokeStyle = accent;
        g.lineWidth = 5;
        g.beginPath(); g.moveTo(57, y + 45); g.lineTo(490, y + 45); g.stroke();
      }
      g.strokeStyle = '#d1ccc0';
      g.lineWidth = 1;
      g.beginPath(); g.moveTo(60, y + 65); g.lineTo(840, y + 65); g.stroke();
      y += 124;
    });
    g.fillStyle = accent;
    g.fillRect(700, 1030, 140, 34);
    g.fillStyle = '#f4f0e6';
    g.font = '600 12px monospace';
    g.fillText(conflictCount(fields) ? 'REVIEW' : 'SOURCE', 718, 1052);
    g.fillStyle = '#74786f';
    g.font = '500 12px monospace';
    g.fillText('SOURCE SET / DEMO-07', 60, 1080);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    return tex;
  }

  function conflictCount(fields) { return fields.some(f => f[2]); }

  const records = [
    ['IDENTITY RECORD', 'SOURCE 01', [['FULL NAME','MUSTAFA RAZA',0],['DATE OF BIRTH','14 / 08 / 1997',0],['REFERENCE ID','DEMO-392814',0],['NATIONALITY','PAKISTAN',0]], '#66766a', 12],
    ['APPLICATION FORM', 'SOURCE 02', [['FULL NAME','MUSTAFA RAZA',0],['DATE OF BIRTH','14 / 08 / 1997',0],['REFERENCE ID','DEMO-392814',0],['PURPOSE','BUSINESS VISIT',0]], '#6b776d', 23],
    ['INVITATION', 'SOURCE 03', [['APPLICANT','MUSTAFA RAZA',0],['DATE OF BIRTH','13 / 08 / 1997',1],['HOST','NORTHFIELD LTD.',0],['REFERENCE','DEMO-2041',0]], '#9a3a31', 34],
    ['EMPLOYMENT RECORD', 'SOURCE 04', [['EMPLOYEE','MUSTAFA RAZA',0],['ROLE','OPERATIONS LEAD',0],['JOIN DATE','02 / 11 / 2021',0],['EMPLOYER','NORTHFIELD LTD.',0]], '#66766a', 45],
    ['FINANCIAL RECORD', 'SOURCE 05', [['ACCOUNT HOLDER','MUSTAFA RAZA',0],['STATEMENT DATE','30 / 06 / 2026',0],['CLOSING BALANCE','PKR 1,842,000',1],['CURRENCY','PKR',0]], '#9a3a31', 56],
    ['COVER NOTE', 'SOURCE 06', [['APPLICANT','MUSTAFA RAZA',0],['TRAVEL WINDOW','18–29 SEP 2026',0],['PURPOSE','CLIENT MEETINGS',0],['STATUS','DRAFT',0]], '#66766a', 67]
  ];

  const paperGroup = new THREE.Group();
  dossier.add(paperGroup);
  const docs = records.map((record, i) => {
    const texture = paperTexture(record[0], record[1], record[2], record[4], record[5]);
    const material = new THREE.MeshPhysicalMaterial({
      map: texture,
      roughness: 0.94,
      metalness: 0,
      clearcoat: 0.025,
      clearcoatRoughness: 0.9,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(2.78, 3.58, 0.045), material);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.userData.index = i;
    paperGroup.add(mesh);
    return mesh;
  });

  // Paper tabs stay attached to their sheets, making separation readable.
  const tabMaterial = new THREE.MeshPhysicalMaterial({ color: 0x5d6d61, roughness: 0.78 });
  docs.forEach((doc, i) => {
    const tab = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.19, 0.055), tabMaterial);
    tab.position.set(-0.82 + (i % 3) * 0.82, 1.82, 0.026);
    doc.add(tab);
  });

  const red = new THREE.MeshBasicMaterial({ color: 0xb04338, transparent: true, opacity: 0 });
  const green = new THREE.MeshBasicMaterial({ color: 0x86aa98, transparent: true, opacity: 0 });
  const annotationGroup = new THREE.Group();
  dossier.add(annotationGroup);

  const conflictMarks = [];
  for (let i = 0; i < 3; i++) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.022, 0.022), red.clone());
    line.position.set(0.15, 0.54 - i * 0.52, 1.78);
    line.rotation.z = -0.08;
    annotationGroup.add(line);
    conflictMarks.push(line);
  }

  const connectorMaterial = new THREE.LineBasicMaterial({ color: 0x9ab9a8, transparent: true, opacity: 0 });
  const connectors = [];
  for (let i = 0; i < 3; i++) {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.05, 0.72 - i * 0.62, 1.72),
      new THREE.Vector3(1.05, 0.08 - i * 0.62, 1.72)
    ]);
    const line = new THREE.Line(geo, connectorMaterial.clone());
    annotationGroup.add(line);
    connectors.push(line);
  }

  const verifyRing = new THREE.Mesh(
    new THREE.RingGeometry(0.34, 0.375, 64),
    green
  );
  verifyRing.position.set(0.1, 0.1, 1.86);
  annotationGroup.add(verifyRing);

  const stamp = new THREE.Group();
  const stampOuter = new THREE.Mesh(
    new THREE.RingGeometry(0.46, 0.5, 48),
    new THREE.MeshBasicMaterial({ color: 0x7ea38f, transparent: true, opacity: 0 })
  );
  const stampInner = new THREE.Mesh(
    new THREE.RingGeometry(0.23, 0.26, 48),
    new THREE.MeshBasicMaterial({ color: 0x7ea38f, transparent: true, opacity: 0 })
  );
  stamp.add(stampOuter, stampInner);
  stamp.position.set(0.95, 0.12, 1.92);
  dossier.add(stamp);

  const state = document.createElement('div');
  state.className = 'daf-v3-state';
  state.innerHTML = '<span class="state-kicker">CASE / INTAKE</span><strong>RECEIVED</strong><span class="state-meta">DOCUMENT SET / 06</span>';
  stage.appendChild(state);

  const progressRail = document.createElement('div');
  progressRail.className = 'daf-v3-rail';
  progressRail.innerHTML = '<span class="rail-fill"></span><span class="rail-label">SCROLL / 00%</span>';
  stage.appendChild(progressRail);

  const states = [
    [0.00, 'RECEIVED', 'CASE / INTAKE', 'DOCUMENT SET / 06'],
    [0.10, 'UNSEAL', 'CASE / OPEN', 'COVER RELEASED'],
    [0.24, 'REVEAL', 'CASE / EXTRACT', 'SOURCE SHEETS'],
    [0.40, 'SEPARATE', 'CASE / EXTRACT', 'SHEETS IN VIEW'],
    [0.55, 'COMPARE', 'CASE / RECONCILE', 'SOURCE MATCH'],
    [0.66, 'CONFLICT', 'CASE / EXCEPTIONS', '2 EXCEPTIONS'],
    [0.78, 'VERIFY', 'CASE / HUMAN VERIFY', 'REVIEW REQUIRED'],
    [0.90, 'RESOLVE', 'CASE / HUMAN VERIFY', 'SOURCE CONFIRMED'],
    [1.00, 'PACKAGE', 'CASE / FINAL', 'REVIEW-READY']
  ];

  let target = 0;
  let current = 0;
  let pointerX = 0;
  let pointerY = 0;
  let visible = true;
  let lastTime = performance.now();

  const clamp = n => Math.max(0, Math.min(1, n));
  const smooth = n => n * n * (3 - 2 * n);
  const ease = n => n < 0.5 ? 4 * n * n * n : 1 - Math.pow(-2 * n + 2, 3) / 2;
  const lerp = (a, b, t) => a + (b - a) * t;
  const segment = (p, a, b) => smooth(clamp((p - a) / (b - a)));

  function scrollProgress() {
    const rect = hero.getBoundingClientRect();
    target = clamp(-rect.top / Math.max(1, hero.offsetHeight - innerHeight));
  }

  function poseDoc(doc, i, p) {
    const closed = { x: (i - 2.5) * 0.055, y: -0.67 + i * 0.014, z: 0.38 + i * 0.018 };
    const revealed = { x: (i - 2.5) * 0.13, y: -0.45 + i * 0.055, z: 0.72 + i * 0.035 };
    const separated = { x: (i - 2.5) * 0.82, y: (i % 2 ? 0.12 : -0.08) + Math.sin(i * 1.4) * 0.10, z: 1.02 + Math.cos(i * 1.2) * 0.13 };
    const compare = i < 3
      ? { x: -1.18, y: 0.48 - i * 0.73, z: 1.34 }
      : { x: 1.18, y: 0.48 - (i - 3) * 0.73, z: 1.34 };
    const resolved = { x: (i - 2.5) * 0.42, y: (i % 2 ? 0.04 : -0.04), z: 0.74 + i * 0.025 };

    const open = ease(segment(p, 0.06, 0.18));
    const reveal = ease(segment(p, 0.15, 0.30));
    const separate = ease(segment(p, 0.28, 0.47));
    const compareT = ease(segment(p, 0.46, 0.62));
    const resolveT = ease(segment(p, 0.73, 0.88));
    const pack = ease(segment(p, 0.88, 1.0));

    let x = lerp(closed.x, revealed.x, reveal);
    let y = lerp(closed.y, revealed.y, reveal);
    let z = lerp(closed.z, revealed.z, reveal);
    x = lerp(x, separated.x, separate);
    y = lerp(y, separated.y, separate);
    z = lerp(z, separated.z, separate);
    x = lerp(x, compare.x, compareT);
    y = lerp(y, compare.y, compareT);
    z = lerp(z, compare.z, compareT);
    x = lerp(x, resolved.x, resolveT);
    y = lerp(y, resolved.y, resolveT);
    z = lerp(z, resolved.z, resolveT);
    x = lerp(x, closed.x, pack);
    y = lerp(y, closed.y, pack);
    z = lerp(z, closed.z, pack);

    doc.position.set(x, y, z);
    const tilt = separate * 0.05 + compareT * 0.025;
    doc.rotation.set(-0.025 + Math.sin(i * 2.2) * tilt, (i - 2.5) * 0.035 * separate, Math.sin(i * 1.7) * 0.055 * separate);
    doc.scale.setScalar(1 + Math.sin(separate * Math.PI) * 0.012);
  }

  function layout(p, now) {
    const open = ease(segment(p, 0.06, 0.18));
    const compareT = ease(segment(p, 0.46, 0.62));
    const resolveT = ease(segment(p, 0.73, 0.88));
    const pack = ease(segment(p, 0.88, 1));

    // The lid opens around the spine instead of translating like a flat card.
    lidPivot.rotation.x = -open * 0.78;
    lidPivot.rotation.z = -open * 0.025;
    lidPivot.position.y = -0.83 + open * 1.28;
    lidPivot.position.z = 0.18 + open * 0.22;
    clasp.position.y = -0.87 + open * 0.08;
    clasp.position.z = 0.19 + open * 0.32;

    docs.forEach((doc, i) => poseDoc(doc, i, p));

    const conflict = segment(p, 0.58, 0.70) * (1 - resolveT);
    conflictMarks.forEach((mark, i) => {
      mark.material.opacity = conflict;
      mark.position.x = (i - 1) * 0.66;
      mark.scale.x = 0.75 + conflict * 0.45;
    });

    connectors.forEach((line, i) => {
      line.material.opacity = segment(p, 0.39, 0.56) * (1 - compareT * 0.75);
    });

    const verified = segment(p, 0.75, 0.84);
    verifyRing.material.opacity = verified * (1 - pack * 0.8);
    verifyRing.scale.setScalar(1 + Math.sin(now * 0.004) * 0.035);
    stampOuter.material.opacity = verified * (1 - pack * 0.7);
    stampInner.material.opacity = verified * (1 - pack * 0.7);
    stamp.rotation.z = -0.12 + verified * 0.18;
    stamp.scale.setScalar(0.82 + verified * 0.22);

    // Cinematic camera: close inspection -> reveal -> side-by-side comparison -> return.
    const m = isMobile();
    const start = m ? { x: 3.2, y: 1.25, z: 8.8 } : { x: 4.5, y: 1.55, z: 8.25 };
    const revealCam = m ? { x: 2.45, y: 0.75, z: 7.3 } : { x: 3.25, y: 0.78, z: 6.55 };
    const compareCam = m ? { x: 1.05, y: 0.22, z: 6.3 } : { x: 1.35, y: 0.18, z: 5.65 };
    const finalCam = m ? { x: 2.65, y: 1.15, z: 7.9 } : { x: 3.7, y: 1.35, z: 7.45 };

    let cam = { ...start };
    const r = ease(segment(p, 0.10, 0.35));
    cam.x = lerp(start.x, revealCam.x, r);
    cam.y = lerp(start.y, revealCam.y, r);
    cam.z = lerp(start.z, revealCam.z, r);
    const c = ease(segment(p, 0.42, 0.66));
    cam.x = lerp(cam.x, compareCam.x, c);
    cam.y = lerp(cam.y, compareCam.y, c);
    cam.z = lerp(cam.z, compareCam.z, c);
    const f = ease(segment(p, 0.82, 1));
    cam.x = lerp(cam.x, finalCam.x, f);
    cam.y = lerp(cam.y, finalCam.y, f);
    cam.z = lerp(cam.z, finalCam.z, f);

    const pointerInfluence = (1 - pack) * 0.06;
    camera.position.set(
      cam.x + pointerX * pointerInfluence,
      cam.y + pointerY * pointerInfluence,
      cam.z
    );
    const lookX = lerp(0.05, 0.2, c) + pointerX * 0.025;
    const lookY = lerp(-0.38, -0.05, c) + pointerY * 0.02;
    camera.lookAt(lookX, lookY, 0.42 + open * 0.15);

    dossier.rotation.y = lerp(-0.22, -0.07, c) + pointerX * 0.012;
    dossier.rotation.x = lerp(-0.13, -0.025, c) - pointerY * 0.01;
    world.position.x = lerp(0.32, 0.55, c);
  }

  function updateState(p) {
    let active = states[0];
    for (const item of states) if (p >= item[0]) active = item;
    state.querySelector('.state-kicker').textContent = active[2];
    state.querySelector('strong').textContent = active[1];
    state.querySelector('.state-meta').textContent = active[3];
    const fill = progressRail.querySelector('.rail-fill');
    const label = progressRail.querySelector('.rail-label');
    fill.style.transform = `scaleX(${p})`;
    label.textContent = `SCROLL / ${String(Math.round(p * 100)).padStart(2, '0')}%`;
  }

  function resize() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile() ? 1.25 : 1.6));
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
  }

  function tick(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    current += (target - current) * (1 - Math.pow(0.0005, dt));
    layout(current, now);
    updateState(current);
    if (visible) renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.01 });
  observer.observe(hero);
  window.addEventListener('scroll', scrollProgress, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', e => {
    pointerX = (e.clientX / Math.max(1, innerWidth) - 0.5) * 2;
    pointerY = (e.clientY / Math.max(1, innerHeight) - 0.5) * -2;
  }, { passive: true });

  resize();
  scrollProgress();
  layout(0, performance.now());
  requestAnimationFrame(tick);
})();