const allPages = ['home','about','interior','furniture','archive','contact'];
let projNavOpen = false;

function placeholderSVG(seed) {
  const fills = ['#eceae4','#e8e6e0','#f0ede6','#e4e2dc'];
  const f = fills[seed % fills.length];
  return `<svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;">
    <rect width="640" height="480" fill="${f}"/>
    <rect x="60" y="60" width="520" height="360" fill="none" stroke="#ddd9d2" stroke-width="1"/>
  </svg>`;
}

function buildSliderHTML(p, imgs, entryId, sliderId) {
  const slides = imgs.map(src => `<img src="${src}" alt="${p.name}">`).join('');
  const dots = imgs.map((_, di) =>
    `<div class="proj-slider-dot${di===0?' on':''}" onclick="sDot('${sliderId}',${di},event)"></div>`
  ).join('');
  return `
    <div class="proj-slider-wrap">
      <div class="proj-slider" id="${sliderId}" onclick="sExpand('${entryId}','${sliderId}',${imgs.length},event)">
        <div class="proj-slider-track">${slides}</div>
      </div>
      <div class="proj-slider-arrows" id="arrows-${sliderId}">
        <div class="s-arrow" onclick="sPrev('${sliderId}',${imgs.length},event)">‹</div>
        <div class="s-arrow" onclick="sNext('${sliderId}',${imgs.length},event)">›</div>
      </div>
    </div>
    <div class="proj-slider-dots" id="dots-${sliderId}">${dots}</div>`;
}

function renderProjectList(type) {
  const container = document.getElementById('scroll-' + type);
  container.innerHTML = '';
  const list = PROJECTS.filter(p => p.type === type).sort((a, b) => b.year - a.year);
  list.forEach((p, i) => {
    const imgs = (p.images || []).filter(Boolean);
    const entryId = `entry-${type}-${i}`;
    const sliderId = `slider-${type}-${i}`;
    const meta = [p.cat, p.size, p.year].filter(Boolean).join(' · ');

    const sliderHTML = imgs.length > 0 ? buildSliderHTML(p, imgs, entryId, sliderId) : placeholderSVG(i);

    const div = document.createElement('div');
    div.className = 'proj-entry';
    div.id = entryId;
    div.innerHTML = `
      <div class="proj-detail-bar">
        <span class="proj-detail-close" onclick="sCollapse('${entryId}','${sliderId}',event)">Close ×</span>
        <span class="proj-detail-name">${p.name}</span>
        <span class="proj-detail-meta">${meta}</span>
      </div>
      <div class="proj-entry-img">
        <div class="proj-mobile-title">${p.name}<span class="proj-mobile-meta">${meta}</span></div>
        ${sliderHTML}
      </div>
      <div class="proj-entry-info">
        <div class="proj-entry-name">${p.name}</div>
        <div class="proj-entry-meta">${[p.cat, p.size, p.year].filter(Boolean).join('<br>')}</div>
      </div>`;
    container.appendChild(div);
  });
  initScrollEffect();
}

function sExpand(entryId, sliderId, total, e) {
  const entry = document.getElementById(entryId);
  if (entry.classList.contains('expanded')) return;
  document.querySelectorAll('.proj-entry.expanded').forEach(el => {
    el.classList.remove('expanded');
    const sid = el.querySelector('.proj-slider') ? el.querySelector('.proj-slider').id : null;
    if (sid) {
      el.querySelector('.proj-slider-track').style.transform = 'translateX(0)';
      const dotsWrap = document.getElementById('dots-' + sid);
      if (dotsWrap) dotsWrap.querySelectorAll('.proj-slider-dot').forEach((d,i) => d.classList.toggle('on', i===0));
    }
  });
  entry.classList.add('expanded');
}

function sCollapse(entryId, sliderId, e) {
  e.stopPropagation();
  const entry = document.getElementById(entryId);
  entry.classList.remove('expanded');
  const slider = document.getElementById(sliderId);
  if (slider) {
    slider._idx = 0;
    slider.querySelector('.proj-slider-track').style.transform = 'translateX(0)';
    const dotsWrap = document.getElementById('dots-' + sliderId);
    if (dotsWrap) dotsWrap.querySelectorAll('.proj-slider-dot').forEach((d,i) => d.classList.toggle('on', i===0));
  }
}

