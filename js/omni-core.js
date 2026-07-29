// Omni UI wiring: modules grid, ASAC auto-unlock, console simulator.
// Defensive: no errors if elements missing.

const CORES = [
  'UANE', 'QESC', 'IKCL', 'ORFS', 'UEMH', 'TOSAO', 'IAAV', 'ASAC', 'SAIC', 'ERLM'
];

function createModuleCard(id) {
  const card = document.createElement('div');
  card.className = 'module-card';
  card.setAttribute('role', 'listitem');
  card.innerHTML = `
    <div>
      <div class="module-title">${id}</div>
      <div class="module-sub">Core ${id} — operational</div>
    </div>
    <div class="module-meta"><small>Latency: ${Math.floor(Math.random()*40)+10}ms</small></div>
  `;
  return card;
}

function populateModules() {
  const grid = document.getElementById('modules-grid');
  if (!grid) return;
  grid.innerHTML = '';
  CORES.forEach(core => grid.appendChild(createModuleCard(core)));
}

function appendConsoleLine(content, cls = '') {
  const win = document.getElementById('console-window');
  if (!win) return;
  const line = document.createElement('div');
  line.className = `console-line ${cls}`.trim();
  line.textContent = content;
  win.appendChild(line);
  // keep scroll locked to bottom
  win.scrollTop = win.scrollHeight;
}

function simulateSaicResponse(command) {
  // Simple contextual reply referencing coherence and active cores.
  const coherenceText = document.querySelector('.coherence-label')?.textContent || 'Coherence unknown';
  const active = CORES.slice(0, 4).join(', ');
  return `[SAIC] Acknowledged: "${command}". ${coherenceText}. Active cores: ${active}.`;
}

function wireConsole() {
  const input = document.getElementById('console-input');
  const btn = document.getElementById('btn-console-send');

  async function onSend() {
    if (!input) return;
    const text = input.value?.trim();
    if (!text) return;
    appendConsoleLine(`[SO] ${text}`, 'system'); // user line
    input.value = '';
    // simulate thinking
    appendConsoleLine('[SAIC] Processing…', 'system');
    setTimeout(() => {
      // remove last "Processing…" line for cleanliness
      const win = document.getElementById('console-window');
      if (win) {
        const nodes = win.querySelectorAll('.console-line');
        const last = nodes[nodes.length - 1];
        if (last && last.textContent && last.textContent.includes('Processing')) {
          last.remove();
        }
      }
      const reply = simulateSaicResponse(text);
      appendConsoleLine(reply, ''); // normal reply
    }, 650 + Math.random() * 600);
  }

  if (btn) btn.addEventListener('click', (e) => { e.preventDefault(); onSend(); });
  if (input) input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); }
  });
}

function autoUnlockAsac() {
  // Auto-unlock behavior: hide the ASAC overlay and reveal main nexus.
  const asac = document.getElementById('asac-gate');
  const root = document.getElementById('nexus-root');

  if (asac) asac.style.display = 'none';
  if (root) {
    root.classList.remove('hidden');
    root.style.display = ''; // in case CSS missing
  }

  // Keep the form functional if someone chooses to submit manually.
  const form = document.getElementById('asac-form');
  if (form) {
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      if (asac) asac.style.display = 'none';
      if (root) root.classList.remove('hidden');
    });

    const skip = document.getElementById('asac-skip');
    if (skip) skip.addEventListener('click', () => {
      if (asac) asac.style.display = 'none';
      if (root) root.classList.remove('hidden');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    populateModules();
    wireConsole();
    autoUnlockAsac();
    // initial system message in console
    appendConsoleLine('[SYSTEM] OmniGenesis Nexus online. Awaiting Sovereign command…', 'system');
  } catch (err) {
    console.error('Omni core init failed', err);
  }
});
