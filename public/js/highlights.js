(() => {
  const section = document.querySelector('.highlights');
  if (!section) return;

  const stack = section.querySelector('.highlight-stack');
  const cards = stack ? Array.from(stack.querySelectorAll('.highlight-card')) : [];
  if (cards.length < 2) return;

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const getDurationMs = () => {
    const raw = getComputedStyle(section).getPropertyValue('--hl-duration').trim();
    if (!raw) return 6000;
    if (raw.endsWith('ms')) return Math.max(0, parseFloat(raw));
    if (raw.endsWith('s')) return Math.max(0, parseFloat(raw) * 1000);
    const n = parseFloat(raw);
    return Number.isFinite(n) ? Math.max(0, n) : 6000;
  };

  let durationMs = getDurationMs();
  let current = Math.max(0, cards.findIndex(c => c.classList.contains('active')));
  let intervalId = null;
  let exitTimeoutId = null;

  const restartProgress = (card) => {
    const fill = card.querySelector('.progress-fill');
    if (!fill) return;

    // Reset the animation reliably by forcing a reflow between toggles.
    // This is a common technique (remove animation -> reflow -> re-add).
    // https://css-tricks.com/restart-css-animation/
    fill.style.animation = 'none';
    void fill.offsetWidth; // force reflow
    fill.style.animation = '';
  };

  const applyState = (activeIndex) => {
    const count = cards.length;
    const i0 = activeIndex % count;
    const i1 = (activeIndex + 1) % count;
    const i2 = (activeIndex + 2) % count;

    cards.forEach(c => {
      c.classList.remove('active', 'behind', 'behind-1', 'behind-2', 'is-exiting');
      c.setAttribute('aria-hidden', 'true');
    });

    cards[i0].classList.add('active');
    cards[i0].setAttribute('aria-hidden', 'false');
    cards[i1].classList.add('behind', 'behind-1');
    cards[i2].classList.add('behind', 'behind-2');

    restartProgress(cards[i0]);
  };

  const stop = () => {
    if (intervalId) window.clearInterval(intervalId);
    intervalId = null;

    if (exitTimeoutId) window.clearTimeout(exitTimeoutId);
    exitTimeoutId = null;
  };

  const step = () => {
    const leaving = cards[current];
    leaving.classList.add('is-exiting');

    // Small exit animation, then swap the stacking classes.
    exitTimeoutId = window.setTimeout(() => {
      leaving.classList.remove('is-exiting');
      current = (current + 1) % cards.length;
      applyState(current);
    }, 320);
  };

  const start = () => {
    stop();
    durationMs = getDurationMs();
    applyState(current);

    if (prefersReducedMotion || durationMs <= 0) return;
    intervalId = window.setInterval(step, durationMs);
  };

  // Click to bring a card to the front (optional but feels good).
  cards.forEach((card, idx) => {
    card.addEventListener('click', (e) => {
      // Don't block normal navigation on buttons/links.
      if (e.target.closest('a')) return;

      current = idx;
      start();
    });
  });

  // Pause when tab is hidden.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  // If CSS variables load late, re-sync duration.
  window.addEventListener('resize', () => {
    const next = getDurationMs();
    if (Math.abs(next - durationMs) > 50) start();
  });

  start();
})();