function sNext(sliderId, total, e) {
  e.stopPropagation();
  const slider = document.getElementById(sliderId);
  const cur = slider._idx || 0;
  const next = (cur + 1) % total;
  slider._idx = next;
  slider.querySelector('.proj-slider-track').style.transform = `translateX(-${next * 88 + next * 2}%)`;
  const dotsWrap = document.getElementById('dots-' + sliderId);
  if (dotsWrap) dotsWrap.querySelectorAll('.proj-slider-dot').forEach((d,i) => d.classList.toggle('on', i===next));
}

function sPrev(sliderId, total, e) {
  e.stopPropagation();
  const slider = document.getElementById(sliderId);
  const cur = slider._idx || 0;
  const prev = (cur - 1 + total) % total;
  slider._idx = prev;
  slider.querySelector('.proj-slider-track').style.transform = `translateX(-${prev * 88 + prev * 2}%)`;
  const dotsWrap = document.getElementById('dots-' + sliderId);
  if (dotsWrap) dotsWrap.querySelectorAll('.proj-slider-dot').forEach((d,i) => d.classList.toggle('on', i===prev));
}

function sDot(sliderId, idx, e) {
  e.stopPropagation();
  const slider = document.getElementById(sliderId);
  slider._idx = idx;
  slider.querySelector('.proj-slider-track').style.transform = `translateX(-${idx * 90}%)`;
  const dotsWrap = document.getElementById('dots-' + sliderId);
  if (dotsWrap) dotsWrap.querySelectorAll('.proj-slider-dot').forEach((d,i) => d.classList.toggle('on', i===idx));
}

function initScrollEffect() {
  let scrollTimer;
  const scaleEls = document.querySelectorAll('.proj-entry-img, .proj-entry-info');
  window.removeEventListener('scroll', window._scrollFn);
  window._scrollFn = () => {
    scaleEls.forEach(el => {
      el.style.transform = 'scale(0.97)';
      el.style.transition = 'transform 0.1s ease';
    });
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      scaleEls.forEach(el => {
        el.style.transform = 'scale(1)';
        el.style.transition = 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)';
      });
    }, 80);
  };
  window.addEventListener('scroll', window._scrollFn);
  initSliderInteractions();
}

function initSliderInteractions() {
  document.querySelectorAll('.proj-slider').forEach(slider => {
    if (slider.dataset.bound) return;
    slider.dataset.bound = '1';

    const sliderId = slider.id;
    const entry = slider.closest('.proj-entry');

    // ── 휠 스크롤 ──
    slider.addEventListener('wheel', e => {
      if (!entry || !entry.classList.contains('expanded')) return;
      e.preventDefault();
      const total = slider.querySelectorAll('.proj-slider-track img').length;
      if (e.deltaX > 80 || e.deltaY > 80)  sNext(sliderId, total, { stopPropagation: () => {} });
      if (e.deltaX < -80 || e.deltaY < -80) sPrev(sliderId, total, { stopPropagation: () => {} });
    }, { passive: false });

    // ── 드래그 (마우스) ──
    let dragStartX = null;
    let isDragging = false;
    slider.addEventListener('mousedown', e => {
      dragStartX = e.clientX;
      isDragging = false;
    });
    slider.addEventListener('mousemove', e => {
      if (dragStartX !== null && Math.abs(e.clientX - dragStartX) > 8) isDragging = true;
    });
    slider.addEventListener('mouseup', e => {
      if (!entry || !entry.classList.contains('expanded') || dragStartX === null) { dragStartX = null; return; }
      const diff = dragStartX - e.clientX;
      const total = slider.querySelectorAll('.proj-slider-track img').length;
      if (Math.abs(diff) > 40) {
        const fakeE = { stopPropagation: () => {} };
        if (diff > 0) sNext(sliderId, total, fakeE);
        else sPrev(sliderId, total, fakeE);
      }
      dragStartX = null;
    });
    slider.addEventListener('click', e => {
      if (isDragging) { e.stopImmediatePropagation(); isDragging = false; }
    }, true);

    // ── 터치 ──
    let touchStartX = null;
    slider.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    slider.addEventListener('touchend', e => {
      if (!entry || !entry.classList.contains('expanded') || touchStartX === null) { touchStartX = null; return; }
      const diff = touchStartX - e.changedTouches[0].clientX;
      const total = slider.querySelectorAll('.proj-slider-track img').length;
      if (Math.abs(diff) > 40) {
        const fakeE = { stopPropagation: () => {} };
        if (diff > 0) sNext(sliderId, total, fakeE);
        else sPrev(sliderId, total, fakeE);
      }
      touchStartX = null;
    }, { passive: true });
  });
}
  
