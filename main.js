'use strict';

const REDUCED = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const TOUCH   = window.matchMedia('(pointer:coarse)').matches;

// ── YEAR ─────────────────────────────────────────────────────────────
document.querySelectorAll('.yr').forEach(el => el.textContent = new Date().getFullYear());

// ── INJECT CHROME ────────────────────────────────────────────────────
// Scroll progress bar
const spBar = document.createElement('div');
spBar.id = 'wn-sp'; spBar.setAttribute('aria-hidden','true');
document.body.prepend(spBar);

// Custom cursor (desktop only)
if (!TOUCH) {
  ['wn-cur','wn-ring'].forEach(id => {
    const el = document.createElement('div');
    el.id = id; el.setAttribute('aria-hidden','true');
    document.body.appendChild(el);
  });
}

// Floating action panel
const floatHTML = `
<div id="wn-float" aria-label="Quick contact">
  <a href="https://wa.me/919876543210?text=Hi%20WebNest!%20I%27d%20like%20to%20discuss%20a%20project."
     class="wn-fab wn-wa" target="_blank" rel="noopener" aria-label="Chat on WhatsApp" title="WhatsApp us">
    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  </a>
  <a href="contact.html" class="wn-fab wn-quote">Free Quote ↗</a>
</div>`;
document.body.insertAdjacentHTML('beforeend', floatHTML);

// ── SCROLL: progress + nav + float ───────────────────────────────────
const nav = document.querySelector('.site-header');
const float = document.getElementById('wn-float');

window.addEventListener('scroll', () => {
  const pct = scrollY / Math.max(document.body.scrollHeight - innerHeight, 1) * 100;
  spBar.style.width = Math.min(pct, 100) + '%';
  if (nav)   nav.classList.toggle('scrolled', scrollY > 20);
  if (float) float.classList.toggle('visible', scrollY > 320);
}, { passive: true });

// ── INTERSECTION: lines reveal ────────────────────────────────────────
new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); } });
}, { threshold: 0.2 }).observeAll = function(els){ els.forEach(el => this.observe(el)); return this; };

const lIO = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); lIO.unobserve(e.target); } });
}, { threshold: 0.18 });
document.querySelectorAll('[data-lines]').forEach(el => lIO.observe(el));

// ── INTERSECTION: generic reveals ────────────────────────────────────
const rIO = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rIO.unobserve(e.target); } });
}, { threshold: 0.07 });
document.querySelectorAll('.reveal').forEach(el => rIO.observe(el));

// ── STATS COUNTER ────────────────────────────────────────────────────
const cIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, target = +el.dataset.target, dur = 1600, t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
      p < 1 ? requestAnimationFrame(tick) : (el.textContent = target);
    };
    requestAnimationFrame(tick);
    cIO.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.count').forEach(el => cIO.observe(el));

// ── SMOOTH FAQ ───────────────────────────────────────────────────────
document.querySelectorAll('details').forEach(det => {
  const body = det.querySelector('p');
  if (!body) return;
  body.style.cssText = 'overflow:hidden;max-height:0;opacity:0;transition:max-height .45s cubic-bezier(0.19,1,0.22,1),opacity .3s ease,margin .3s';
  det.removeAttribute('open');

  det.querySelector('summary').addEventListener('click', e => {
    e.preventDefault();
    const open = det.hasAttribute('open');
    // close others
    document.querySelectorAll('details[open]').forEach(d => {
      if (d === det) return;
      const b = d.querySelector('p');
      if (b) { b.style.maxHeight = '0'; b.style.opacity = '0'; b.style.marginTop = '0'; }
      const s = d.querySelector('summary .faq-icon');
      if (s) s.textContent = '+';
      setTimeout(() => d.removeAttribute('open'), 450);
    });
    if (open) {
      body.style.maxHeight = '0'; body.style.opacity = '0'; body.style.marginTop = '0';
      const ic = det.querySelector('.faq-icon'); if (ic) ic.textContent = '+';
      setTimeout(() => det.removeAttribute('open'), 450);
    } else {
      det.setAttribute('open','');
      body.style.maxHeight = body.scrollHeight + 60 + 'px';
      body.style.opacity = '1'; body.style.marginTop = '1rem';
      const ic = det.querySelector('.faq-icon'); if (ic) ic.textContent = '−';
    }
  });
});

// ── MOTION-DEPENDENT ─────────────────────────────────────────────────
if (!REDUCED) {
  // Cursor tracking
  if (!TOUCH) {
    const dot = document.getElementById('wn-cur');
    const ring = document.getElementById('wn-ring');
    let mx = -200, my = -200, lx = -200, ly = -200;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    (function loop() {
      lx += (mx - lx) * 0.11;
      ly += (my - ly) * 0.11;
      dot.style.transform  = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${lx}px,${ly}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a,button,summary,.svc-list a,.svc-feat,.pitem,.feat-item,.plan').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cur-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cur-hover'));
    });
  }

  // Magnetic buttons
  document.querySelectorAll('.btn-lime,.btn-dark,.header-cta,.wn-quote').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.28}px,${(e.clientY-r.top-r.height/2)*.28}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

  // Ripple on click
  document.querySelectorAll('.btn-lime,.btn-dark,.wn-quote,.header-cta').forEach(btn => {
    btn.style.position = 'relative'; btn.style.overflow = 'hidden';
    btn.addEventListener('click', e => {
      const r = btn.getBoundingClientRect();
      const rip = document.createElement('span');
      rip.className = 'wn-ripple';
      rip.style.cssText = `left:${e.clientX-r.left}px;top:${e.clientY-r.top}px`;
      btn.appendChild(rip);
      setTimeout(() => rip.remove(), 650);
    });
  });

  // 3D card tilt
  document.querySelectorAll('.svc-feat,.pitem,.feat-item,.plan,.svc-list li').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX-r.left)/r.width -.5)*9;
      const y = ((e.clientY-r.top) /r.height-.5)*9;
      card.style.transform = `perspective(700px) rotateY(${x}deg) rotateX(${-y}deg) translateY(-5px) scale(1.015)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  // Spotlight: mouse-position radial gradient inside cards
  document.querySelectorAll('.svc-feat,.pitem,.feat-item').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--sx', (e.clientX-r.left)+'px');
      card.style.setProperty('--sy', (e.clientY-r.top) +'px');
    });
  });

  // Service list: animated active state
  document.querySelectorAll('.svc-list a').forEach(a => {
    a.addEventListener('mouseenter', () => a.classList.add('hovered'));
    a.addEventListener('mouseleave', () => a.classList.remove('hovered'));
  });

  // Hero parallax: subtle mouse-move on headline
  const heroH = document.querySelector('.hero-headline');
  if (heroH) {
    document.addEventListener('mousemove', e => {
      const x = (e.clientX/innerWidth  - .5) * 8;
      const y = (e.clientY/innerHeight - .5) * 4;
      heroH.style.transform = `translate(${x}px,${y}px)`;
    }, { passive: true });
  }
}
