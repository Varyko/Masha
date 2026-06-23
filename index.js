/* ─── STATE ──────────────────────────────────────────── */
let currentId = 's1';
let busy      = false;

/* ─── COIN INSERT ────────────────────────────────────── */
const coinScreen = document.getElementById('coin-screen');
coinScreen.addEventListener('click', () => {
  coinScreen.classList.add('hide');
  spawnParticles(window.innerWidth/2, window.innerHeight/2, 24);
});

/* ─── NAVIGATE ───────────────────────────────────────── */
function navigate(toId, direction) {
  if (busy || toId === currentId) return;
  const from = document.getElementById(currentId);
  const to   = document.getElementById(toId);
  if (!from || !to) return;

  busy = true;

  /* flash */
  const flash = document.getElementById('flash');
  flash.classList.add('pop');
  setTimeout(() => flash.classList.remove('pop'), 180);

  /* particles burst from center */
  spawnParticles(window.innerWidth/2, window.innerHeight/2, 16);

  /* outgoing */
  from.classList.remove('visible', 'exit-forward', 'exit-back');
  from.classList.add(direction >= 0 ? 'exit-forward' : 'exit-back');

  /* incoming */
  /* reset to correct start state before making visible */
  to.classList.remove('visible', 'exit-forward', 'exit-back');
  /* force reflow so transition fires */
  to.getBoundingClientRect();
  to.classList.add('visible');

  currentId = toId;
  setTimeout(() => busy = false, 700);
}

/* ─── PARTICLES ──────────────────────────────────────── */
function spawnParticles(x, y, count) {
  const container = document.getElementById('particles');
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const dist  = 60 + Math.random() * 120;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    p.style.cssText = `
      left:${x}px; top:${y}px;
      --fly: translate(${dx}px, ${dy}px) scale(0);
      background: ${Math.random() > 0.5 ? 'var(--cyan)' : 'var(--purple)'};
      animation-duration: ${0.4 + Math.random() * 0.4}s;
    `;
    container.appendChild(p);
    setTimeout(() => p.remove(), 900);
  }
}

/* ─── CLICK RIPPLE ───────────────────────────────────── */
document.addEventListener('click', (e) => {
  const r = document.createElement('div');
  r.className = 'ripple';
  r.style.left = (e.clientX - 5) + 'px';
  r.style.top  = (e.clientY - 5) + 'px';
  document.body.appendChild(r);
  spawnParticles(e.clientX, e.clientY, 6);
  setTimeout(() => r.remove(), 600);
});

/* ─── WIRE UP BUTTONS ────────────────────────────────── */
document.getElementById('startBtn').addEventListener('click', () => navigate('s2', 1));
document.getElementById('goBtn').addEventListener('click',   () => navigate('s3', 1));
document.getElementById('gotItBtn').addEventListener('click',   () => navigate('s6', 1));
document.getElementById('startAgainBtn').addEventListener('click',   () => navigate('s1', 1));

/* dot nodes */
document.querySelectorAll('.dot-node[data-target]').forEach(node => {
  node.addEventListener('click', (e) => {
    e.stopPropagation();
    spawnParticles(e.clientX, e.clientY, 12);
    navigate(node.dataset.target, +node.dataset.dir);
  });
});

/* back arrows */
document.querySelectorAll('.label-arrow[data-target]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    navigate(btn.dataset.target, +btn.dataset.dir);
  });
});

document.querySelectorAll('.forward[data-target]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    navigate(btn.dataset.target, +btn.dataset.dir);
  });
});

const allPopups = document.querySelectorAll('.pop-up');

// Click on a dot — close all, open the matching one
document.querySelectorAll('.dot-node__pop-up').forEach(node => {
  node.addEventListener('click', e => {
    e.stopPropagation(); // prevent the document listener from firing

    const targetId = 'popup-' + node.dataset.popup;
    const targetPopup = document.getElementById(targetId);
    const isAlreadyOpen = targetPopup.classList.contains('pop-up__visible');

    // close all pop-ups
    allPopups.forEach(p => p.classList.remove('pop-up__visible'));

    // if it wasn't already open, open it
    if (!isAlreadyOpen) {
      targetPopup.classList.add('pop-up__visible');
    }
  });
});

// Click anywhere outside — close all
document.addEventListener('click', () => {
  allPopups.forEach(p => p.classList.remove('pop-up__visible'));
});

//for profile
const allAwards = document.querySelectorAll('.awards__card');
document.querySelectorAll('.awards__coin').forEach(item =>{
  item.addEventListener('click', e =>{
    e.stopPropagation();

    const awardTargetId = 'award-' + item.dataset.award;
    const targetAward = document.getElementById(awardTargetId);
    const isOpen = targetAward.classList.contains('awards__card__visible');

    allAwards.forEach(a => a.classList.remove('awards__card__visible'));

    if(!isOpen){
      targetAward.classList.add('awards__card__visible');
    }
  })
});

document.addEventListener('click', ()=>{
  allAwards.forEach(a => a.classList.remove('awards__card__visible'));
})

/* ─── SLIDER (s3) ──────────────────────────────────── */

const SWIPER_CONFIG = {
  loop: true,
  navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
  pagination:  { el: '.swiper-pagination', clickable: true },
  breakpoints: {
    0:   { slidesPerView: 1,   spaceBetween: 10 },
    640: { slidesPerView: 1.5, spaceBetween: 14 },
    900: { slidesPerView: 2,   spaceBetween: 18 },
  }
};

function initScreenSwipers(screenEl) {
  // Prevent double-init
  if (screenEl.dataset.swipersReady) return;
  screenEl.dataset.swipersReady = 'true';

  const tabs   = Array.from(screenEl.querySelectorAll('.ec-tabs li'));
  const panels = Array.from(screenEl.querySelectorAll('.ec-panel'));
  const swipers = {};

  function activateTab(idx) {
    // Toggle active class only within this screen
    tabs.forEach((t, i)   => t.classList.toggle('active', i === idx));
    panels.forEach((p, i) => p.classList.toggle('active', i === idx));

    // Lazy-init: create Swiper only when panel first becomes visible
    const swiperEl = panels[idx]?.querySelector('.swiper');
    if (swiperEl && !swipers[idx]) {
      swipers[idx] = new Swiper(swiperEl, SWIPER_CONFIG);
    } else if (swipers[idx]) {
      swipers[idx].update();
    }
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', e => {
      e.stopPropagation();
      activateTab(i);
      spawnParticles(e.clientX, e.clientY, 8);
    });
  });

  // Show first tab by default
  activateTab(0);
}

// Initialize a screen the first time it becomes .visible
const screenObserver = new MutationObserver(mutations => {
  mutations.forEach(({ target }) => {
    if (target.classList.contains('visible')) {
      initScreenSwipers(target);
    }
  });
});

document.querySelectorAll('.screen').forEach(screen => {
  // Only observe screens that actually contain swiper tabs
  if (screen.querySelector('.ec-tabs')) {
    screenObserver.observe(screen, { attributes: true, attributeFilter: ['class'] });
  }
});