function renderArchive() {
  const grid = document.getElementById('archive-grid');
  grid.innerHTML = '';
  renderArchiveMobile(grid);
}

function renderArchiveMobile(grid) {
  grid.innerHTML = '';

  const projItems = PROJECTS.map((p, i) => ({ _kind: 'project', _origIdx: i, year: parseInt(p.year) || 0, data: p }));

  // Safari 사생활보호모드에서 localStorage 접근 시 에러 방지
  let localPosts = [];
  try {
    localPosts = JSON.parse(localStorage.getItem('zak_posts') || '[]');
  } catch(e) { localPosts = []; }
  const postArr = (typeof POSTS !== 'undefined' ? POSTS : []).concat(
    localPosts.filter(lp => !(typeof POSTS !== 'undefined' && POSTS.some(p => p.title === lp.title && p.date === lp.date)))
  );
  const postItems = postArr.map(p => ({ _kind: 'post', year: parseInt(p.date) || 0, data: p }));

  const allItems = [...projItems, ...postItems].sort((a, b) => b.year - a.year);

  allItems.forEach(item => {
    const el = document.createElement('div');
    if (item._kind === 'project') {
      const p = item.data;
      const i = item._origIdx;
      el.className = 'archive-item';
      const src = p.images && p.images[0] ? p.images[0] : null;
      el.innerHTML = `<span class="archive-name-top">${p.name}</span>`
        + `<div class="archive-img-wrap">${src ? `<img src="${src}" alt="${p.name}">` : placeholderSVG(i)}</div>`
        + `<span class="archive-year-bot">${p.year}</span>`;
      el.addEventListener('click', () => goToProject(p.type, i));
    } else {
      const post = item.data;
      if (post.type === 'sketch' && post.image) {
        el.className = 'archive-item post-sketch';
        el.innerHTML = `<span class="archive-name-top">${post.title}</span>`
          + `<div class="archive-img-wrap"><img src="${post.image}" alt="${post.title}"></div>`
          + `<span class="archive-year-bot">${post.date || ''}</span>`;
      } else {
        el.className = 'archive-item post-text';
        el.innerHTML = `<span class="archive-name-top">${post.title}</span>`
          + `<div class="archive-img-wrap"><div class="post-tag">${post.tag || 'Note'}</div><div class="post-title">${post.title}</div></div>`
          + `<span class="archive-year-bot">${post.date || ''}</span>`;
      }
      el.addEventListener('click', () => openPostViewer(post));
    }
    grid.appendChild(el);
  });
}

