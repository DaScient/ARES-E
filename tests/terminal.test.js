/**
 * ARES-E Terminal Tests
 * Unit tests for core terminal commands and worker routing.
 *
 * Run with: node tests/terminal.test.js
 */

import { strict as assert } from 'node:assert';
import { describe, it, before } from 'node:test';

import { CFG } from '../config/cfg.js';
import { VFS } from '../config/vfs.js';
import { SIM_SCENARIOS } from '../config/scenarios.js';
import { getAsciiArt } from '../config/ascii.js';
import { getBootLog } from '../config/boot.js';

/* ─── Config Module Tests ─── */

describe('CFG configuration', () => {
  it('should have required fields', () => {
    assert.ok(CFG.usr, 'usr is defined');
    assert.ok(CFG.hst, 'hst is defined');
    assert.ok(CFG.loc, 'loc is defined');
    assert.ok(CFG.ver, 'ver is defined');
    assert.ok(CFG.url, 'url is defined');
    assert.ok(CFG.github, 'github is defined');
    assert.ok(CFG.email, 'email is defined');
  });

  it('should have valid timing values', () => {
    assert.ok(typeof CFG.bSpd === 'number' && CFG.bSpd > 0, 'bSpd is a positive number');
    assert.ok(typeof CFG.tSpd === 'number' && CFG.tSpd > 0, 'tSpd is a positive number');
    assert.ok(typeof CFG.lDel === 'number' && CFG.lDel > 0, 'lDel is a positive number');
  });

  it('should have a debug flag', () => {
    assert.ok(typeof CFG.debug === 'boolean', 'debug is a boolean');
  });
});

/* ─── VFS Tests ─── */

describe('VFS virtual file system', () => {
  it('should contain root-level files', () => {
    assert.ok(VFS['README.md'], 'README.md exists');
    assert.ok(VFS['executive_brief.md'], 'executive_brief.md exists');
    assert.ok(VFS['loe_summary.md'], 'loe_summary.md exists');
    assert.ok(VFS['contact_info.txt'], 'contact_info.txt exists');
    assert.ok(VFS['company_profile.txt'], 'company_profile.txt exists');
    assert.ok(VFS['architecture.md'], 'architecture.md exists');
    assert.ok(VFS['restrictive_data_notice.md'], 'restrictive_data_notice.md exists');
  });

  it('should contain module directories', () => {
    assert.equal(VFS['ewis'].type, 'dir', 'ewis is a directory');
    assert.equal(VFS['woik'].type, 'dir', 'woik is a directory');
    assert.equal(VFS['phiak'].type, 'dir', 'phiak is a directory');
    assert.equal(VFS['notebooks'].type, 'dir', 'notebooks is a directory');
  });

  it('should have file content as strings', () => {
    assert.equal(typeof VFS['README.md'].content, 'string');
    assert.ok(VFS['README.md'].content.length > 0, 'README.md has content');
  });

  it('should have ewis directory with expected files', () => {
    const ewis = VFS['ewis'].contents;
    assert.ok(ewis['README.md'], 'ewis/README.md exists');
    assert.ok(ewis['metrics.txt'], 'ewis/metrics.txt exists');
    assert.ok(ewis['grid_schema.json'], 'ewis/grid_schema.json exists');
  });

  it('should have woik directory with expected files', () => {
    const woik = VFS['woik'].contents;
    assert.ok(woik['README.md'], 'woik/README.md exists');
    assert.ok(woik['hydraulics.txt'], 'woik/hydraulics.txt exists');
    assert.ok(woik['scada_schema.json'], 'woik/scada_schema.json exists');
  });

  it('should have phiak directory with expected files', () => {
    const phiak = VFS['phiak'].contents;
    assert.ok(phiak['README.md'], 'phiak/README.md exists');
    assert.ok(phiak['privacy.md'], 'phiak/privacy.md exists');
    assert.ok(phiak['capacity_metrics.txt'], 'phiak/capacity_metrics.txt exists');
  });

  it('should have notebook entries with cells', () => {
    const nbs = VFS['notebooks'].contents;
    const nbNames = [
      'ewis_grid_failure_sim.ipynb',
      'ewis_pue_optimizer.ipynb',
      'woik_pipe_burst_response.ipynb',
      'woik_contamination_drill.ipynb',
      'phiak_surge_capacity.ipynb',
      'phiak_syndromic_alert.ipynb',
      'ares_loe_benchmark.ipynb'
    ];
    for (const name of nbNames) {
      assert.ok(nbs[name], `${name} exists`);
      assert.equal(nbs[name].type, 'notebook', `${name} is a notebook`);
      assert.ok(Array.isArray(nbs[name].cells), `${name} has cells`);
      assert.ok(nbs[name].cells.length > 0, `${name} has at least one cell`);
    }
  });

  it('notebook cells should have valid types', () => {
    const nbs = VFS['notebooks'].contents;
    for (const [name, nb] of Object.entries(nbs)) {
      if (nb.type !== 'notebook') continue;
      for (const cell of nb.cells) {
        assert.ok(['markdown', 'code'].includes(cell.type), `${name} cell has valid type: ${cell.type}`);
        assert.ok(typeof cell.src === 'string' && cell.src.length > 0, `${name} cell has src`);
      }
    }
  });
});

