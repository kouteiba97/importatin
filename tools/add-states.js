/* Add the shared page states (loading / empty / error / offline) to a converted screen.
   Usage: node tools/add-states.js            → applies to the list below (skips screens already done)
   It loads designs/states.js, adds the review-only state switcher, wraps the page content in
   "ready", and adds the shared state block. Copy lives in designs/states.js. */
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'designs');

/* screen file → key of its empty-state copy in states.js */
const SCREENS = {
  'Consumer Home': 'home', 'Marketplace': 'market', 'Product Detail': 'product', 'Seller Profile': 'seller',
  'Importer Home': 'ihome', 'Demand Board': 'demand', 'Trip': 'trip', 'Messages': 'messages',
  'Trader Home': 'thome', 'Discover': 'discover', 'Importer Profile': 'iprofile'
};

const BAR = `<div class="statebar">
<span class="lbl">{{ ps.label }}</span>
<sc-for list="{{ ps.views }}" as="pv" hint-placeholder-count="5">
<button type="button" onClick="{{ pv.pick }}" aria-pressed="{{ pv.on }}" class="sw" style="background:{{ pv.bg }};color:{{ pv.fg }}">{{ pv.label }}</button>
</sc-for>
</div>
`;
const OPEN = '<sc-if value="{{ ps.ok }}" hint-placeholder-val="{{ true }}">\n';
const block = (w0, w1) => `</sc-if>
<sc-if value="{{ ps.other }}" hint-placeholder-val="{{ false }}">
<sc-if value="{{ ps.loading }}" hint-placeholder-val="{{ false }}">
${w0}<div class="pskel" role="status" aria-label="{{ ps.loadingLabel }}">
<div class="sk sk-title"></div><div class="sk sk-line"></div>
<div class="sk-grid"><sc-for list="{{ ps.skel }}" as="sk" hint-placeholder-count="6"><div class="sk sk-card"></div></sc-for></div>
</div>${w1}
</sc-if>
<sc-if value="{{ ps.msg }}" hint-placeholder-val="{{ false }}">
${w0}<div class="pstate">
<span class="pstate-ic" aria-hidden="true" style="background:{{ ps.icBg }};color:{{ ps.icFg }}">{{ ps.glyph }}</span>
<h2>{{ ps.title }}</h2>
<p>{{ ps.body }}</p>
<div class="pstate-act"><button type="button" class="btn btn-dark">{{ ps.cta }}</button><sc-if value="{{ ps.hasAlt }}" hint-placeholder-val="{{ false }}"><button type="button" class="btn">{{ ps.alt }}</button></sc-if></div>
<sc-if value="{{ ps.hasRef }}" hint-placeholder-val="{{ false }}"><div class="ref">{{ ps.ref }}</div></sc-if>
</div>${w1}
</sc-if>
</sc-if>
`;

for (const [name, key] of Object.entries(SCREENS)) {
  const file = path.join(DIR, name + '.dc.html');
  let s = fs.readFileSync(file, 'utf8');
  const crlf = s.includes('\r\n'); s = s.split('\r\n').join('\n');
  if (s.includes('window.MaabarStates')) { console.log('skip (already has states)', name); continue; }
  const must = (cond, what) => { if (!cond) throw new Error(name + ': ' + what); };

  must(s.includes('<script src="./shell.js"></script>'), 'no shell.js');
  s = s.replace('<script src="./shell.js"></script>', '<script src="./shell.js"></script>\n<script src="./states.js"></script>');

  const end = s.indexOf('</x-dc>');
  let tpl = s.slice(0, end), rest = s.slice(end);
  if (tpl.includes('<main class="site-main">')) {
    const a = tpl.indexOf('<main class="site-main">'), b = tpl.lastIndexOf('</main>', tpl.indexOf('<footer class="site-foot">'));
    must(b > a, 'site main not closed');
    const openEnd = a + '<main class="site-main">'.length;
    tpl = tpl.slice(0, a) + BAR + tpl.slice(a, openEnd) + '\n' + OPEN + tpl.slice(openEnd, b) + block('<div class="container">', '</div>') + tpl.slice(b);
  } else {
    const a = tpl.indexOf('<div class="page">');
    must(a > 0, 'no page wrapper');
    const m = tpl.match(/\n<\/div>\n<\/div>\n\s*<\/div>\n<\/div>\s*$/);
    must(m, 'app shell end not found');
    const b = m.index + 1, openEnd = a + '<div class="page">'.length;
    tpl = tpl.slice(0, a) + BAR + tpl.slice(a, openEnd) + '\n' + OPEN + tpl.slice(openEnd, b) + block('', '') + tpl.slice(b);
  }
  must(rest.includes('rootRef: this.root,'), 'no rootRef in renderVals');
  rest = rest.replace('rootRef: this.root,', "rootRef: this.root,\n      ps: window.MaabarStates(this, this.state.lang, '" + key + "'),");
  s = tpl + rest;
  fs.writeFileSync(file, crlf ? s.split('\n').join('\r\n') : s);
  console.log('states added', name);
}