function goToProject(type, archiveIdx) {
  const list = PROJECTS.filter(p => p.type === type).sort((a, b) => b.year - a.year);
  const clicked = PROJECTS[archiveIdx];
  const listIdx = list.findIndex(p => p.name === clicked.name && p.year === clicked.year);

  go(type);

  setTimeout(() => {
    const entryId = 'entry-' + type + '-' + listIdx;
    const el = document.getElementById(entryId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
}

function toggleProjNav() {
  projNavOpen = !projNavOpen;
  document.getElementById('nav-sub').classList.toggle('open', projNavOpen);
  document.getElementById('nav-project').style.opacity = projNavOpen ? '1' : '0.3';
}

function go(target) {
  allPages.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) el.classList.toggle('active', p === target);
  });

  ['about','archive','contact'].forEach(p => {
    const el = document.getElementById('nav-' + p);
    if (el) el.classList.toggle('active', p === target);
  });

  ['interior','furniture'].forEach(p => {
    const el = document.getElementById('nav-' + p);
    if (el) el.classList.toggle('active', p === target);
    const mel = document.getElementById('mn-' + p);
    if (mel) mel.classList.toggle('active', p === target);
  });

  if (target === 'interior' || target === 'furniture') {
    projNavOpen = true;
    document.getElementById('nav-sub').classList.add('open');
    document.getElementById('nav-project').style.opacity = '1';
  } else {
    projNavOpen = false;
    document.getElementById('nav-sub').classList.remove('open');
    document.getElementById('nav-project').style.opacity = '1';
  }

  allPages.forEach(p => {
    const mel = document.getElementById('mn-' + p);
    if (mel) mel.classList.toggle('active', p === target);
  });

  document.querySelectorAll('.proj-entry.expanded').forEach(el => {
    el.classList.remove('expanded');
  });
  if (target === 'interior')  renderProjectList('interior');
  if (target === 'furniture') renderProjectList('furniture');
  if (target === 'archive')   renderArchive();

  const iqBtn = document.getElementById('inquiry-btn');
  if (iqBtn) iqBtn.classList.toggle('show', target === 'contact');
  if (target !== 'contact') closeInquiry();

  const urlTarget = target === 'home' ? '/' : '/' + target;
  history.pushState({ page: target }, '', urlTarget);

  window.scrollTo(0, 0);
  return false;
}


function openInquiry() {
  document.getElementById('inquiry-panel').classList.add('open');
  document.getElementById('inquiry-overlay').classList.add('open');
}
function closeInquiry() {
  const p = document.getElementById('inquiry-panel');
  const o = document.getElementById('inquiry-overlay');
  if (p) p.classList.remove('open');
  if (o) o.classList.remove('open');
}

// ── MAGNETIC LOGO ──
(function() {
  const logo = document.querySelector('.site-logo');
  if (!logo) return;
  const STRENGTH = 0.1;
  const RADIUS = 120;
  document.addEventListener('mousemove', e => {
    const rect = logo.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
    if (dist < RADIUS) {
      const dx = (e.clientX - cx) * STRENGTH;
      const dy = (e.clientY - cy) * STRENGTH;
      logo.style.transform = `translate(${dx}px, ${dy}px)`;
    } else {
      logo.style.transform = 'translate(0, 0)';
    }
  });
})();

// ── CUSTOM CURSOR ──
const cur = document.getElementById('cursor');
if (cur) {
  document.addEventListener('mousemove', e => {
    cur.style.left = e.clientX + 'px';
    cur.style.top  = e.clientY + 'px';
  });
  document.addEventListener('mouseover', e => {
    const el = e.target.closest('a, button, [onclick], .proj-slider, .s-arrow, .proj-detail-close');
    cur.classList.toggle('hover', !!el);
  });
  document.addEventListener('mousedown', () => cur.classList.add('hover'));
  document.addEventListener('mouseup', () => cur.classList.remove('hover'));
}

// ── MOBILE ACCORDION ──
const isMobile = () => window.innerWidth <= 800;

function mGoHome() {
  ['about','project','interior','furniture','archive','contact'].forEach(k => {
    const el = document.getElementById('m-item-' + k);
    if (el) el.classList.remove('open');
  });
  const arrow = document.getElementById('m-arrow-project');
  if (arrow) arrow.style.transform = '';
  document.querySelectorAll('.proj-entry.expanded').forEach(el => {
    el.classList.remove('expanded');
    const slider = el.querySelector('.proj-slider');
    if (slider) {
      slider._idx = 0;
      const track = slider.querySelector('.proj-slider-track');
      if (track) track.style.transform = 'translateX(0)';
    }
  });
  history.pushState({ page: 'home' }, '', '/');
}

function mToggleProject() {
  const item = document.getElementById('m-item-project');
  const arrow = document.getElementById('m-arrow-project');
  const isOpen = item.classList.contains('open');
  item.classList.toggle('open', !isOpen);
  arrow.style.transform = isOpen ? '' : 'rotate(180deg)';
}

