/* extras.js — Init Lenis, GSAP, typing, draggable floaters, magnetic buttons, custom cursor, tilt and parallax
   - Uses CDN GSAP + Lenis (added via index.html)
   - Modern JS (ES6+), comments and graceful fallbacks
*/

// ---- Utilities ----
const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
function raf(fn){ return requestAnimationFrame(fn); }

// ---- Smooth Scrolling (Lenis) ----
(function initLenis(){
  try{
    const lenis = new Lenis({ duration: 1.0, easing: (t)=>Math.min(1.5, 1.001-Math.pow(2,-10*t)), smoothWheel: true });
    function rafLoop(time){ lenis.raf(time); requestAnimationFrame(rafLoop); }
    requestAnimationFrame(rafLoop);
  }catch(e){ console.warn('Lenis not available — falling back to default scroll.'); }
})();

// ---- GSAP + ScrollTrigger setup ----
(function initGSAP(){
  if (typeof gsap === 'undefined') return console.warn('GSAP not loaded');
  gsap.registerPlugin(ScrollTrigger, Draggable);

  // Basic fades for sections (complements existing behavior)
  gsap.utils.toArray('section').forEach(sec => {
    gsap.fromTo(sec, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out', scrollTrigger: { trigger: sec, start: 'top 85%' } });
  });

  // Parallax backgrounds (elements with .parallax-section)
  gsap.utils.toArray('.parallax-section').forEach(sec => {
    gsap.to(sec.querySelectorAll('.parallax-bg'), { yPercent: 12, ease: 'none', scrollTrigger: { trigger: sec, scrub: true } });
  });

  // Simple staggered entrance for services cards
  if (document.querySelectorAll('.service-card').length) {
    gsap.from('.service-card', { y: 30, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '#services', start: 'top 85%' } });
  }

})();

// ---- Typing animation for hero roles (simple, lightweight) ----
(function heroTyping(){
  const roles = ['Digital Creator','Video Producer','Social Media Manager'];
  const el = document.querySelector('#hero p');
  if (!el) return;
  const roleWrap = document.createElement('span'); roleWrap.className = 'hero-roles';
  const cursor = document.createElement('span'); cursor.className = 'hero-typing-cursor';
  el.textContent = '';
  el.appendChild(roleWrap); el.appendChild(cursor);

  let i = 0, char = 0, forward = true, roleIndex = 0;
  function tick(){
    const role = roles[roleIndex];
    if (forward){
      char++; roleWrap.textContent = role.slice(0, char);
      if (char === role.length){ forward = false; setTimeout(tick, 1100); return; }
    } else {
      char--; roleWrap.textContent = role.slice(0, char);
      if (char === 0){ forward = true; roleIndex = (roleIndex+1)%roles.length; setTimeout(tick, 300); return; }
    }
    setTimeout(tick, forward ? 90 : 30);
  }
  setTimeout(tick, 500);
})();

// ---- Draggable floaters (GSAP Draggable) ----
(function initFloaters(){
  const floaters = document.querySelectorAll('.floater');
  if (!floaters.length || typeof Draggable === 'undefined') return; // no-op

  floaters.forEach(el => {
    Draggable.create(el, { bounds: document.body, inertia: true });
    // gentle up/down float using GSAP
    gsap.to(el, { y: '-=6', duration: 2.2 + Math.random(), yoyo: true, repeat: -1, ease: 'sine.inOut' });
  });
})();

// ---- Magnetic buttons ----
(function magneticButtons(){
  const buttons = document.querySelectorAll('.btn-magnetic');
  buttons.forEach(btn => {
    if (isTouch) return; // skip on touch
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const relX = e.clientX - rect.left; const relY = e.clientY - rect.top;
      const dx = (relX - rect.width/2) / (rect.width/2); const dy = (relY - rect.height/2) / (rect.height/2);
      btn.querySelector('.inner').style.transform = `translate(${dx*10}px, ${dy*6}px)`;
    });
    btn.addEventListener('mouseleave', ()=> { btn.querySelector('.inner').style.transform = ''; });
  });
})();

// ---- Custom animated cursor ----
(function customCursor(){
  const cursor = document.getElementById('custom-cursor');
  if (!cursor) return;
  if (isTouch) { cursor.classList.add('hidden'); return; }
  document.body.classList.add('show-custom-cursor');
  const dot = cursor.querySelector('.dot');
  let mouseX = 0, mouseY = 0, curX = 0, curY = 0;

  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; cursor.classList.remove('hidden'); });
  function loop(){ curX += (mouseX - curX) * 0.18; curY += (mouseY - curY) * 0.18; cursor.style.left = curX + 'px'; cursor.style.top = curY + 'px'; requestAnimationFrame(loop); }
  requestAnimationFrame(loop);

  // enlarge on interactive elements
  ['a','button','.btn-magnetic','.portfolio-item','.service-card','.floater'].forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.addEventListener('mouseenter', ()=> cursor.classList.add('large'));
      el.addEventListener('mouseleave', ()=> cursor.classList.remove('large'));
    });
  });
})();

// ---- Hover tilt for service cards (fine tuned) ----
(function tiltCards(){
  if (isTouch) return; // skip on touch
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left)/rect.width; const py = (e.clientY - rect.top)/rect.height;
      const rx = (py - 0.5) * 8; const ry = (px - 0.5) * -10;
      card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

// ---- Parallax tweaks for hero layers (small subtle parallax) ----
(function heroParallax(){
  const hero = document.getElementById('hero'); if (!hero) return;
  document.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const rx = (e.clientX - rect.left)/rect.width - 0.5; const ry = (e.clientY - rect.top)/rect.height - 0.5;
    hero.style.transform = `translateZ(0) translate(${rx*6}px, ${ry*6}px)`;
    setTimeout(()=> { hero.style.transform = ''; }, 220);
  });
})();

// End of extras.js