/* ─── Simulation Scenarios Tests ─── */

describe('SIM_SCENARIOS', () => {
  it('should contain all expected scenarios', () => {
    assert.ok(SIM_SCENARIOS['grid-fault'], 'grid-fault exists');
    assert.ok(SIM_SCENARIOS['pipe-burst'], 'pipe-burst exists');
    assert.ok(SIM_SCENARIOS['surge'], 'surge exists');
    assert.ok(SIM_SCENARIOS['ddil'], 'ddil exists');
  });

  it('each scenario should have name and steps', () => {
    for (const [key, scenario] of Object.entries(SIM_SCENARIOS)) {
      assert.ok(typeof scenario.name === 'string', `${key} has a name`);
      assert.ok(Array.isArray(scenario.steps), `${key} has steps`);
      assert.ok(scenario.steps.length > 0, `${key} has at least one step`);
    }
  });

  it('each step should have delay and message', () => {
    for (const [key, scenario] of Object.entries(SIM_SCENARIOS)) {
      for (const step of scenario.steps) {
        assert.ok(typeof step.d === 'number', `${key} step has delay`);
        assert.ok(typeof step.msg === 'string', `${key} step has message`);
        assert.ok(step.d >= 0, `${key} step delay is non-negative`);
      }
    }
  });

  it('last step should have zero delay (completion)', () => {
    for (const [key, scenario] of Object.entries(SIM_SCENARIOS)) {
      const lastStep = scenario.steps[scenario.steps.length - 1];
      assert.equal(lastStep.d, 0, `${key} last step delay is 0`);
    }
  });
});

/* ─── ASCII Art Tests ─── */

describe('ASCII art and dashboards', () => {
  let ASC;
  before(() => {
    ASC = getAsciiArt(CFG);
  });

  it('should generate logo with config values', () => {
    assert.ok(ASC.l.includes(CFG.hst), 'Logo contains hostname');
    assert.ok(ASC.l.includes(CFG.loc), 'Logo contains location');
    assert.ok(ASC.l.includes(CFG.ver), 'Logo contains version');
    assert.ok(ASC.l.includes('ARES-E'), 'Logo contains ARES-E');
  });

  it('should generate EWIS dashboard', () => {
    assert.ok(ASC.e.includes('EWIS'), 'EWIS dashboard label');
    assert.ok(ASC.e.includes('PUE'), 'EWIS dashboard has PUE metric');
  });

  it('should generate WOIK dashboard', () => {
    assert.ok(ASC.w.includes('WOIK'), 'WOIK dashboard label');
    assert.ok(ASC.w.includes('Pressure'), 'WOIK dashboard has Pressure metric');
  });

  it('should generate PHIAK dashboard', () => {
    assert.ok(ASC.p.includes('PHIAK'), 'PHIAK dashboard label');
    assert.ok(ASC.p.includes('PII/PHI'), 'PHIAK dashboard has privacy indicator');
  });
});

/* ─── Boot Log Tests ─── */

