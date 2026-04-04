/**
 * ARES-E Advanced Interactive Terminal — Client-Side Logic
 * Loaded by the Cloudflare Worker HTML shell.
 * VFS and SIM_SCENARIOS are fetched lazily from API endpoints.
 */

/* ─── Constants ─── */
const ALLOWED_COMMANDS = [
  'ls','cat','cd','tree','analyze','clear','help','whoami',
  'pwd','date','echo','search','notebook','sim','status',
  'export','version','history'
];

const HISTORY_KEY = 'ares_e_cmd_history';
const MAX_HISTORY = 200;

/* ─── Globals (populated lazily) ─── */
let VFS = null;
let SIM_SCENARIOS = null;
let cPt = [];

/* ─── Helpers ─── */

/** Escape HTML entities to prevent injection */
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Sanitize user input: strip control chars, limit length */
function sanitizeInput(raw) {
  return raw
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .slice(0, 500);
}

/** Debug logger (controlled by CFG.debug) */
function dbg(...args) {
  if (CFG.debug) console.log('[ARES-E DBG]', ...args);
}

/** Load VFS data lazily from API */
async function loadVFS() {
  if (VFS) return VFS;
  try {
    const res = await fetch('/api/vfs');
    if (!res.ok) throw new Error(`VFS load failed: ${res.status}`);
    VFS = await res.json();
    dbg('VFS loaded', Object.keys(VFS).length, 'entries');
    return VFS;
  } catch (e) {
    dbg('VFS load error', e);
    VFS = {};
    return VFS;
  }
}

/** Load simulation scenarios lazily from API */
async function loadScenarios() {
  if (SIM_SCENARIOS) return SIM_SCENARIOS;
  try {
    const res = await fetch('/api/scenarios');
    if (!res.ok) throw new Error(`Scenarios load failed: ${res.status}`);
    SIM_SCENARIOS = await res.json();
    dbg('Scenarios loaded', Object.keys(SIM_SCENARIOS).length, 'entries');
    return SIM_SCENARIOS;
  } catch (e) {
    dbg('Scenarios load error', e);
    SIM_SCENARIOS = {};
    return SIM_SCENARIOS;
  }
}