function mToggle(key) {
  const item = document.getElementById('m-item-' + key);
  const content = document.getElementById('m-content-' + key);
  const isOpen = item.classList.contains('open');

  if (!isOpen) {
    if (key === 'about') {
      const aboutInner = document.querySelector('#page-about .about-inner');
      if (aboutInner) content.innerHTML = aboutInner.outerHTML;
    } else if (key === 'interior') {
      content.innerHTML = '<div id="m-scroll-interior" style="padding:0"></div>';
      const mType = 'interior';
      const mContainer = document.getElementById('m-scroll-interior');
      const mList = PROJECTS.filter(p => p.type === mType).sort((a, b) => b.year - a.year);
      mList.forEach((p, i) => {
        const imgs = (p.images || []).filter(Boolean);
        const entryId = 'm-entry-interior-' + i;
        const sliderId = 'm-slider-interior-' + i;
        const meta = [p.cat, p.size, p.year].filter(Boolean).join(' · ');
        let sliderHTML = imgs.length > 0
          ? buildSliderHTML(p, imgs, entryId, sliderId)
          : placeholderSVG(i);
        const div = document.createElement('div');
        div.className = 'proj-entry';
        div.id = entryId;
        div.style.marginBottom = '40px';
        const detailBar = document.createElement('div');
        detailBar.className = 'proj-detail-bar';
        detailBar.innerHTML = `<span class="proj-detail-close" onclick="sCollapse('${entryId}','${sliderId}',event)">Close ×</span><span class="proj-detail-name">${p.name}</span><span class="proj-detail-meta">${meta}</span>`;
        const entryImg = document.createElement('div');
        entryImg.className = 'proj-entry-img';
        const mobileTitle = document.createElement('div');
        mobileTitle.className = 'proj-mobile-title';
        mobileTitle.innerHTML = `${p.name}<span class="proj-mobile-meta">${meta}</span>`;
        entryImg.appendChild(mobileTitle);
        entryImg.insertAdjacentHTML('beforeend', sliderHTML);
        div.appendChild(detailBar);
        div.appendChild(entryImg);
        mContainer.appendChild(div);
      });
      initSliderInteractions();
    } else if (key === 'furniture') {
      content.innerHTML = '<div id="m-scroll-furniture" style="padding:0"></div>';
      const mType2 = 'furniture';
      const mContainer2 = document.getElementById('m-scroll-furniture');
      const mList2 = PROJECTS.filter(p => p.type === mType2).sort((a, b) => b.year - a.year);
      mList2.forEach((p, i) => {
        const imgs = (p.images || []).filter(Boolean);
        const entryId = 'm-entry-furniture-' + i;
        const sliderId = 'm-slider-furniture-' + i;
        const meta = [p.cat, p.size, p.year].filter(Boolean).join(' · ');
        let sliderHTML = imgs.length > 0
          ? buildSliderHTML(p, imgs, entryId, sliderId)
          : placeholderSVG(i);
        const div = document.createElement('div');
        div.className = 'proj-entry';
        div.id = entryId;
        div.style.marginBottom = '40px';
        const detailBar2 = document.createElement('div');
        detailBar2.className = 'proj-detail-bar';
        detailBar2.innerHTML = `<span class="proj-detail-close" onclick="sCollapse('${entryId}','${sliderId}',event)">Close ×</span><span class="proj-detail-name">${p.name}</span><span class="proj-detail-meta">${meta}</span>`;
        const entryImg2 = document.createElement('div');
        entryImg2.className = 'proj-entry-img';
        const mobileTitle2 = document.createElement('div');
        mobileTitle2.className = 'proj-mobile-title';
        mobileTitle2.innerHTML = `${p.name}<span class="proj-mobile-meta">${meta}</span>`;
        entryImg2.appendChild(mobileTitle2);
        entryImg2.insertAdjacentHTML('beforeend', sliderHTML);
        div.appendChild(detailBar2);
        div.appendChild(entryImg2);
        mContainer2.appendChild(div);
      });
      initSliderInteractions();
    } else if (key === 'archive') {
      const gridWrap = document.createElement('div');
      gridWrap.className = 'archive-grid';
      gridWrap.style.marginTop = '8px';
      content.innerHTML = '';
      content.appendChild(gridWrap);
      renderArchiveMobile(gridWrap);
    } else if (key === 'contact') {
      const contactInner = document.querySelector('#page-contact .contact-inner');
      if (contactInner) {
        content.innerHTML = contactInner.outerHTML;
        content.innerHTML += `<div style="padding:20px 0 60px;">
          <button onclick="openInquiry()" style="width:100%;padding:14px;background:var(--black);color:#fff;border:none;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;font-family:var(--f);cursor:pointer;">Get in Touch</button>
        </div>`;
      }
    }
    history.pushState({ page: key }, '', '/' + key);
    const iqBtn = document.getElementById('inquiry-btn');
    if (iqBtn) iqBtn.classList.toggle('show', key === 'contact');
  } else {
    history.pushState({ page: 'home' }, '', '/');
    if (key === 'contact') {
      const iqBtn = document.getElementById('inquiry-btn');
      if (iqBtn) iqBtn.classList.remove('show');
    }
  }

  item.classList.toggle('open', !isOpen);
}

