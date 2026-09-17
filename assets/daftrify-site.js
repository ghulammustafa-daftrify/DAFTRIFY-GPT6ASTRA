(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.hero');
  const top = document.getElementById('top');
  const fill = document.getElementById('phaseFill');
  const percent = document.getElementById('phasePct');
  const phases = [...document.querySelectorAll('.phase')];
  const reveals = [...document.querySelectorAll('.reveal')];
  const words = [...document.querySelectorAll('.hero-left .word')];
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const links = [...document.querySelectorAll('.top nav a')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  words.forEach((el, i) => setTimeout(() => el.classList.add('in'), 180 + i * 75));

  if (reduced) {
    reveals.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }), { threshold: .12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => io.observe(el));
  }

  function updateNav() {
    top?.classList.toggle('scrolled', window.scrollY > 20);
  }

  function updateHeroProgress() {
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, -rect.top / Math.max(1, hero.offsetHeight - innerHeight)));
    if (fill) fill.style.width = `${(p * 100).toFixed(1)}%`;
    if (percent) percent.textContent = `${String(Math.round(p * 100)).padStart(2, '0')}%`;
    const index = Math.min(phases.length - 1, Math.floor(p * phases.length));
    phases.forEach((phase, i) => {
      phase.classList.toggle('active', i <= index);
      phase.style.opacity = i <= index ? '1' : '.42';
    });
  }

  updateNav();
  updateHeroProgress();
  window.addEventListener('scroll', () => { updateNav(); updateHeroProgress(); }, { passive: true });
  window.addEventListener('resize', updateHeroProgress);

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.textContent = open ? '×' : '☰';
    });
    mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.textContent = '☰';
    }));
  }

  if (sections.length) {
    const activeIO = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    }), { rootMargin: '-45% 0px -45% 0px' });
    sections.forEach(section => activeIO.observe(section));
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
