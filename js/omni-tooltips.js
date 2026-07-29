(function () {
  function initModuleTooltips() {
    const cards = Array.from(document.querySelectorAll('.module-card'));
    if (!cards.length) return;

    // pointerdown / touch toggle (keeps existing behavior)
    cards.forEach(card => {
      card.addEventListener('pointerdown', function (e) {
        if (e.button && e.button !== 0) return;
        const open = card.getAttribute('data-tooltip-open') === 'true';
        cards.forEach(c => c.removeAttribute('data-tooltip-open'));
        if (!open) card.setAttribute('data-tooltip-open', 'true');
        e.stopPropagation();
      });

      // ensure keyboard focus shows tooltip
      card.addEventListener('focus', function () {
        cards.forEach(c => c.removeAttribute('data-tooltip-open'));
        card.setAttribute('data-tooltip-open', 'true');
      });
      card.addEventListener('blur', function () {
        card.removeAttribute('data-tooltip-open');
      });

      // mouse enter/leave to make hover -> tooltip robust
      const tooltip = card.querySelector('.tooltip');
      card.addEventListener('mouseenter', function () {
        card.setAttribute('data-tooltip-open', 'true');
      });
      card.addEventListener('mouseleave', function () {
        setTimeout(() => {
          if (!(tooltip && tooltip.matches(':hover'))) {
            card.removeAttribute('data-tooltip-open');
          }
        }, 30);
      });
      if (tooltip) {
        tooltip.addEventListener('mouseenter', function () {
          card.setAttribute('data-tooltip-open', 'true');
        });
        tooltip.addEventListener('mouseleave', function () {
          setTimeout(() => {
            if (!card.matches(':hover') && !card.matches(':focus-within')) {
              card.removeAttribute('data-tooltip-open');
            }
          }, 30);
        });
      }
    });

    // close on outside click/tap
    document.addEventListener('pointerdown', function () {
      cards.forEach(c => c.removeAttribute('data-tooltip-open'));
    });

    // close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') cards.forEach(c => c.removeAttribute('data-tooltip-open'));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModuleTooltips);
  } else {
    initModuleTooltips();
  }
})();