function toggleMobile() { /* 구버전 호환용 */ }
function closeMobile() { /* 구버전 호환용 */ }

document.addEventListener('click', e => {
  // 구버전 호환용
});

let logoClickCount = 0;
let logoClickTimer;
function handleLogoClick() {
  go('home');
  logoClickCount++;
  clearTimeout(logoClickTimer);
  logoClickTimer = setTimeout(() => { logoClickCount = 0; }, 1500);
  if (logoClickCount >= 3) {
    logoClickCount = 0;
    window.location.href = '/admin.html';
  }
}

// ── URL 라우팅 ──
window.addEventListener('popstate', e => {
  const page = e.state?.page || location.pathname.replace('/', '') || 'home';
  const valid = ['home','about','interior','furniture','archive','contact'];
  goWithoutPush(valid.includes(page) ? page : 'home');
});

function goWithoutPush(target) {
  const allPages = ['home','about','interior','furniture','archive','contact'];
  allPages.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) el.classList.toggle('active', p === target);
  });
  ['about','archive','contact'].forEach(p => {
    const el = document.getElementById('nav-' + p);
    if (el) el.classList.toggle('active', p === target);
  });
  ['interior','furniture'].forEach(p => {
    const el = document.getElementById('nav-' + p);
    if (el) el.classList.toggle('active', p === target);
  });
  if (target === 'interior' || target === 'furniture') {
    projNavOpen = true;
    document.getElementById('nav-sub').classList.add('open');
  } else {
    projNavOpen = false;
    document.getElementById('nav-sub').classList.remove('open');
  }
  document.querySelectorAll('.proj-entry.expanded').forEach(el => {
    el.classList.remove('expanded');
  });
  if (target === 'interior')  renderProjectList('interior');
  if (target === 'furniture') renderProjectList('furniture');
  if (target === 'archive')   renderArchive();
  const iqBtn = document.getElementById('inquiry-btn');
  if (iqBtn) iqBtn.classList.toggle('show', target === 'contact');
  if (target !== 'contact') closeInquiry();
  window.scrollTo(0, 0);
}

// 첫 진입 시 URL 읽어서 해당 페이지로
(function() {
  const path = location.pathname.replace('/', '').replace('.html', '') || 'home';
  const valid = ['home','about','interior','furniture','archive','contact'];
  if (valid.includes(path) && path !== 'home') {
    go(path);
  }
})();

// ── INQUIRY FILE UPLOAD & SUBMIT ──
let inquiryFiles = [];

function handleFiles(files) {
  Array.from(files).forEach(f => {
    if (f.size > 25 * 1024 * 1024) { alert(f.name + ' exceeds 25MB limit.'); return; }
    if (!inquiryFiles.find(x => x.name === f.name && x.size === f.size)) inquiryFiles.push(f);
  });
  renderFileList();
}

function renderFileList() {
  const el = document.getElementById('file-list');
  el.innerHTML = inquiryFiles.map((f, i) =>
    `<div class="file-item">
      <span>${f.name} <span style="color:var(--mid)">(${(f.size/1024).toFixed(0)} KB)</span></span>
      <span class="file-item-remove" onclick="removeFile(${i})">×</span>
    </div>`
  ).join('');
}

function removeFile(i) {
  inquiryFiles.splice(i, 1);
  renderFileList();
}

// drag & drop
document.addEventListener('DOMContentLoaded', () => {
  const zone = document.getElementById('upload-zone');
  if (!zone) return;
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = 'var(--black)'; });
  zone.addEventListener('dragleave', () => { zone.style.borderColor = ''; });
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.style.borderColor = '';
    handleFiles(e.dataTransfer.files);
  });
});

