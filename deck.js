(function () {
  const W = 960;
  const H = 540;

  // アイコンは file:// でも動くようにインラインで差し込む（外部SVGへの参照はブロックされる）
  const ICON_SPRITE = `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
      <symbol id="ico-snip" viewBox="0 0 24 24">
        <path d="M4 8V5a1 1 0 011-1h3M20 8V5a1 1 0 00-1-1h-3M4 16v3a1 1 0 001 1h3M20 16v3a1 1 0 01-1 1h-3"/>
        <path d="M9 9h6v6H9z"/>
      </symbol>
      <symbol id="ico-paste" viewBox="0 0 24 24">
        <rect x="5" y="4" width="14" height="17" rx="2"/>
        <path d="M9 4V2.8h6V4M9 11h6M9 15h4"/>
      </symbol>
      <symbol id="ico-chat" viewBox="0 0 24 24">
        <path d="M20 4H4v11h5l4 4v-4h7z"/>
        <path d="M8 9h8"/>
      </symbol>
      <symbol id="ico-doc" viewBox="0 0 24 24">
        <path d="M14 3H6v18h12V7z"/>
        <path d="M14 3v4h4M9 12h6M9 16h4"/>
      </symbol>
      <symbol id="ico-calendar" viewBox="0 0 24 24">
        <rect x="4" y="5" width="16" height="16" rx="2"/>
        <path d="M4 10h16M9 3v4M15 3v4"/>
      </symbol>
      <symbol id="ico-search" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="6"/>
        <path d="M15.5 15.5L20 20"/>
      </symbol>
      <symbol id="ico-sparkle" viewBox="0 0 24 24">
        <path d="M12 3l2.2 6.3L20.5 11l-6.3 2.2L12 19.5 9.8 13.2 3.5 11l6.3-1.7z"/>
      </symbol>
      <symbol id="ico-bolt" viewBox="0 0 24 24">
        <path d="M13.5 3L6 13.5h5l-1 7.5 8-11.5h-5.5z"/>
      </symbol>
      <symbol id="ico-check" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8.5"/>
        <path d="M8 12.2l2.7 2.7L16 9.5"/>
      </symbol>
      <symbol id="ico-ask" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8.5"/>
        <path d="M9.6 9.4a2.5 2.5 0 114.4 1.8c-.7.8-2 1.2-2 2.4"/>
        <path d="M12 17h.01"/>
      </symbol>
      <symbol id="ico-loop" viewBox="0 0 24 24">
        <path d="M4 12a8 8 0 0113.7-5.6M20 12a8 8 0 01-13.7 5.6"/>
        <path d="M18 3.5v3.5h-3.5M6 20.5V17h3.5"/>
      </symbol>
      <symbol id="ico-mail" viewBox="0 0 24 24">
        <rect x="3" y="5" width="18" height="14" rx="2"/>
        <path d="M3.5 6.5L12 13l8.5-6.5"/>
      </symbol>
      <symbol id="ico-drive" viewBox="0 0 24 24">
        <path d="M4 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2z"/>
      </symbol>
      <symbol id="ico-sheet" viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="2"/>
        <path d="M4 10h16M4 15h16M10 4v16"/>
      </symbol>
      <symbol id="ico-translate" viewBox="0 0 24 24">
        <path d="M4 6h9M8.5 6v2c0 3.3-2 6-4.5 7"/>
        <path d="M6 11c1.5 2.5 3.8 4.2 6.5 5"/>
        <path d="M13 20l3.5-9 3.5 9M14.4 17h4.2"/>
      </symbol>
      <symbol id="ico-image" viewBox="0 0 24 24">
        <rect x="3" y="5" width="18" height="14" rx="2"/>
        <circle cx="8.5" cy="10" r="1.5"/>
        <path d="M4 17l5-4.5 4 3.5 3-2.5 4 3.5"/>
      </symbol>
      <symbol id="ico-code" viewBox="0 0 24 24">
        <path d="M9 8l-4 4 4 4M15 8l4 4-4 4"/>
      </symbol>
      <symbol id="ico-mic" viewBox="0 0 24 24">
        <rect x="9.5" y="3" width="5" height="10" rx="2.5"/>
        <path d="M6.5 11a5.5 5.5 0 0011 0M12 16.5V20M9 20h6"/>
      </symbol>
    </defs></svg>`;

  document.body.insertAdjacentHTML('afterbegin', ICON_SPRITE);

  const root = document.documentElement;
  const stage = document.querySelector('.stage');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const counter = document.querySelector('.hud-meta');
  const progressBar = document.querySelector('.hud-progress > span');
  let index = 0;
  let overview = false;

  slides.forEach(function (slide, i) {
    const page = document.createElement('div');
    page.className = 'slide-page';
    page.textContent = 'P' + (i + 1);
    slide.appendChild(page);
  });

  function fit() {
    if (overview) return;
    const scale = Math.min(window.innerWidth / W, window.innerHeight / H);
    root.style.setProperty('--slide-scale', String(scale));
  }

  function fragments(slide) {
    return Array.from(slide.querySelectorAll('.fragment'));
  }

  // data-focus のリストは、出し終わった行を薄くして今の行に視線を寄せる
  function updateFocus(slide) {
    slide.querySelectorAll('[data-focus]').forEach(function (group) {
      const items = Array.from(group.children);
      const shown = items.filter(function (el) {
        return !el.classList.contains('fragment') || el.classList.contains('is-visible');
      });
      const current = shown[shown.length - 1];
      items.forEach(function (el) {
        el.classList.toggle('is-past', shown.indexOf(el) !== -1 && el !== current);
      });
    });
  }

  // data-count-to="8" を持つ要素は、そのスライドを出したときに数え上げる
  function runCounters(slide) {
    slide.querySelectorAll('[data-count-to]').forEach(function (el) {
      const target = parseFloat(el.dataset.countTo);
      if (isNaN(target)) return;
      const duration = parseInt(el.dataset.countMs || '900', 10);
      const decimals = (el.dataset.countTo.split('.')[1] || '').length;
      const started = performance.now();
      function step(now) {
        const p = Math.min(1, (now - started) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  function show(n, opts) {
    const resetFrags = !opts || opts.resetFrags !== false;
    index = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach((slide, i) => {
      const on = i === index;
      slide.classList.toggle('is-current', on);
      if (resetFrags || !on) {
        fragments(slide).forEach((f) => f.classList.remove('is-visible'));
      }
    });
    updateFocus(slides[index]);
    if (!overview) runCounters(slides[index]);
    if (counter) counter.textContent = (index + 1) + ' / ' + slides.length;
    if (progressBar) {
      progressBar.style.width = slides.length <= 1
        ? '100%'
        : (index / (slides.length - 1) * 100) + '%';
    }
    if (location.hash !== '#' + (index + 1)) {
      history.replaceState(null, '', '#' + (index + 1));
    }
  }

  function next() {
    const hidden = fragments(slides[index]).filter((f) => !f.classList.contains('is-visible'));
    if (hidden.length) {
      hidden[0].classList.add('is-visible');
      updateFocus(slides[index]);
      return;
    }
    show(index + 1);
  }

  function prev() {
    const shown = fragments(slides[index]).filter((f) => f.classList.contains('is-visible'));
    if (shown.length) {
      shown[shown.length - 1].classList.remove('is-visible');
      updateFocus(slides[index]);
      return;
    }
    show(index - 1, { resetFrags: false });
    fragments(slides[index]).forEach((f) => f.classList.add('is-visible'));
    updateFocus(slides[index]);
  }

  function toggleOverview() {
    overview = !overview;
    root.classList.toggle('is-overview', overview);
    if (!overview) fit();
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      root.requestFullscreen().catch(function () {});
    } else {
      document.exitFullscreen();
    }
  }

  window.addEventListener('resize', fit);
  window.addEventListener('fullscreenchange', fit);

  document.addEventListener('keydown', function (e) {
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      alert('← / → / Space  スライド送り\nF  ブラウザ全画面\nEsc  全体一覧\nHome / End  先頭・末尾');
      return;
    }
    if (e.key === 'Escape') {
      if (document.fullscreenElement) return;
      toggleOverview();
      return;
    }
    if (overview) return;
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      prev();
    } else if (e.key === 'Home') {
      e.preventDefault();
      show(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      show(slides.length - 1);
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleFullscreen();
    }
  });

  stage.addEventListener('click', function (e) {
    if (overview) {
      const slide = e.target.closest('.slide');
      if (!slide) return;
      toggleOverview();
      show(slides.indexOf(slide));
      return;
    }
    if (e.clientX > window.innerWidth * 0.6) next();
    else if (e.clientX < window.innerWidth * 0.4) prev();
  });

  window.addEventListener('hashchange', function () {
    const n = parseInt(location.hash.replace('#', ''), 10);
    if (!isNaN(n)) show(n - 1);
  });

  fit();
  const start = parseInt(location.hash.replace('#', ''), 10);
  show(isNaN(start) ? 0 : start - 1);
})();
