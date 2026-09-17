import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

(() => {
  const hero = document.querySelector('.hero-pin');
  const oldCanvas = hero?.querySelector('.world');
  if (!hero || !oldCanvas) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.matchMedia('(max-width: 760px)').matches;
  const stage = document.createElement('div');
  stage.className = 'daf-webgl-stage daf-v2';
  oldCanvas.replaceWith(stage);
  if (reduce || !window.WebGLRenderingContext) {
    stage.classList.add('is-fallback');
    return;
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0c0a);
  scene.fog = new THREE.Fog(0x0a0c0a, 8, 18);

  const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 40);
  camera.position.set(3.8, 2.6, 9.4);

  const hemi = new THREE.HemisphereLight(0xe9e4d7, 0x11140f, 1.35);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff7e8, 3.6);
  key.position.set(-4.5, 7.5, 5.5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 22;
  key.shadow.camera.left = -8;
  key.shadow.camera.right = 8;
  key.shadow.camera.top = 8;
  key.shadow.camera.bottom = -8;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x9db8aa, 0.75);
  fill.position.set(5, 3, -4);
  scene.add(fill);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(26, 18),
    new THREE.MeshStandardMaterial({ color: 0x11130f, roughness: 0.93 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.18;
  floor.receiveShadow = true;
  scene.add(floor);

  const world = new THREE.Group();
  world.position.set(0.9, -0.15, 0);
  world.rotation.x = -0.07;
  world.rotation.y = -0.13;
  scene.add(world);

  const darkMat = new THREE.MeshPhysicalMaterial({ color: 0x252820, roughness: 0.72, clearcoat: 0.12 });
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0x10120f, roughness: 0.9 });

  const base = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.16, 3.65), darkMat);
  base.position.set(0, -0.93, 0.18);
  base.castShadow = base.receiveShadow = true;
  world.add(base);

  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.23, 3.7), edgeMat);
  spine.position.set(-2.34, -0.79, 0.18);
  spine.castShadow = true;
  world.add(spine);

  const lidPivot = new THREE.Group();
  lidPivot.position.set(-2.18, -0.78, 0.16);
  world.add(lidPivot);
  const lid = new THREE.Mesh(new THREE.BoxGeometry(4.55, 0.12, 3.6), darkMat);
  lid.position.set(2.28, 0.02, 0);
  lid.castShadow = lid.receiveShadow = true;
  lidPivot.add(lid);

  const seam = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.035, 3.45), new THREE.MeshStandardMaterial({ color: 0x6e756b, roughness: 0.85 }));
  seam.position.set(-0.02, 0.085, 0);
  lid.add(seam);

  function rng(seed) {
    let s = seed >>> 0;
    return () => ((s = Math.imul(1664525, s) + 1013904223) >>> 0) / 4294967296;
  }

  function makePaperTexture(title, code, fields, accent, seed) {
    const c = document.createElement('canvas');
    c.width = 900; c.height = 1160;
    const g = c.getContext('2d');
    const r = rng(seed);
    g.fillStyle = '#f5f2e9'; g.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < 11000; i++) {
      const a = 0.012 + r() * 0.035;
      g.fillStyle = `rgba(20,22,18,${a})`;
      g.fillRect(r() * c.width, r() * c.height, 1 + r() * 2, 1 + r() * 2);
    }
    g.fillStyle = '#7a7d75'; g.font = '500 16px monospace'; g.fillText('SIMULATED DEMONSTRATION', 62, 58);
    g.fillStyle = '#191b17'; g.font = '500 22px monospace'; g.fillText(code, 62, 92);
    g.strokeStyle = '#c7c3b8'; g.lineWidth = 2; g.beginPath(); g.moveTo(62, 118); g.lineTo(838, 118); g.stroke();
    g.fillStyle = '#171914'; g.font = '600 44px Georgia'; g.fillText(title, 62, 190);
    let y = 275;
    fields.forEach(([label, value, flag]) => {
      g.fillStyle = '#7b7d76'; g.font = '500 14px monospace'; g.fillText(label, 62, y);
      g.fillStyle = '#171914'; g.font = '500 24px monospace'; g.fillText(value, 62, y + 34);
      if (flag) { g.fillStyle = accent; g.fillRect(58, y + 48, Math.min(500, 25 + value.length * 15), 4); }
      g.strokeStyle = '#d3cfc4'; g.lineWidth = 1; g.beginPath(); g.moveTo(62, y + 66); g.lineTo(838, y + 66); g.stroke();
      y += 125;
    });
    g.fillStyle = accent; g.fillRect(716, 1040, 122, 34);
    g.fillStyle = '#f5f2e9'; g.font = '600 12px monospace'; g.fillText(flagLabel(accent), 733, 1062);
    g.fillStyle = '#74776f'; g.font = '500 12px monospace'; g.fillText('SOURCE SET / DEMO-07', 62, 1080);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    return tex;
  }

  function flagLabel(accent) { return accent === '#9b2f2f' ? 'REVIEW' : 'SOURCE'; }

  const data = [
    ['IDENTITY RECORD', 'SOURCE 01', [['FULL NAME','MUSTAFA RAZA',0],['DATE OF BIRTH','14 / 08 / 1997',0],['REFERENCE ID','DEMO-392814',1],['NATIONALITY','PAKISTAN',0]], '#6d786d', 11],
    ['APPLICATION FORM', 'SOURCE 02', [['FULL NAME','MUSTAFA RAZA',0],['DATE OF BIRTH','14 / 08 / 1997',0],['REFERENCE ID','DEMO-392814',0],['PURPOSE','BUSINESS VISIT',0]], '#68786d', 22],
    ['INVITATION', 'SOURCE 03', [['APPLICANT','MUSTAFA RAZA',0],['DATE OF BIRTH','13 / 08 / 1997',1],['HOST','NORTHFIELD LTD.',0],['REFERENCE','DEMO-2041',0]], '#9b2f2f', 33],
    ['EMPLOYMENT RECORD', 'SOURCE 04', [['EMPLOYEE','MUSTAFA RAZA',0],['ROLE','OPERATIONS LEAD',0],['JOIN DATE','02 / 11 / 2021',0],['EMPLOYER','NORTHFIELD LTD.',0]], '#68786d', 44],
    ['FINANCIAL RECORD', 'SOURCE 05', [['ACCOUNT HOLDER','MUSTAFA RAZA',0],['STATEMENT DATE','30 / 06 / 2026',0],['CLOSING BALANCE','PKR 1,842,000',1],['CURRENCY','PKR',0]], '#9b2f2f', 55],
    ['COVER NOTE', 'SOURCE 06', [['APPLICANT','MUSTAFA RAZA',0],['TRAVEL WINDOW','18–29 SEP 2026',0],['PURPOSE','CLIENT MEETINGS',0],['STATUS','DRAFT',0]], '#68786d', 66]
  ];

  const paperGroup = new THREE.Group();
  world.add(paperGroup);
  const docs = data.map((d, i) => {
    const tex = makePaperTexture(d[0], d[1], d[2], d[4], d[5]);
    const mat = new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.91, clearcoat: 0.03, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(2.65, 3.43, 0.035), mat);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.userData.index = i;
    paperGroup.add(mesh);
    return mesh;
  });

  const tabMat = new THREE.MeshStandardMaterial({ color: 0x69736b, roughness: 0.8 });
  docs.forEach((doc, i) => {
    const tab = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.18, 0.045), tabMat);
    tab.position.set(-0.82 + (i % 3) * 0.82, 1.78, 0.025);
    doc.add(tab);
  });

  const redMat = new THREE.MeshBasicMaterial({ color: 0x9b2f2f, transparent: true, opacity: 0 });
  const greenMat = new THREE.MeshBasicMaterial({ color: 0x315c4a, transparent: true, opacity: 0 });
  const marks = [];
  for (let i = 0; i < 3; i++) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.018, 0.02), redMat.clone());
    line.position.set(-0.1 + i * 0.2, 0.52 - i * 0.52, 1.75);
    line.rotation.z = -0.06;
    world.add(line); marks.push(line);
  }
  const verify = new THREE.Mesh(new THREE.RingGeometry(0.38, 0.405, 64), greenMat);
  verify.position.set(0, 0.15, 1.9);
  world.add(verify);

  const sourceConnector = new THREE.LineBasicMaterial({ color: 0xb8d2c2, transparent: true, opacity: 0 });
  const connectorPts = [];
  for (let i = 0; i < 3; i++) {
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1.2, 0.75 - i * 0.65, 1.82), new THREE.Vector3(1.2, 0.1 - i * 0.65, 1.82)]);
    const line = new THREE.Line(geo, sourceConnector.clone());
    world.add(line); connectorPts.push(line);
  }

  const stateEl = document.createElement('div');
  stateEl.className = 'daf-v2-state';
  stateEl.innerHTML = '<span class="state-kicker">CASE / INTAKE</span><strong>RECEIVED</strong><span class="state-meta">DOCUMENT SET / 06</span>';
  stage.appendChild(stateEl);
  const states = ['RECEIVED','OPEN','SEPARATE','COMPARE','CONFLICT','VERIFY','PACKAGE','REVIEW-READY'];
  const kickers = ['CASE / INTAKE','CASE / OPEN','CASE / EXTRACT','CASE / RECONCILE','CASE / EXCEPTIONS','CASE / HUMAN VERIFY','CASE / PACKAGE','CASE / FINAL'];

  let target = 0;
  let current = 0;
  let lastRender = -1;
  let resizeQueued = false;
  const clamp = n => Math.max(0, Math.min(1, n));
  const ease = n => n < 0.5 ? 4*n*n*n : 1 - Math.pow(-2*n + 2, 3) / 2;
  const lerp = (a,b,t) => a + (b-a)*t;

  function scrollProgress() {
    const rect = hero.getBoundingClientRect();
    target = clamp(-rect.top / Math.max(1, hero.offsetHeight - innerHeight));
  }

  function setDoc(doc, i, p) {
    const closed = { x: (i - 2.5) * 0.045, y: -0.63 + i * 0.014, z: 0.46 + i * 0.018 };
    const open = { x: (i - 2.5) * 0.22, y: -0.48 + i * 0.08, z: 0.62 + i * 0.045 };
    const spread = { x: (i - 2.5) * 0.92, y: (i % 2 ? 0.12 : -0.05) + Math.sin(i * 1.3) * 0.13, z: 0.98 + Math.cos(i * 1.4) * 0.18 };
    const compare = { x: (i - 2.5) * 0.58, y: (i % 2 ? 0.22 : -0.18), z: 1.15 + i * 0.035 };
    const packagePos = closed;
    let a = clamp(p / 0.16), b = clamp((p - 0.14) / 0.34), c = clamp((p - 0.43) / 0.23), d = clamp((p - 0.62) / 0.2), e = clamp((p - 0.8) / 0.2);
    a = ease(a); b = ease(b); c = ease(c); d = ease(d); e = ease(e);
    let x = lerp(closed.x, open.x, a);
    let y = lerp(closed.y, open.y, a);
    let z = lerp(closed.z, open.z, a);
    x = lerp(x, spread.x, b); y = lerp(y, spread.y, b); z = lerp(z, spread.z, b);
    x = lerp(x, compare.x, c); y = lerp(y, compare.y, c); z = lerp(z, compare.z, c);
    x = lerp(x, spread.x * 0.72, d); y = lerp(y, spread.y * 0.65, d); z = lerp(z, 1.02, d);
    x = lerp(x, packagePos.x, e); y = lerp(y, packagePos.y, e); z = lerp(z, packagePos.z, e);
    doc.position.set(x, y, z);
    doc.rotation.set(-0.04 + Math.sin(i * 2.1) * 0.025 * b, (i - 2.5) * 0.035 * b, Math.sin(i * 1.7) * 0.045 * b);
    doc.scale.setScalar(1 + Math.sin(c * Math.PI) * 0.025);
  }

  function layout(p) {
    const open = ease(clamp(p / 0.17));
    const separate = ease(clamp((p - 0.14) / 0.36));
    const compare = ease(clamp((p - 0.42) / 0.2));
    const resolve = ease(clamp((p - 0.62) / 0.18));
    const pack = ease(clamp((p - 0.8) / 0.2));
    lidPivot.rotation.z = -open * 0.08;
    lidPivot.rotation.x = -open * 0.72;
    lidPivot.position.y = -0.78 + open * 1.34;
    lidPivot.position.z = 0.16 + open * 0.25;
    docs.forEach((doc, i) => setDoc(doc, i, p));
    marks.forEach((m, i) => { m.material.opacity = clamp((p - 0.45) / 0.14) * (1 - resolve * 0.85); m.position.x = (i - 1) * 0.8; });
    connectorPts.forEach((line, i) => line.material.opacity = separate * (1 - compare * 0.35) * 0.42);
    verify.material.opacity = clamp((p - 0.69) / 0.1) * (1 - pack * 0.25);
    verify.scale.setScalar(1 + Math.sin(performance.now() * 0.002) * 0.035);

    const cam = isMobile() ? {
      x: lerp(2.9, 1.7, separate), y: lerp(2.35, 1.0, separate), z: lerp(10.8, 8.7, separate)
    } : {
      x: lerp(4.15, 2.1, separate), y: lerp(2.65, 1.1, separate), z: lerp(9.8, 7.0, separate)
    };
    cam.x = lerp(cam.x, 1.25, compare * 0.45);
    cam.y = lerp(cam.y, 0.65, compare * 0.45);
    cam.z = lerp(cam.z, 7.8, compare * 0.45);
    cam.x = lerp(cam.x, 3.0, pack * 0.4);
    cam.y = lerp(cam.y, 2.0, pack * 0.4);
    camera.position.set(cam.x, cam.y, cam.z);
    camera.lookAt(0.15, -0.18 + compare * 0.1, 0.45 + separate * 0.25);
    world.rotation.y = lerp(-0.13, -0.035, compare);
    world.rotation.x = lerp(-0.07, -0.02, compare);

    const stateIndex = Math.min(states.length - 1, Math.floor(p * states.length));
    stateEl.querySelector('strong').textContent = states[stateIndex];
    stateEl.querySelector('.state-kicker').textContent = kickers[stateIndex];
    stateEl.querySelector('.state-meta').textContent = stateIndex >= 5 ? 'HUMAN CHECK / SOURCE MATCH' : `DOCUMENT SET / 06`;
  }

  function resize() {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(() => {
      resizeQueued = false;
      const w = stage.clientWidth, h = stage.clientHeight;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isMobile() ? 1.15 : 1.5));
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
    });
  }

  function tick(now) {
    current += (target - current) * 0.075;
    if (Math.abs(current - lastRender) > 0.00035 || Math.abs(target - current) > 0.00035) {
      layout(current);
      renderer.render(scene, camera);
      lastRender = current;
    }
    requestAnimationFrame(tick);
  }

  addEventListener('scroll', scrollProgress, { passive: true });
  addEventListener('resize', resize, { passive: true });
  scrollProgress();
  resize();
  layout(0);
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
})();