/** Load/save command history from localStorage */
function loadHistory() {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveHistory(h) {
  try {
    const trimmed = h.slice(-MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch { /* localStorage unavailable */ }
}

/* ─── Terminal Class ─── */
class Term {
  constructor() {
    this.o = document.getElementById('out');
    this.iw = document.getElementById('in-wrp');
    this.i = document.getElementById('cmd');
    this.ph = document.getElementById('ph');
    this.c = document.getElementById('term');
    this.l = 1;           // locked
    this.h = loadHistory();
    this.hi = this.h.length;
    this.sk = 0;           // skip animation
    this.ini();
  }

  async ini() {
    this.up();
    this.ev();
    // Show loading state
    await this.pr('<span class="loader"></span> Initializing ARES-E environment...', 'sys');
    // Lazy-load VFS and scenarios in parallel
    await Promise.all([loadVFS(), loadScenarios()]);
    // Boot sequence
    if (CFG.boot) await this.bt();
    await this.pr(`<div class="asc">${ASC.l}</div>`);
    await this.pr("Welcome to <span class='hlt'>MYSTIC DEPOT Shell</span><br/>");
    await this.pr(`Logged in as <span class="hlt">${CFG.usr}</span> | ${CFG.ver}\n`);
    await this.pr("Type <span class='hlt'>help</span> for commands | <span class='hlt'>notebook list</span> for demos | <span class='hlt'>sim list</span> for simulations.<br/><br/>");
    this.ul();
  }

  sl(ms) { return new Promise(r => setTimeout(r, ms)) }

  sb() { this.c.scrollTop = this.c.scrollHeight }

  gD() {
    if (!VFS) return {};
    let d = VFS;
    for (let p of cPt) {
      if (!d[p] || !d[p].contents) return {};
      d = d[p].contents;
    }
    return d;
  }

  up() {
    let s = `<span class="pu">${CFG.usr}@${CFG.hst}</span>:<span class="pd">~/${cPt.join('/')}</span>$ `;
    this.ph.innerHTML = s;
    return s;
  }

  lk() {
    this.l = 1;
    this.sk = 0;
    this.iw.style.display = 'none';
    this.i.disabled = 1;
    this.c.classList.add('lck');
  }

  ul() {
    this.l = 0;
    this.iw.style.display = 'flex';
    this.i.disabled = 0;
    this.i.value = '';
    this.c.classList.remove('lck');
    this.i.focus();
    this.sb();
    this.up();
  }

  async pr(h, c = "ln") {
    let d = document.createElement('div');
    d.className = c;
    d.innerHTML = h;
    this.o.appendChild(d);
    this.sb();
  }

  /** Optimized typing animation with batch rendering */
  async ty(t) {
    let d = document.createElement('div');
    d.className = "ln";
    this.o.appendChild(d);
    let i = 0, it = 0, ct = "", buf = "";
    const BATCH = 5; // characters per batch for performance
    while (i < t.length) {
      if (this.sk) {
        d.innerHTML = t.replace(/\n/g, "<br/>");
        break;
      }
      let ch = t.charAt(i);
      if (ch === '<') { it = 1; ct = ch }
      else if (ch === '>') { it = 0; ct += ch; buf += ct; ct = "" }
      else if (it) { ct += ch }
      else {
        if (ch === '\n') {
          buf += "<br/>";
          d.innerHTML = buf;
          if (!this.sk) await this.sl(CFG.lDel);
        } else {
          buf += esc(ch);
          // Batch render every BATCH chars for performance
          if (buf.length % BATCH === 0) {
            d.innerHTML = buf;
          }
          if (!this.sk) await this.sl(CFG.tSpd);
        }
      }
      this.sb();
      i++;
    }
    d.innerHTML = buf + "<br/>";
    this.sb();
  }

  async bt() {
    this.lk();
    for (let line of bLg) {
      await this.pr(line, "sys");
      await this.sl(CFG.bSpd + (Math.random() * 40));
    }
  }

  ev() {
    document.addEventListener('click', () => { if (!this.l) this.i.focus() });
    document.addEventListener('keydown', (e) => {
      if (this.l && (e.key === ' ' || e.key === 'Enter')) this.sk = 1;
    });

    this.i.addEventListener('keydown', async (e) => {
      if (this.l) return;
      if (e.key === 'Enter') {
        let raw = this.i.value;
        let cmd = sanitizeInput(raw).trim();
        this.i.value = cmd; // reflect sanitized value
        if (cmd) {
          this.h.push(cmd);
          this.hi = this.h.length;
          saveHistory(this.h);
          dbg('exec:', cmd);
        }
        await this.pr(this.up() + esc(cmd));
        this.lk();
        await this.ex(cmd);
        this.ul();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.hi > 0) this.i.value = this.h[--this.hi];
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.hi < this.h.length - 1) this.i.value = this.h[++this.hi];
        else { this.hi = this.h.length; this.i.value = "" }
      } else if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        await this.pr(this.up() + esc(this.i.value) + "^C");
        this.i.value = "";
        this.sb();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this.tabComplete();
      }
    });
  }

  /** Tab completion with multi-match display */
  tabComplete() {
    let p = this.i.value.split(' '), lp = p[p.length - 1];
    if (!lp && p.length <= 1) return;

    if (p.length === 1) {
      let m = ALLOWED_COMMANDS.filter(k => k.startsWith(lp));
      if (m.length === 1) {
        this.i.value = m[0];
      } else if (m.length > 1) {
        // Show all matches
        this.pr(m.join('  '), 'sys');
        // Complete common prefix
        let prefix = m.reduce((a, b) => {
          let i = 0;
          while (i < a.length && i < b.length && a[i] === b[i]) i++;
          return a.slice(0, i);
        });
        if (prefix.length > lp.length) this.i.value = prefix;
      }
    } else if (p[0] === 'cat' || p[0] === 'cd') {
      let dir = this.gD();
      let keys = Object.keys(dir);
      let m = keys.filter(k => k.startsWith(lp));
      if (m.length === 1) {
        p[p.length - 1] = m[0];
        this.i.value = p.join(' ');
      } else if (m.length > 1) {
        this.pr(m.join('  '), 'sys');
        let prefix = m.reduce((a, b) => {
          let i = 0;
          while (i < a.length && i < b.length && a[i] === b[i]) i++;
          return a.slice(0, i);
        });
        if (prefix.length > lp.length) {
          p[p.length - 1] = prefix;
          this.i.value = p.join(' ');
        }
      }
    } else if (p[0] === 'sim' && p[1] === 'run' && SIM_SCENARIOS) {
      let m = Object.keys(SIM_SCENARIOS).filter(k => k.startsWith(lp));
      if (m.length === 1) {
        p[p.length - 1] = m[0];
        this.i.value = p.join(' ');
      } else if (m.length > 1) {
        this.pr(m.join('  '), 'sys');
      }
    } else if (p[0] === 'notebook' && p[1] === 'run' && VFS && VFS.notebooks) {
      let nbs = Object.keys(VFS.notebooks.contents).filter(k =>
        VFS.notebooks.contents[k].type === 'notebook' && k.startsWith(lp)
      );
      if (nbs.length === 1) {
        p[p.length - 1] = nbs[0];
        this.i.value = p.join(' ');
      } else if (nbs.length > 1) {
        this.pr(nbs.join('  '), 'sys');
      }
    }
  }

  async ex(rc) {
    if (!rc) return;
    let a = rc.split(' ').filter(Boolean), c = a[0].toLowerCase();

    // Validate command against allowed list
    if (!ALLOWED_COMMANDS.includes(c)) {
      let suggestion = ALLOWED_COMMANDS.find(k => k.startsWith(c));
      let msg = `bash: ${esc(c)}: command not found.`;
      if (suggestion) msg += ` Did you mean <span class='hlt'>${suggestion}</span>?`;
      msg += ` Type <span class='hlt'>help</span> for available commands.`;
      await this.pr(msg);
      dbg('unknown command:', c);
      return;
    }

    const cmds = {
      'ls': () => this.ls(a),
      'cat': () => this.cat(a),
      'cd': () => this.cd(a),
      'tree': () => this.tr(),
      'analyze': () => this.an(a),
      'clear': () => { this.o.innerHTML = '' },
      'help': () => this.hp(),
      'whoami': () => this.pr(CFG.usr),
      'pwd': () => this.pr("/home/" + CFG.usr + (cPt.length ? "/" + cPt.join('/') : "/")),
      'date': () => this.pr(new Date().toString()),
      'echo': () => this.pr(esc(a.slice(1).join(' ')) || ''),
      'search': () => this.srch(a),
      'notebook': () => this.nb(a),
      'sim': () => this.sm(a),
      'status': () => this.st(),
      'export': () => this.exp(a),
      'version': () => this.pr(CFG.ver),
      'history': () => this.showHistory()
    };

    await cmds[c]();
  }

  async showHistory() {
    if (!this.h.length) {
      await this.pr('<span class="sys">(no history)</span>');
      return;
    }
    let o = '<span class="hlt">Command History</span><br/><br/>';
    let start = Math.max(0, this.h.length - 50);
    for (let i = start; i < this.h.length; i++) {
      o += `  <span class="sys">${(i + 1).toString().padStart(4)}</span>  ${esc(this.h[i])}<br/>`;
    }
    await this.pr(o);
  }

  async ls(a) {
    let d = this.gD(), o = "", k = Object.keys(d);
    if (!k.length) { await this.pr("<span class='sys'>(empty)</span>"); return }
    if (a.includes('-l') || a.includes('-la')) {
      o += `total ${k.length * 4}\n`;
      if (cPt.length) o += `drwxr-xr-x 2 ${CFG.usr} staff 4096 Mar 16 12:40 <span class="dl">..</span><br/>`;
      for (let x of k) {
        let isD = d[x].type === 'dir', isN = d[x].type === 'notebook';
        let p = isD ? "drwxr-xr-x" : "-rw-r--r--";
        let s = isD ? 4096 : (d[x].content ? d[x].content.length : 2048);
        let cl = isD ? "dl" : isN ? "inf" : "fl";
        o += `${p} 1 ${CFG.usr} staff ${s.toString().padStart(5, ' ')} Mar 16 12:40 <span class="${cl}">${esc(x)}</span><br/>`;
      }
    } else {
      for (let x of k) {
        let isD = d[x].type === 'dir', isN = d[x].type === 'notebook';
        let cl = isD ? "dl" : isN ? "inf" : "fl";
        o += `<span class="${cl}">${esc(x)}</span>  `;
      }
      o += "<br/>";
    }
    await this.pr(o);
  }

  async cd(a) {
    if (a.length < 2 || a[1] === '~') { cPt = []; return }
    let t = a[1];
    if (t === '..') { if (cPt.length) cPt.pop(); return }
    let d = this.gD();
    if (d[t]) {
      if (d[t].type === 'dir') cPt.push(t);
      else await this.pr(`cd: ${esc(t)}: Not a directory`);
    } else {
      await this.pr(`cd: ${esc(t)}: No such file or directory`);
    }
  }

  async cat(a) {
    if (a.length < 2) return await this.pr("cat: missing operand. Usage: cat &lt;filename&gt;");
    let f = a[1], d = this.gD();
    if (d[f]) {
      if (d[f].type === 'file') {
        await this.pr("<span class='sys'>[Press SPACE to skip animation]</span>");
        await this.sl(200);
        await this.ty(d[f].content);
      } else if (d[f].type === 'notebook') {
        await this.pr(`cat: ${esc(f)}: Is a notebook — use <span class='hlt'>notebook run ${esc(f)}</span> instead`);
      } else {
        await this.pr(`cat: ${esc(f)}: Is a directory — use <span class='hlt'>ls</span> or <span class='hlt'>cd ${esc(f)}</span>`);
      }
    } else {
      // Suggest similar files
      let keys = Object.keys(d);
      let similar = keys.filter(k => k.toLowerCase().includes(f.toLowerCase()));
      let msg = `cat: ${esc(f)}: No such file or directory`;
      if (similar.length) msg += `<br/>Did you mean: ${similar.map(s => `<span class='hlt'>${esc(s)}</span>`).join(', ')}?`;
      await this.pr(msg);
    }
  }

  gT(d, p = "") {
    let k = Object.keys(d), r = "";
    for (let i = 0; i < k.length; i++) {
      let x = k[i], il = (i === k.length - 1), it = d[x];
      let pt = il ? "└── " : "├── ";
      let cl = it.type === 'dir' ? "dl" : it.type === 'notebook' ? "inf" : "fl";
      r += p + pt + `<span class="${cl}">${esc(x)}</span><br/>`;
      if (it.type === 'dir') r += this.gT(it.contents, p + (il ? "    " : "│   "));
    }
    return r;
  }

  async tr() {
    if (!VFS) { await this.pr("<span class='wrn'>VFS not loaded</span>"); return }
    await this.pr("<span class='dl'>ARES-E_Root</span><br/>" + this.gT(VFS));
  }

  async an(a) {
    if (a.length < 2) return await this.pr("Usage: analyze &lt;module&gt;<br/>Modules: <span class='hlt'>ewis</span>, <span class='hlt'>woik</span>, <span class='hlt'>phiak</span>, <span class='hlt'>all</span>");
    let m = a[1].toLowerCase();
    if (m === 'all') {
      await this.pr('<span class="loader"></span> Running full ARES-E telemetry scan...', "sys");
      await this.sl(300);
      await this.pr(ASC.e); await this.sl(100);
      await this.pr(ASC.w); await this.sl(100);
      await this.pr(ASC.p);
    } else {
      await this.pr(`<span class="loader"></span> Initializing telemetry engine for [${esc(m.toUpperCase())}]...`, "sys");
      await this.sl(500);
      if (m === 'ewis') await this.pr(ASC.e);
      else if (m === 'woik') await this.pr(ASC.w);
      else if (m === 'phiak') await this.pr(ASC.p);
      else await this.pr(`analyze: unknown module '${esc(m)}'. Available: <span class='hlt'>ewis</span>, <span class='hlt'>woik</span>, <span class='hlt'>phiak</span>, <span class='hlt'>all</span>`, "wrn");
    }
  }

  async nb(a) {
    if (!VFS || !VFS.notebooks) { await this.pr("<span class='wrn'>Notebooks not yet loaded</span>"); return }
    let sub = a[1] ? a[1].toLowerCase() : 'list';
    if (sub === 'list' || sub === 'ls') {
      let nb = VFS.notebooks.contents;
      let o = "<span class='hlt'>Available Notebook Demos</span><br/><br/>";
      for (let k of Object.keys(nb)) {
        if (nb[k].type === 'notebook') {
          let title = nb[k].cells[0].src.split('\n')[0].replace(/^##\s*/, '');
          o += `  <span class='inf'>●</span> <span class='hlt'>${esc(k)}</span>`;
          o += ` <button class="nb-run-btn" onclick="window._term.nbRun('${esc(k)}')">▶ Run</button>`;
          o += `<br/>    <span class='sys'>${esc(title)}</span><br/>`;
        }
      }
      o += "<br/>Run with: <span class='hlt'>notebook run &lt;name&gt;</span>";
      await this.pr(o);
    } else if (sub === 'run') {
      if (!a[2]) return await this.pr("Usage: notebook run &lt;name&gt;");
      await this.nbRun(a[2]);
    } else {
      await this.pr("notebook: unknown subcommand. Use <span class='hlt'>notebook list</span> or <span class='hlt'>notebook run &lt;name&gt;</span>");
    }
  }

  async nbRun(name) {
    if (!VFS || !VFS.notebooks) return;
    let nb = VFS.notebooks.contents[name];
    if (!nb || nb.type !== 'notebook') {
      return await this.pr(`notebook: '${esc(name)}' not found. Run <span class='hlt'>notebook list</span> to see available demos.`);
    }
    await this.pr("<span class='sys'>[Press SPACE to skip animation]</span>");
    await this.sl(200);
    await this.pr(`<div class="nb"><span class='hlt'>📓 Notebook: ${esc(name)}</span></div>`);
    for (let cell of nb.cells) {
      if (this.sk) break;
      if (cell.type === 'markdown') {
        let html = cell.src
          .replace(/^##\s*(.*)$/mg, "<span class='hlt'>$1</span>")
          .replace(/\*\*(.*?)\*\*/g, "<span class='hlt'>$1</span>")
          .replace(/\n/g, "<br/>");
        await this.pr(`<div class="nb-cell"><span class='sys'>[ Markdown ]</span><br/>${html}</div>`);
      } else if (cell.type === 'code') {
        await this.sl(200);
        let codeHtml = esc(cell.src).replace(/\n/g, "<br/>");
        await this.pr(`<div class="nb-cell"><span class='sys'>[ In ]</span><br/><span class='fl'>${codeHtml}</span></div>`);
        await this.sl(600);
        if (cell.out) {
          let outHtml = esc(cell.out).replace(/\n/g, "<br/>");
          await this.pr(`<div class="nb-out"><span class='sys'>[ Out ]</span><br/>${outHtml}</div>`);
        }
      }
      await this.sl(200);
    }
  }

  async sm(a) {
    if (!SIM_SCENARIOS) { await this.pr("<span class='wrn'>Simulations not yet loaded</span>"); return }
    let sub = a[1] ? a[1].toLowerCase() : 'list';
    if (sub === 'list' || sub === 'ls') {
      let o = "<span class='hlt'>Available Simulations</span><br/><br/>";
      for (let k of Object.keys(SIM_SCENARIOS)) {
        o += `  <span class='inf'>▶</span> <span class='hlt'>${esc(k)}</span> — ${esc(SIM_SCENARIOS[k].name)}<br/>`;
      }
      o += "<br/>Run with: <span class='hlt'>sim run &lt;name&gt;</span>";
      await this.pr(o);
    } else if (sub === 'run') {
      if (!a[2]) return await this.pr("Usage: sim run &lt;name&gt;");
      let sc = SIM_SCENARIOS[a[2]];
      if (!sc) {
        let keys = Object.keys(SIM_SCENARIOS);
        let similar = keys.filter(k => k.includes(a[2]));
        let msg = `sim: '${esc(a[2])}' not found.`;
        if (similar.length) msg += ` Did you mean: ${similar.map(s => `<span class='hlt'>${esc(s)}</span>`).join(', ')}?`;
        msg += ` Run <span class='hlt'>sim list</span> to see available scenarios.`;
        return await this.pr(msg);
      }
      await this.pr(`<span class='hlt'>▶ Running simulation: ${esc(sc.name)}</span>`);
      await this.sl(200);
      for (let step of sc.steps) {
        if (this.sk) break;
        await this.sl(step.d);
        await this.pr(step.msg, "sys");
      }
    } else {
      await this.pr("sim: unknown subcommand. Use <span class='hlt'>sim list</span> or <span class='hlt'>sim run &lt;name&gt;</span>");
    }
  }

  async st() {
    await this.pr("<span class='hlt'>ARES-E System Status</span><br/>", "ln");
    await this.sl(200);
    const now = new Date();
    await this.pr(`Timestamp: ${now.toISOString()} | Node: ${CFG.hst} | ${CFG.ver}`, "sys");
    await this.sl(100);
    await this.pr(ASC.e); await this.sl(100);
    await this.pr(ASC.w); await this.sl(100);
    await this.pr(ASC.p); await this.sl(100);
    await this.pr(`<div class="dp"><span class='hlt'>System Health</span><br/>[VFS]:      ${VFS ? 'MOUNTED' : 'NOT LOADED'}<br/>[Notebooks]: 7 demos ready<br/>[Sims]:     ${SIM_SCENARIOS ? Object.keys(SIM_SCENARIOS).length : 0} scenarios ready<br/>[Privacy]:  ENFORCED<br/>[Uptime]:   ${Math.floor(Math.random() * 720 + 24)}h ${Math.floor(Math.random() * 60)}m</div>`);
  }

  getItemContent(item) {
    if (item.type === 'file') return item.content || '';
    if (item.type === 'notebook') return item.cells ? item.cells.map(c => c.src + (c.out || '')).join(' ') : '';
    return '';
  }

  async srch(a) {
    if (!VFS) { await this.pr("<span class='wrn'>VFS not yet loaded</span>"); return }
    if (a.length < 2) return await this.pr("Usage: search &lt;query&gt;");
    let q = a.slice(1).join(' ').toLowerCase(), results = [], seen = new Set();
    const walk = (node, path) => {
      for (let k of Object.keys(node)) {
        let item = node[k], fullPath = (path ? path + "/" : "") + k;
        if (item.type === 'file' || item.type === 'notebook') {
          let content = this.getItemContent(item).toLowerCase();
          if ((k.toLowerCase().includes(q) || content.includes(q)) && !seen.has(fullPath)) {
            seen.add(fullPath);
            results.push({ path: fullPath, type: item.type });
          }
        } else if (item.type === 'dir') walk(item.contents, fullPath);
      }
    };
    walk(VFS, "");
    if (!results.length) { await this.pr(`search: no results for '${esc(q)}'`); return }
    let o = `<span class='hlt'>Search results for '${esc(q)}':</span><br/><br/>`;
    for (let r of results) o += `  <span class='${r.type === 'notebook' ? 'inf' : 'fl'}'>${esc(r.path)}</span><br/>`;
    await this.pr(o);
  }

  async exp(a) {
    let fmt = a[1] ? a[1].toLowerCase() : 'json';
    if (!['json', 'txt'].includes(fmt)) return await this.pr("Usage: export <span class='hlt'>json</span> | <span class='hlt'>txt</span>");
    let snap = {
      timestamp: new Date().toISOString(),
      node: CFG.hst,
      version: CFG.ver,
      ewis: { pue: 1.15, energy_per_token: "0.004 Wh", grid_stability_pct: 94.2, gpu_utilization_pct: 87 },
      woik: { pressure_psi: 65, pump_specific_energy: "0.8 kWh/m3", turbidity_ntu: 0.18, ph: 7.4, nrw_pct: 8.2 },
      phiak: { pii_blocked: true, ed_occupancy_pct: 82, icu_occupancy_pct: 74, vent_spare_pct: 31, ili_alert: true }
    };
    if (fmt === 'json') {
      await this.pr(`<span class='hlt'>ARES-E Telemetry Export (JSON)</span><br/><span class='sys'>${esc(JSON.stringify(snap, null, 2)).replace(/\n/g, '<br/>')}</span>`);
    } else {
      let lines = [`ARES-E Telemetry Export — ${snap.timestamp}`, `Node: ${snap.node} | Version: ${snap.version}`, ``];
      for (let m of ['ewis', 'woik', 'phiak']) {
        lines.push(`[${m.toUpperCase()}]`);
        for (let [k, v] of Object.entries(snap[m])) lines.push(`  ${k}: ${v}`);
        lines.push('');
      }
      await this.pr(lines.map(l => esc(l)).join('<br/>'));
    }
  }

  async hp() {
    await this.pr(`<span class='hlt'>ARES-E Shell ${CFG.ver}</span><br/>
<span class='hlt'>File System</span>
  <span class='hlt'>ls [-l]</span>         List directory contents
  <span class='hlt'>cd [dir|..|~]</span>   Change directory
  <span class='hlt'>cat [file]</span>      Read file contents
  <span class='hlt'>tree</span>            Display repository tree
  <span class='hlt'>pwd</span>             Print working directory
<span class='hlt'>Analysis</span>
  <span class='hlt'>analyze [m]</span>     Telemetry dashboard (m: ewis|woik|phiak|all)
  <span class='hlt'>status</span>          Full system health dashboard
  <span class='hlt'>export [fmt]</span>    Export telemetry snapshot (fmt: json|txt)
<span class='hlt'>Notebooks</span>
  <span class='hlt'>notebook list</span>   List available notebook demos
  <span class='hlt'>notebook run [n]</span> Run a notebook demo
<span class='hlt'>Simulations</span>
  <span class='hlt'>sim list</span>        List available DDIL simulations
  <span class='hlt'>sim run [s]</span>     Run a simulation scenario
<span class='hlt'>Utilities</span>
  <span class='hlt'>search [query]</span>  Search VFS content
  <span class='hlt'>echo [text]</span>     Print text
  <span class='hlt'>whoami</span>          Current user
  <span class='hlt'>date</span>            Current date/time
  <span class='hlt'>version</span>         ARES-E version
  <span class='hlt'>history</span>         Show command history
  <span class='hlt'>clear</span>           Clear screen
  <span class='hlt'>help</span>            This help message
<br/>TAB: autocomplete | [SPACE]/[ENTER]: skip animation | ↑↓: history`);
  }
}

/* ─── Bootstrap ─── */
window.addEventListener('DOMContentLoaded', () => {
  window._term = new Term();
});
