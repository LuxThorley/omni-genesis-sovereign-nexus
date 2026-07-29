// Lightweight Token Forge (client-side fallback).
// - Generates a base64url payload + random signature (no server secret).
// - Exposes UI wiring for: FORGE, COPY, EXPORT.
// - If you have a server endpoint, swap generateToken() to call fetch('/api/token').

function base64UrlEncode(buffer) {
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function encodeJSON(obj) {
  const encoder = new TextEncoder();
  return base64UrlEncode(encoder.encode(JSON.stringify(obj)));
}

function randomHex(bytes = 24) {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return Array.from(a).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getMatrixState() {
  // Lightweight mirror of the page state — keep in sync with omni-core.js if changed.
  return {
    coherence: document.querySelector('.coherence-label')?.textContent?.trim() || 'unknown',
    activeCores: Array.from(document.querySelectorAll('.module-title')).slice(0, 10).map(n => n.textContent.trim())
  };
}

async function generateClientToken(scope, expirySeconds) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: 'omni-genesis',
    scope,
    exp: expirySeconds > 0 ? now + Number(expirySeconds) : 0,
    iat: now,
    matrix: getMatrixState()
  };

  // Compose simple unsigned-like token with random signature so it's unique.
  const header = { alg: 'NONE', typ: 'JWT' };
  const encoded = `${encodeJSON(header)}.${encodeJSON(payload)}.${randomHex(18)}`;
  return encoded;
}

function showTokenOutput(value) {
  const outWrap = document.getElementById('token-output');
  const outArea = document.getElementById('token-value');
  if (!outWrap || !outArea) return;
  outArea.value = value;
  outWrap.classList.remove('hidden');
  outWrap.style.display = ''; // ensure visible when CSS missing
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  } else {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* swallow */ }
    document.body.removeChild(ta);
    return Promise.resolve();
  }
}

function downloadToken(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function wireTokenUI() {
  const btnForge = document.getElementById('btn-generate-token');
  const btnCopy = document.getElementById('btn-copy-token');
  const btnExport = document.getElementById('btn-export-token');
  const selectScope = document.getElementById('token-scope');
  const selectExpiry = document.getElementById('token-expiry');

  if (btnForge) {
    btnForge.addEventListener('click', async () => {
      try {
        const scope = selectScope?.value || 'full-omni';
        const expiry = selectExpiry?.value ?? '3600';

        // If you want server-signed tokens replace following line with a fetch() to `/api/token`.
        const token = await generateClientToken(scope, expiry);

        showTokenOutput(token);
      } catch (err) {
        console.error('Token generation failed', err);
        alert('Failed to generate token — see console for details.');
      }
    });
  }

  if (btnCopy) {
    btnCopy.addEventListener('click', async () => {
      const outArea = document.getElementById('token-value');
      if (!outArea || !outArea.value) return;
      await copyToClipboard(outArea.value).catch(() => alert('Copy failed — please copy manually.'));
    });
  }

  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const outArea = document.getElementById('token-value');
      if (!outArea || !outArea.value) return;
      downloadToken('sovereign-token.txt', outArea.value);
    });
  }
}

// Initialize token wiring if elements exist
document.addEventListener('DOMContentLoaded', () => {
  try { wireTokenUI(); } catch (e) { console.error('Token UI wiring error', e); }
});