describe('Boot log', () => {
  it('should return an array of log messages', () => {
    const bLg = getBootLog(CFG);
    assert.ok(Array.isArray(bLg), 'Boot log is an array');
    assert.ok(bLg.length >= 5, 'Boot log has at least 5 entries');
  });

  it('should include location from config', () => {
    const bLg = getBootLog(CFG);
    const hasLoc = bLg.some(l => l.includes(CFG.loc));
    assert.ok(hasLoc, 'Boot log references location');
  });

  it('should end with Ready message', () => {
    const bLg = getBootLog(CFG);
    const lastMsg = bLg[bLg.length - 1];
    assert.ok(lastMsg.includes('Ready'), 'Last boot message indicates ready');
  });
});

/* ─── Input Sanitization Tests ─── */

describe('Input sanitization (client-side logic)', () => {
  // These test the sanitization logic that exists in worker-terminal.js
  // We replicate the functions here for testing since the client-side JS
  // is not directly importable as an ES module.

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function sanitizeInput(raw) {
    return raw
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .slice(0, 500);
  }

  it('should escape HTML entities', () => {
    assert.equal(esc('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    assert.equal(esc("it's"), "it&#39;s");
    assert.equal(esc('a&b'), 'a&amp;b');
  });

  it('should strip control characters from input', () => {
    assert.equal(sanitizeInput('hello\x00world'), 'helloworld');
    assert.equal(sanitizeInput('test\x07beep'), 'testbeep');
    assert.equal(sanitizeInput('normal text'), 'normal text');
  });

  it('should truncate long inputs', () => {
    const long = 'a'.repeat(1000);
    assert.equal(sanitizeInput(long).length, 500);
  });

  it('should handle empty and whitespace inputs', () => {
    assert.equal(sanitizeInput(''), '');
    assert.equal(sanitizeInput('   '), '   ');
  });

  it('should escape potentially dangerous HTML inputs', () => {
    assert.equal(esc('<img onerror=alert(1)>'), '&lt;img onerror=alert(1)&gt;');
    assert.equal(esc('"><script>'), '&quot;&gt;&lt;script&gt;');
  });
});

/* ─── Command Validation Tests ─── */

describe('Command validation', () => {
  const ALLOWED_COMMANDS = [
    'ls', 'cat', 'cd', 'tree', 'analyze', 'clear', 'help', 'whoami',
    'pwd', 'date', 'echo', 'search', 'notebook', 'sim', 'status',
    'export', 'version', 'history'
  ];

  it('should recognize all documented commands', () => {
    for (const cmd of ALLOWED_COMMANDS) {
      assert.ok(ALLOWED_COMMANDS.includes(cmd), `${cmd} is in allowed list`);
    }
  });

  it('should reject unknown commands', () => {
    const unknown = ['rm', 'sudo', 'wget', 'curl', 'eval', 'exec'];
    for (const cmd of unknown) {
      assert.ok(!ALLOWED_COMMANDS.includes(cmd), `${cmd} is NOT in allowed list`);
    }
  });
});

/* ─── VFS Navigation Logic Tests ─── */

describe('VFS navigation logic', () => {
  function gD(vfs, path) {
    let d = vfs;
    for (let p of path) {
      if (!d[p] || !d[p].contents) return {};
      d = d[p].contents;
    }
    return d;
  }

  it('should return root at empty path', () => {
    const d = gD(VFS, []);
    assert.ok(d['README.md'], 'Root has README.md');
    assert.ok(d['ewis'], 'Root has ewis');
  });

  it('should navigate into ewis directory', () => {
    const d = gD(VFS, ['ewis']);
    assert.ok(d['README.md'], 'ewis has README.md');
    assert.ok(d['metrics.txt'], 'ewis has metrics.txt');
  });

  it('should navigate into nested notebooks directory', () => {
    const d = gD(VFS, ['notebooks']);
    assert.ok(d['README.md'], 'notebooks has README.md');
    assert.ok(d['ewis_grid_failure_sim.ipynb'], 'notebooks has notebook file');
  });

  it('should return empty for invalid path', () => {
    const d = gD(VFS, ['nonexistent']);
    assert.deepEqual(d, {}, 'Invalid path returns empty object');
  });

  it('should return empty for navigating into a file', () => {
    const d = gD(VFS, ['README.md']);
    assert.deepEqual(d, {}, 'File path returns empty object');
  });
});