async function submitInquiry(e) {
  e.preventDefault();
  const btn = document.getElementById('iq-submit');
  const status = document.getElementById('iq-status');
  const chips = [...document.querySelectorAll('#inquiry-chips .inquiry-chip.on')].map(c => c.textContent).join(', ') || 'None selected';

  const ACCESS_KEY = 'YOUR_ACCESS_KEY';

  btn.disabled = true;
  btn.textContent = 'Sending...';
  status.style.display = 'block';
  status.textContent = '';

  if (ACCESS_KEY === 'YOUR_ACCESS_KEY') {
    await new Promise(r => setTimeout(r, 900));
    btn.textContent = 'Sent!';
    status.textContent = '(Demo mode: Access Key not set yet)';
    setTimeout(() => { closeInquiry(); resetInquiry(); }, 2500);
    return;
  }

  const formData = new FormData();
  formData.append('access_key', ACCESS_KEY);
  formData.append('subject', '[Studio Zak] New Inquiry from ' + document.getElementById('iq-name').value);
  formData.append('name', document.getElementById('iq-name').value);
  formData.append('email', document.getElementById('iq-email').value);
  formData.append('services', chips);
  formData.append('message', document.getElementById('iq-message').value);
  if (inquiryFiles.length > 0) {
    formData.append('file_names', inquiryFiles.map(f => f.name).join(', '));
  }

  try {
    const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
      btn.textContent = 'Sent ✓';
      status.textContent = 'Thank you. We will be in touch soon.';
      setTimeout(() => { closeInquiry(); resetInquiry(); }, 2500);
    } else {
      throw new Error(data.message);
    }
  } catch (err) {
    console.error('Web3Forms error:', err);
    btn.disabled = false;
    btn.textContent = 'Send Inquiry';
    status.textContent = 'Something went wrong. Please try again.';
  }
}

function resetInquiry() {
  document.getElementById('inquiry-form').reset();
  inquiryFiles = [];
  renderFileList();
  document.querySelectorAll('#inquiry-chips .inquiry-chip').forEach(c => c.classList.remove('on'));
  const btn = document.getElementById('iq-submit');
  btn.disabled = false; btn.textContent = 'Send Inquiry';
  document.getElementById('iq-status').style.display = 'none';
}


