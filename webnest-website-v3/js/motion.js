'use strict';
/* ═══════════════════════════════════════════════════════════
   WEBNEST — MOTION ENGINE
   Lenis + GSAP ScrollTrigger choreography. Every page loads
   this after the CDN bundles; everything feature-detects and
   degrades to static content without them.
   ═══════════════════════════════════════════════════════════ */

const REDUCED = matchMedia('(prefers-reduced-motion:reduce)').matches;
const TOUCH   = matchMedia('(pointer:coarse)').matches;
const HAS_GSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

if (REDUCED || !HAS_GSAP) document.documentElement.classList.add('no-motion');
if (HAS_GSAP) gsap.registerPlugin(ScrollTrigger);

/* ── LENIS ─────────────────────────────────────────────────── */
let lenis = null;
if (!REDUCED && HAS_GSAP && typeof Lenis !== 'undefined') {
  lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ── TEXT SPLITTER ─────────────────────────────────────────── */
/* <el data-split="words|chars"> → wraps units in .w > i for masked stagger */
function split(el) {
  const mode = el.dataset.split || 'words';
  const walk = node => {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === 3 && child.textContent.trim()) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(word => {
          if (!word.trim()) { frag.append(word); return; }
          const w = document.createElement('span'); w.className = 'w';
          if (mode === 'chars') {
            [...word].forEach(ch => {
              const i = document.createElement('i'); i.textContent = ch; w.append(i);
            });
          } else {
            const i = document.createElement('i'); i.textContent = word; w.append(i);
          }
          frag.append(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1) walk(child);
    });
  };
  walk(el);
  return el.querySelectorAll('.w > i');
}

/* ── SCROLL CHOREOGRAPHY ───────────────────────────────────── */
if (!REDUCED && HAS_GSAP) {

  // Masked text reveals
  document.querySelectorAll('[data-split]').forEach(el => {
    const units = split(el);
    el.classList.add('split-ready');
    gsap.to(units, {
      y: 0, duration: 1.1, ease: 'power4.out',
      stagger: el.dataset.split === 'chars' ? .022 : .05,
      delay: parseFloat(el.dataset.delay) || 0,
      scrollTrigger: el.closest('.hero, .page-hero, .contact-split') ? null : { trigger: el, start: 'top 85%' },
    });
  });

  // Clip-path unmask
  document.querySelectorAll('[data-unmask]').forEach(el => {
    const dir = el.dataset.unmask || 'up';
    const from = { up:'inset(100% 0 0 0)', down:'inset(0 0 100% 0)', left:'inset(0 100% 0 0)', right:'inset(0 0 0 100%)' }[dir];
    gsap.fromTo(el, { clipPath: from }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power4.inOut',
      scrollTrigger: { trigger: el, start: 'top 82%' },
    });
  });

  // Staggered children
  document.querySelectorAll('[data-stagger]').forEach(wrap => {
    gsap.fromTo(wrap.children, { y: 48, autoAlpha: 0 }, {
      y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out', stagger: .09,
      scrollTrigger: { trigger: wrap, start: 'top 80%' },
    });
  });

  // Parallax
  document.querySelectorAll('[data-speed]').forEach(el => {
    const sp = parseFloat(el.dataset.speed) || 1;
    gsap.fromTo(el, { y: (1 - sp) * -110 }, { y: (1 - sp) * 110, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // Panel wipe: hero pins in place for exactly its own height while
  // "The Studio" section (next in flow, no pinSpacing) slides up over it.
  const wipeFrom = document.querySelector('.hero');
  const wipeTo = document.querySelector('.studio-wipe');
  if (wipeFrom && wipeTo) {
    ScrollTrigger.create({
      trigger: wipeFrom, start: 'top top', end: 'bottom top',
      pin: true, pinSpacing: false, anticipatePin: 1,
    });
  }

  // Horizontal process scroller (homepage)
  const procTrack = document.querySelector('.proc-track');
  const proc = document.querySelector('.process');
  if (procTrack && proc && matchMedia('(min-width:900px)').matches) {
    const dist = () => procTrack.scrollWidth - innerWidth;
    const scroller = gsap.to(procTrack, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: proc, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: true, invalidateOnRefresh: true, anticipatePin: 1 },
    });
    gsap.to('.proc-progress b', { scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: proc, start: 'top top', end: () => '+=' + dist(), scrub: true } });
    procTrack.querySelectorAll('.proc-card').forEach(card => {
      gsap.from(card.querySelectorAll('.pc-in'), {
        y: 56, autoAlpha: 0, stagger: .09, duration: .85, ease: 'power3.out',
        scrollTrigger: { trigger: card, containerAnimation: scroller, start: 'left 78%' } });
      const g = card.querySelector('.pc-ghost');
      if (g) gsap.fromTo(g, { xPercent: 26 }, { xPercent: -14, ease: 'none',
        scrollTrigger: { trigger: card, containerAnimation: scroller, start: 'left right', end: 'right left', scrub: true } });
      const bar = card.querySelector('.pc-bar');
      if (bar) gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'power2.out',
        scrollTrigger: { trigger: card, containerAnimation: scroller, start: 'left 70%' } });
    });
  } else if (procTrack) {
    gsap.from(procTrack.children, { y: 48, autoAlpha: 0, stagger: .12, duration: .9, ease: 'power3.out',
      scrollTrigger: { trigger: procTrack, start: 'top 85%' } });
  }

  // Nav: hide scrolling down, return scrolling up
  const nav = document.querySelector('.nav');
  if (nav) ScrollTrigger.create({
    start: 'top -120', onUpdate(self) { nav.classList.toggle('hidden', self.direction === 1 && !document.body.classList.contains('menu-open')); },
  });
}

