/**
 * ARES-E Advanced Interactive Terminal Edge Worker
 * Modular architecture: routes serve HTML shell, CSS, JS, and lazy-loaded API data.
 *
 * Routes:
 *   GET /                   → HTML terminal shell
 *   GET /style.css          → Terminal stylesheet
 *   GET /worker-terminal.js → Client-side terminal logic
 *   GET /api/config         → CFG + ASC + boot log (small, inline-safe)
 *   GET /api/vfs            → Virtual File System data (lazy loaded)
 *   GET /api/scenarios      → Simulation scenarios (lazy loaded)
 */

import { CFG } from './config/cfg.js';
import { VFS } from './config/vfs.js';
import { SIM_SCENARIOS } from './config/scenarios.js';
import { getAsciiArt } from './config/ascii.js';
import { getBootLog } from './config/boot.js';
import CSS_TEXT from './style.css';
import TERMINAL_JS_TEXT from './worker-terminal.js';

/** Shared security headers applied to all responses */
function securityHeaders(extra = {}) {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy':
      "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'",
    ...extra
  };
}

/** Serve the main HTML shell page */
function serveHTML() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DaScient ARES-E | MYSTIC DEPOT Environment</title>
<link rel="stylesheet" href="/style.css">
</head>
<body>
<div class="crt" id="term">
  <div id="out"></div>
  <div class="in-ln" id="in-wrp" style="display:none">
    <span class="ps" id="ph"></span>
    <input type="text" id="cmd" autocomplete="off" spellcheck="false" autofocus>
    <span class="cur" id="cur"></span>
  </div>
</div>
<script src="/api/config"></script>
<script src="/worker-terminal.js"></script>
</body>
</html>`;
  return new Response(html, {
    headers: securityHeaders({
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
    })
  });
}

/** Serve the extracted CSS stylesheet */
function serveCSS() {
  return new Response(CSS_TEXT, {
    headers: securityHeaders({
      'Content-Type': 'text/css;charset=UTF-8',
      'Cache-Control': 'public, max-age=3600'
    })
  });
}

/** Serve the client-side terminal JavaScript */
function serveTerminalJS() {
  return new Response(TERMINAL_JS_TEXT, {
    headers: securityHeaders({
      'Content-Type': 'application/javascript;charset=UTF-8',
      'Cache-Control': 'public, max-age=3600'
    })
  });
}

/** Serve inline config as a script (CFG, ASC, bLg — small enough to inline) */
function serveConfig() {
  const ASC = getAsciiArt(CFG);
  const bLg = getBootLog(CFG);
  const script = `var CFG=${JSON.stringify(CFG)};
var ASC=${JSON.stringify(ASC)};
var bLg=${JSON.stringify(bLg)};`;
  return new Response(script, {
    headers: securityHeaders({
      'Content-Type': 'application/javascript;charset=UTF-8',
      'Cache-Control': 'public, max-age=3600'
    })
  });
}

/** Serve VFS data as JSON (lazy loaded by client) */
function serveVFS() {
  return new Response(JSON.stringify(VFS), {
    headers: securityHeaders({
      'Content-Type': 'application/json;charset=UTF-8',
      'Cache-Control': 'public, max-age=3600'
    })
  });
}

/** Serve simulation scenarios as JSON (lazy loaded by client) */
function serveScenarios() {
  return new Response(JSON.stringify(SIM_SCENARIOS), {
    headers: securityHeaders({
      'Content-Type': 'application/json;charset=UTF-8',
      'Cache-Control': 'public, max-age=3600'
    })
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    switch (path) {
      case '/':
        return serveHTML();
      case '/style.css':
        return serveCSS();
      case '/worker-terminal.js':
        return serveTerminalJS();
      case '/api/config':
        return serveConfig();
      case '/api/vfs':
        return serveVFS();
      case '/api/scenarios':
        return serveScenarios();
      default:
        return new Response('Not Found', {
          status: 404,
          headers: securityHeaders({ 'Content-Type': 'text/plain' })
        });
    }
  }
};
