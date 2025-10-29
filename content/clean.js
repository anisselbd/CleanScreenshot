// content/clean.js — SAFE: no auto-clicks, only hide overlays
(() => {
  const DEBUG = false;
  const log = (...a) => DEBUG && console.log("[CleanShot]", ...a);

  // Sélecteurs larges mais inoffensifs (on masque sans cliquer)
  const SELECTORS = [
    // Modals / overlays courants
    '[role="dialog"]', '[aria-modal="true"]', '.modal', '.Dialog', '.dialog', '.overlay', '.backdrop',
    // Bannières cookies / consentement
    '[id*="cookie"]', '[class*="cookie"]',
    '[id*="consent"]', '[class*="consent"]',
    '#onetrust-banner-sdk', '.ot-sdk-container', '.truste_banner', '#sp_message_container_',
    // Bars fixes fréquentes
    '.sticky', '.fixed', '.navbar-fixed', '.header-fixed', '.footer-fixed'
  ];

  function hideEl(el) {
    try {
      el.setAttribute('data-cleanshot-hidden', '1');
      el.style.setProperty('display', 'none', 'important');
      el.style.setProperty('visibility', 'hidden', 'important');
      el.style.setProperty('pointer-events', 'none', 'important');
    } catch {}
  }

  function removeHardBlocks() {
    let hidden = 0;

    // 1) Masque les éléments par sélecteurs connus
    for (const sel of SELECTORS) {
      document.querySelectorAll(sel).forEach(el => { hideEl(el); hidden++; });
    }

    // 2) Masque les éléments très “overlay” (position:fixed + gros z-index + recouvrement)
    const vw = window.innerWidth, vh = window.innerHeight;
    const all = Array.from(document.querySelectorAll('body *'));
    for (const el of all) {
      const st = getComputedStyle(el);
      if (st.position === 'fixed' || st.position === 'sticky') {
        const zi = parseInt(st.zIndex || '0', 10);
        if (zi >= 1000) {
          const r = el.getBoundingClientRect();
          const coversWidth = r.width >= vw * 0.8;
          const coversHeight = r.height >= vh * 0.2;
          if (coversWidth && coversHeight) {
            hideEl(el); hidden++;
          }
        }
      }
    }

    // 3) Débloque le scroll / enlève effets
    document.documentElement.style.removeProperty('filter');
    document.body.style.removeProperty('filter');
    document.documentElement.style.removeProperty('overflow');
    document.body.style.removeProperty('overflow');
    document.body.classList.remove('modal-open', 'overflow-hidden');

    log("Hidden elements:", hidden);
    return hidden;
  }

  try {
    removeHardBlocks();
  } catch (e) {
    log("Clean error:", e);
  }
})();