/* ── MENU OVERLAY ──────────────────────────────────────────── */
const menu = document.querySelector('.menu');
const burger = document.querySelector('.nav-burger');
if (menu && burger && HAS_GSAP) {
  const layers = menu.querySelectorAll('.menu-layer');
  const links  = menu.querySelectorAll('.menu-link, .menu-foot a');
  const tl = gsap.timeline({ paused: true })
    .set(menu, { visibility: 'visible' })
    .to(layers, { yPercent: 101, duration: .75, ease: 'power4.inOut', stagger: .09 })
    .fromTo(links, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: .6, ease: 'power3.out', stagger: .05 }, '-=.35');
  let open = false;
  burger.addEventListener('click', () => {
    open = !open;
    burger.setAttribute('aria-expanded', open);
    document.body.classList.toggle('menu-open', open);
    if (open) { tl.timeScale(1).play(); lenis && lenis.stop(); }
    else      { tl.timeScale(1.6).reverse(); lenis && lenis.start(); }
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    open = false; document.body.classList.remove('menu-open'); tl.timeScale(1.6).reverse(); lenis && lenis.start();
  }));
  addEventListener('keydown', e => { if (e.key === 'Escape' && open) burger.click(); });
} else if (menu && burger) {
  burger.addEventListener('click', () => {
    const on = menu.style.visibility === 'visible';
    menu.style.visibility = on ? 'hidden' : 'visible';
    menu.querySelectorAll('.menu-layer').forEach(l => l.style.transform = on ? '' : 'translateY(0)');
    document.body.classList.toggle('menu-open', !on);
  });
}

/* ── BLOB CTA path morph ───────────────────────────────────── */
const BLOB_A = 'M30,8 C55,2 145,2 170,8 C196,14 198,42 192,52 C184,64 26,66 12,52 C2,42 6,13 30,8 Z';
const BLOB_B = 'M22,12 C50,-2 150,6 178,4 C198,8 194,48 186,56 C170,68 40,60 16,58 C-2,52 0,20 22,12 Z';
document.querySelectorAll('.blob-cta').forEach(cta => {
  const outline = cta.querySelector('.blob-line');
  if (!outline || !HAS_GSAP || REDUCED) return;
  cta.addEventListener('mouseenter', () => gsap.to(outline, { attr: { d: BLOB_B }, duration: .6, ease: 'power2.out' }));
  cta.addEventListener('mouseleave', () => gsap.to(outline, { attr: { d: BLOB_A }, duration: .8, ease: 'elastic.out(1,.6)' }));
});

/* ── MAGNETIC PHYSICS ──────────────────────────────────────── */
if (!REDUCED && !TOUCH) {
  document.querySelectorAll('[data-magnetic], .blob-cta, .nav-burger').forEach(el => {
    const strength = parseFloat(el.dataset.magneticStrength) || .35;
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      el.style.transition = 'transform .12s linear';
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * strength}px, ${(e.clientY - r.top - r.height / 2) * strength}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform .6s cubic-bezier(0.175,0.885,0.32,1.4)';
      el.style.transform = '';
    });
  });
}

/* ── CHROME: year, FAQ, WhatsApp float ─────────────────────── */
document.querySelectorAll('.yr').forEach(el => el.textContent = new Date().getFullYear());

// Nav backdrop once content scrolls beneath it (guarantees contrast
// over blue/carbon panels). Plain scroll listener — works without GSAP.
const navChrome = document.querySelector('.nav');
if (navChrome) {
  const navBg = () => navChrome.classList.toggle('scrolled', scrollY > 90);
  addEventListener('scroll', navBg, { passive: true });
  navBg();
}

document.querySelectorAll('.faq-item').forEach(det => {
  const body = det.querySelector('p');
  if (!body) return;
  body.style.cssText = 'overflow:hidden;max-height:0;opacity:0;transition:max-height .5s cubic-bezier(0.19,1,0.22,1),opacity .35s';
  det.removeAttribute('open');
  det.querySelector('summary').addEventListener('click', e => {
    e.preventDefault();
    const isOpen = det.hasAttribute('open');
    document.querySelectorAll('.faq-item[open]').forEach(d => {
      if (d === det) return;
      const b = d.querySelector('p');
      if (b) { b.style.maxHeight = '0'; b.style.opacity = '0'; }
      setTimeout(() => d.removeAttribute('open'), 500);
    });
    if (isOpen) {
      body.style.maxHeight = '0'; body.style.opacity = '0';
      setTimeout(() => det.removeAttribute('open'), 500);
    } else {
      det.setAttribute('open', '');
      body.style.maxHeight = body.scrollHeight + 40 + 'px'; body.style.opacity = '1';
    }
  });
});

const wa = document.querySelector('.wa-float');
if (wa) addEventListener('scroll', () => wa.classList.toggle('visible', scrollY > 400), { passive: true });
