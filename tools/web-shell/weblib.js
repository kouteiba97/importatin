const fs = require('fs');
const path = require('path');
const DIR = path.resolve(__dirname, '..', '..', 'designs') + '/';

const LOGO = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 36V23a8 8 0 0 1 16 0v13"/><path d="M24 23a8 8 0 0 1 16 0v13"/></g></svg>`;

const LANGSW = (key = 'short') => `<div class="langsw" role="group" aria-label="{{ sh.langLabel }}">
<sc-for list="{{ langs }}" as="l" hint-placeholder-count="3">
<button type="button" onClick="{{ l.pick }}" aria-pressed="{{ l.on }}" style="background:{{ l.bg }};color:{{ l.fg }}">{{ l.${key} }}</button>
</sc-for>
</div>`;

exports.LOGO = LOGO;
exports.LANGSW = LANGSW;

/* statebar: pass [listName, loopVar, labelBinding] */
exports.STATEBAR = (list, label) => `<div class="statebar">
<span class="lbl">{{ ${label} }}</span>
<sc-for list="{{ ${list} }}" as="sv" hint-placeholder-count="5">
<button type="button" onClick="{{ sv.pick }}" aria-pressed="{{ sv.on }}" class="sw" style="background:{{ sv.bg }};color:{{ sv.fg }};border-color:{{ sv.bd }}">{{ sv.label }}</button>
</sc-for>
</div>`;

exports.appShell = ({ tier = 'tier-op', inner, statebar = '', langKey = 'short' }) => `
<div ref="{{ rootRef }}" dir="rtl" lang="ar" class="${tier} web">
<div class="app">

<aside class="rail">
<div class="rail-brand">${LOGO(28)}<span class="wordmark">{{ sh.brand }}</span></div>
<div class="rail-role" style="background:{{ sh.roleBg }};color:{{ sh.roleFg }}">{{ sh.role }}</div>
<nav class="rail-nav" aria-label="{{ sh.navLabel }}">
<sc-for list="{{ sh.nav }}" as="n" hint-placeholder-count="7">
<button type="button" class="rail-link" aria-current="{{ n.on }}"><span class="ri" aria-hidden="true">{{ n.icon }}</span><span class="lbl">{{ n.label }}</span><sc-if value="{{ n.hasBadge }}" hint-placeholder-val="{{ false }}"><span class="badge num">{{ n.badge }}</span></sc-if></button>
</sc-for>
<div class="rail-sep"></div>
<button type="button" class="rail-link"><span class="ri" aria-hidden="true">{{ sh.icSettings }}</span><span class="lbl">{{ sh.settings }}</span></button>
</nav>
<div class="rail-user">
<span class="av" style="width:38px;height:38px;font-size:12px;background:{{ sh.roleBg }};color:{{ sh.roleFg }}">{{ sh.userInitials }}</span>
<div style="min-width:0"><div style="font-size:var(--t-sm);font-weight:600">{{ sh.userName }}</div><div style="font-size:var(--t-xs);color:var(--ink-3);margin-top:2px">{{ sh.userRole }}</div></div>
</div>
</aside>

<div class="main">
<header class="topbar">
<div class="gsearch">{{ sh.icSearch }}<span>{{ sh.search }}</span><kbd>/</kbd></div>
<div style="flex:1"></div>
${LANGSW(langKey)}
<button type="button" class="iconbtn" aria-label="{{ sh.alerts }}">{{ sh.icBell }}<span class="dot"></span></button>
</header>
${statebar}
<div class="page">
${inner}
</div>
</div>

</div>
</div>
`;