// ── POST VIEWER ── //
function openPostViewer(post) {
  const imgEl = document.getElementById('pv-img');
  if (post.image) {
    imgEl.className = 'post-viewer-img';
    imgEl.innerHTML = `<img src="${post.image}" alt="${post.title}">`;
  } else {
    imgEl.className = 'post-viewer-img no-img';
    imgEl.innerHTML = `<span class="pv-tag-big">${post.tag || 'NOTE'}</span>`;
  }
  document.getElementById('pv-tag').textContent = post.tag || '';
  document.getElementById('pv-title').textContent = post.title || '';
  document.getElementById('pv-date').textContent = post.date || '';
  document.getElementById('pv-body').textContent = post.body || '';
  document.getElementById('pv-overlay').classList.add('open');
  document.getElementById('post-viewer').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePostViewer() {
  document.getElementById('pv-overlay').classList.remove('open');
  document.getElementById('post-viewer').classList.remove('open');
  document.body.style.overflow = '';
}

// ── EASTER EGG TRIGGER ──
document.addEventListener('DOMContentLoaded', () => {
  let eggCount = 0, eggTimer;
  let easterEmojiIdx = 0;
  const footer = document.querySelector('.site-footer');
  if (!footer) return;
  footer.addEventListener('click', () => {
    eggCount++;
    clearTimeout(eggTimer);
    eggTimer = setTimeout(() => { eggCount = 0; }, 700);
    if (eggCount >= 3) {
      eggCount = 0;
      const eggs = [
        { emoji: '😜', msg: 'Oh wait — I made this.', sub: '(yes, every pixel. be nice.)', btn: 'evidence → @byeolingz' },
        { emoji: '😙', msg: 'Yes, I made this.',      sub: '(no team. no budget. just vibes and suffering.)', btn: 'creator evidence → @byeolingz' },
        { emoji: '🤞', msg: 'Oops — made by me.',     sub: '(every single pixel. unfortunately.)', btn: 'proof of life → @byeolingz' },
      ];
      const egg = eggs[easterEmojiIdx % eggs.length];
      easterEmojiIdx++;
      document.getElementById('easter-emoji').textContent = egg.emoji;
      document.getElementById('easter-msg').innerHTML = egg.msg + `<em>${egg.sub}</em>`;
      document.getElementById('easter-link').textContent = egg.btn;
      document.getElementById('easter-overlay').classList.add('show');
      launchConfetti();
    }
  });
});

function closeEaster(e) {
  if (e && e.currentTarget !== e.target) return;
  document.getElementById('easter-overlay').classList.remove('show');
  stopConfetti();
}

// ── CONFETTI ──
let confettiAnim;
function launchConfetti() {
  const canvas = document.getElementById('easter-confetti');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#fff','#f0e68c','#ffb347','#87ceeb','#dda0dd','#98fb98','#ff9999'];
  const pieces = Array.from({length: 90}, () => ({
    x: canvas.width / 2 + (Math.random() - 0.5) * 200,
    y: canvas.height / 2 + (Math.random() - 0.5) * 100,
    vx: (Math.random() - 0.5) * 14,
    vy: (Math.random() - 1.2) * 12,
    size: Math.random() * 7 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
    rot: Math.random() * Math.PI * 2,
    rotV: (Math.random() - 0.5) * 0.25,
    alpha: 1,
    gravity: 0.35 + Math.random() * 0.2,
  }));

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.99;
      p.rot += p.rotV;
      p.alpha -= 0.012;
      if (p.alpha <= 0) return;
      alive = true;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
    if (alive) confettiAnim = requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  cancelAnimationFrame(confettiAnim);
  draw();
}

function stopConfetti() {
  cancelAnimationFrame(confettiAnim);
  const canvas = document.getElementById('easter-confetti');
  if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

// ── 모바일 인트로 (Safari 완전 호환) ──
(function() {
  // 순수하게 화면 너비만으로 판단
  if (window.innerWidth > 800) return;

  // 모바일에서만 실행 — 메뉴를 인트로 끝날 때까지 숨김
  var _menu = document.getElementById('m-home-menu');
  if (_menu) { _menu.style.opacity = '0'; _menu.style.pointerEvents = 'none'; }

  function runIntro() {
    var logo    = document.getElementById('m-intro-logo');
    var overlay = document.getElementById('m-intro-overlay');
    var dot     = document.getElementById('m-intro-dot');
    var menu    = document.getElementById('m-home-menu');

    if (!logo || !overlay) return;

    // Safari: 초기 위치를 확실히 페인트시킨 뒤 시작
    void logo.offsetHeight;
    void overlay.offsetHeight;

    // 1단계: 200ms 후 로고를 헤더 위치로 이동
    setTimeout(function() {
      logo.classList.add('moved');
    }, 200);

    // 2단계: 1.4s 후 트랜지션 끄고 + 점 깜빡임
    setTimeout(function() {
      logo.classList.add('settled');
      if (dot) dot.classList.add('blink');
    }, 1400);

    // 3단계: 2.1s 후 오버레이 페이드아웃 + 메뉴 등장
    setTimeout(function() {
      overlay.classList.add('done');
      if (dot) {
        dot.style.opacity = '0';
        dot.classList.remove('blink');
      }
      if (menu) {
        menu.style.opacity = '1';
        menu.style.pointerEvents = 'auto';
      }
    }, 2100);
  }

  // load 완료 + 300ms 여유
  var _done = false;
  function _go() { if (_done) return; _done = true; setTimeout(runIntro, 300); }
  if (document.readyState === 'complete') {
    _go();
  } else {
    window.addEventListener('load', _go);
    document.addEventListener('DOMContentLoaded', function() { setTimeout(_go, 2000); });
  }
})();
  var _done = false;
  function _go() { if (_done) return; _done = true; setTimeout(runIntro, 150); }
  if (document.readyState === 'complete') {
    _go();
  } else {
    window.addEventListener('load', _go);
    document.addEventListener('DOMContentLoaded', function() { setTimeout(_go, 3000); });
  }
})();
