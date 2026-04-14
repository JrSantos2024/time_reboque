'use strict';

/* ================================================
   NAVBAR – scroll effect + mobile menu
   ================================================ */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('navMenu');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  highlightActiveLink();
}, { passive: true });

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('open');
  document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
});

navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('click', e => {
  if (!navbar.contains(e.target)) closeMenu();
});

function closeMenu() {
  hamburger.classList.remove('active');
  navMenu.classList.remove('open');
  document.body.style.overflow = '';
}

/* ================================================
   ACTIVE NAV LINK ON SCROLL
   ================================================ */
const sections    = document.querySelectorAll('section[id]');
const navLinks    = document.querySelectorAll('.nav-link');

function highlightActiveLink() {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

/* ================================================
   SCROLL REVEAL
   ================================================ */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('[data-reveal]').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 3) * 0.11}s`;
  revealObserver.observe(el);
});

/* ================================================
   GALLERY LIGHTBOX
   ================================================ */
const IMAGES = [
  "img/WhatsApp Image 2025-06-11 at 09.30.46.jpeg",
  "img/WhatsApp Image 2025-09-16 at 16.51.50 (1).jpeg",
  "img/WhatsApp Image 2025-09-16 at 17.02.43 (1).jpeg",
  "img/WhatsApp Image 2025-09-17 at 15.55.08 (1).jpeg",
  "img/WhatsApp Image 2025-09-22 at 12.21.43.jpeg",
  "img/WhatsApp Image 2025-09-22 at 14.23.27 (1).jpeg",
  "img/WhatsApp Image 2025-09-22 at 14.23.27.jpeg",
  "img/WhatsApp Image 2026-04-06 at 10.08.15 (1).jpeg",
  "img/WhatsApp Image 2026-04-06 at 10.08.15 (2).jpeg",
  "img/WhatsApp Image 2026-04-06 at 10.08.15.jpeg",
  "img/WhatsApp Image 2026-04-06 at 11.11.04 (1).jpeg",
  "img/WhatsApp Image 2026-04-06 at 11.11.04.jpeg"
];

const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lbImg');
const lbCount  = document.getElementById('lbCount');
const lbBg     = document.getElementById('lbBg');
const lbClose  = document.getElementById('lbClose');
const lbPrev   = document.getElementById('lbPrev');
const lbNext   = document.getElementById('lbNext');

let currentIdx = 0;

document.querySelectorAll('.gal-item').forEach(item => {
  item.addEventListener('click', () => openLb(parseInt(item.dataset.index)));
});

lbBg.addEventListener('click', closeLb);
lbClose.addEventListener('click', closeLb);
lbPrev.addEventListener('click', e => { e.stopPropagation(); shiftLb(-1); });
lbNext.addEventListener('click', e => { e.stopPropagation(); shiftLb(1); });

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLb();
  if (e.key === 'ArrowLeft')   shiftLb(-1);
  if (e.key === 'ArrowRight')  shiftLb(1);
});

function openLb(idx) {
  currentIdx = idx;
  lbImg.src = IMAGES[idx];
  updateCount();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLb() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function shiftLb(dir) {
  currentIdx = (currentIdx + dir + IMAGES.length) % IMAGES.length;
  lbImg.style.opacity = '0';
  setTimeout(() => {
    lbImg.src = IMAGES[currentIdx];
    lbImg.style.opacity = '1';
    updateCount();
  }, 140);
}

function updateCount() {
  lbCount.textContent = `${currentIdx + 1} / ${IMAGES.length}`;
}

/* preload next/prev for snappy browsing */
lbImg.addEventListener('load', () => {
  const next = IMAGES[(currentIdx + 1) % IMAGES.length];
  const prev = IMAGES[(currentIdx - 1 + IMAGES.length) % IMAGES.length];
  [next, prev].forEach(src => { const img = new Image(); img.src = src; });
});

/* ================================================
   STATS COUNTER
   ================================================ */
const statNums = document.querySelectorAll('.s-num');

const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });

statNums.forEach(el => statsObserver.observe(el));

function animateCount(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const start    = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString('pt-BR');
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString('pt-BR');
  }

  requestAnimationFrame(tick);
}

/* ================================================
   HERO VIDEO SLIDER  – Ken Burns + auto-switch
   ================================================ */
const heroVids = Array.from(document.querySelectorAll('.hero-vid'));
let vidIdx     = 0;
let vidTimer   = null;

function activateVid(idx) {
  heroVids.forEach(v => {
    v.classList.remove('v-active');
    v.pause();
  });
  const vid = heroVids[idx];
  vid.currentTime = 0;
  /* double rAF ensures browser re-renders before re-adding class → restarts animation */
  requestAnimationFrame(() => requestAnimationFrame(() => {
    vid.classList.add('v-active');
    vid.play().catch(() => {});
  }));
}

function nextVid() {
  clearTimeout(vidTimer);
  vidIdx = (vidIdx + 1) % heroVids.length;
  activateVid(vidIdx);
  vidTimer = setTimeout(nextVid, 14000);
}

/* boot – first video starts immediately */
activateVid(0);
vidTimer = setTimeout(nextVid, 14000);

/* switch early when a short video ends */
heroVids.forEach(v => v.addEventListener('ended', () => {
  clearTimeout(vidTimer);
  nextVid();
}));

/* ================================================
   SMOOTH SCROLL for anchor links
   ================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight + 8;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});

/* ================================================
   TOUCH SWIPE on lightbox
   ================================================ */
let touchStartX = 0;

lightbox.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].clientX;
}, { passive: true });

lightbox.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) shiftLb(dx < 0 ? 1 : -1);
}, { passive: true });