exports.siteShell = ({ tier = 'tier-public', inner, statebar = '', langKey = 'short' }) => `
<div ref="{{ rootRef }}" dir="rtl" lang="ar" class="${tier} web site-page">

<header class="site">
<div class="container site-in">
<div class="site-brand">${LOGO(28)}<span class="wordmark">{{ sh.brand }}</span></div>
<nav class="site-nav" aria-label="{{ sh.navLabel }}">
<sc-for list="{{ sh.nav }}" as="n" hint-placeholder-count="3">
<button type="button" class="site-link" aria-current="{{ n.on }}">{{ n.label }}</button>
</sc-for>
</nav>
<div class="site-search">{{ sh.icSearch }}<span>{{ sh.pubSearch }}</span></div>
<div style="flex:1"></div>
${LANGSW(langKey)}
<button type="button" class="iconbtn" aria-label="{{ sh.saved }}">{{ sh.icHeart }}</button>
<button type="button" class="iconbtn" aria-label="{{ sh.messages }}">{{ sh.icMsg }}<span class="dot"></span></button>
<span class="av" style="width:40px;height:40px;font-size:12px;background:{{ sh.roleBg }};color:{{ sh.roleFg }}">{{ sh.userInitials }}</span>
</div>
</header>
${statebar}
<main class="site-main">
<div class="container">
${inner}
</div>
</main>

<footer class="site-foot">
<div class="container site-foot-in">
<span class="site-brand">${LOGO(20)}<span class="wordmark" style="font-size:16px">{{ sh.brand }}</span></span>
<span class="grow">{{ sh.foot }}</span>
<button type="button" class="link">{{ sh.business }}</button>
<span>{{ sh.terms }}</span><span>{{ sh.privacy }}</span><span>{{ sh.help }}</span>
</div>
</footer>
</div>
`;

/* Rebuild one board as a web page.
   o: { file, surface, active, markup, css, w, h, extra (string inserted into renderVals return), dropCss: [regex] } */
exports.convert = (o) => {
  const f = DIR + o.file;
  let s = fs.readFileSync(f, 'utf8');

  // stylesheet + shell script
  if (!s.includes('./web.css')) s = s.replace('<link rel="stylesheet" href="./tokens.css">', '<link rel="stylesheet" href="./tokens.css">\n<link rel="stylesheet" href="./web.css">');
  if (!s.includes('./shell.js')) s = s.replace('<script src="./support.js"></script>', '<script src="./support.js"></script>\n<script src="./shell.js"></script>');

  // page CSS: replace the board's <style> inside <helmet>
  const hs = s.indexOf('<helmet>'), he = s.indexOf('</helmet>');
  let helmet = s.slice(hs, he);
  helmet = helmet.replace(/<style>[\s\S]*?<\/style>/, '<style>\n' + (o.css || '') + '\n</style>');
  if (!helmet.includes('<style>')) helmet = helmet + '<style>\n' + (o.css || '') + '\n</style>\n';
  s = s.slice(0, hs) + helmet + s.slice(he);

  // template
  const a = s.indexOf('</helmet>') + '</helmet>'.length;
  const b = s.indexOf('</x-dc>');
  s = s.slice(0, a) + '\n' + o.markup + '\n' + s.slice(b);

  // canvas size: a desktop artboard
  s = s.replace(/data-props="\{&quot;\$preview&quot;:\{&quot;width&quot;:\d+,&quot;height&quot;:\d+\}\}"/,
    `data-props="{&quot;$preview&quot;:{&quot;width&quot;:${o.w || 1440},&quot;height&quot;:${o.h || 1000}}}"`);

  // shell values
  const shellCall = `sh: window.MaabarShell(this.state.lang, '${o.surface}', '${o.active}'),`;
  if (!s.includes('window.MaabarShell')) {
    if (!s.includes('rootRef: this.root,')) throw new Error('no rootRef in ' + o.file);
    s = s.replace('rootRef: this.root,', 'rootRef: this.root,\n      ' + shellCall + (o.extra ? '\n      ' + o.extra : ''));
  }
  if (o.logic) for (const [x, y] of o.logic) { if (!s.includes(x)) console.log('  LOGIC MISS ' + o.file + ' :: ' + x.slice(0, 60)); s = s.split(x).join(y); }

  fs.writeFileSync(f, s);

  // report bindings used in markup that the logic never mentions (cheap sanity check)
  const script = s.slice(s.indexOf('data-dc-script'));
  const used = [...new Set((o.markup.match(/\{\{\s*([a-zA-Z_]+)/g) || []).map(x => x.replace(/\{\{\s*/, '')))];
  const loopVars = new Set((o.markup.match(/as="([a-zA-Z_]+)"/g) || []).map(x => x.slice(4, -1)));
  const missing = used.filter(k => !loopVars.has(k) && !['sh', 't', 'langs', 'rootRef'].includes(k) && !new RegExp('\\b' + k + '\\b').test(script));
  console.log(o.file + ': written' + (missing.length ? ' | UNBOUND? ' + missing.join(', ') : ''));
};
