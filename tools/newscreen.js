/* Node port of tools/newscreen.py — assemble a new .dc.html screen from parts
   (site shell or app shell). Same API, for machines without Python:
     const N = require('../newscreen.js');
     N.build({ name, w, h, css, template, state, logic, extraHead });
   Run a recipe with: node tools/recipes/<name>.js */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'designs');

const LOGO = '<svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 36V23a8 8 0 0 1 16 0v13"/><path d="M24 23a8 8 0 0 1 16 0v13"/></g></svg>';
const LOGO_S = LOGO.replace('width="28" height="28"', 'width="20" height="20"');

const LANGSW = `<div class="langsw" role="group" aria-label="{{ sh.langLabel }}">
<sc-for list="{{ langs }}" as="l" hint-placeholder-count="3">
<button type="button" onClick="{{ l.pick }}" aria-pressed="{{ l.on }}" style="background:{{ l.bg }};color:{{ l.fg }}">{{ l.short }}</button>
</sc-for>
</div>`;

/* web=false: admin screens, which use their own desktop layout and no public/app shell. */
function head(css, extraHead = '', web = true) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="./support.js"></script>
${web ? '<script src="./shell.js"></script>\n' : ''}${extraHead}</head>
<body>
<x-dc>
<helmet>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="./tokens.css">
${web ? '<link rel="stylesheet" href="./web.css">\n' : ''}<style>
${css}
</style>
</helmet>
`;
}

/* signedIn: shopper avatar + saved/messages; otherwise the three entry buttons.
   search: show the public search field (as on the marketplace pages). */
function siteHeader(signedIn = false, search = false) {
  const actions = signedIn
    ? `<button type="button" class="iconbtn" aria-label="{{ sh.saved }}">{{ sh.icHeart }}</button>
<button type="button" class="iconbtn" aria-label="{{ sh.messages }}">{{ sh.icMsg }}</button>
<span class="av" style="width:40px;height:40px;font-size:12px;background:{{ sh.roleBg }};color:{{ sh.roleFg }}">{{ sh.userInitials }}</span>`
    : `<div class="site-actions">
<button type="button" class="btn">{{ sh.entry.signin }}</button>
<button type="button" class="btn btn-dark">{{ sh.entry.importer }}</button>
<button type="button" class="btn btn-dark">{{ sh.entry.trader }}</button>
</div>`;
  return `<header class="site">
<div class="container site-in">
<div class="site-brand">${LOGO}<span class="wordmark">{{ sh.brand }}</span></div>
<nav class="site-nav" aria-label="{{ sh.navLabel }}">
<sc-for list="{{ sh.nav }}" as="n" hint-placeholder-count="5">
<button type="button" class="site-link" aria-current="{{ n.on }}">{{ n.label }}</button>
</sc-for>
</nav>
${search ? '<div class="site-search">{{ sh.icSearch }}<span>{{ sh.pubSearch }}</span></div>\n' : ''}<div style="flex:1"></div>
${LANGSW}
${actions}
</div>
</header>
`;
}

const SITE_FOOT = `<footer class="site-foot">
<div class="container site-foot-in">
<span class="site-brand">${LOGO_S}<span class="wordmark" style="font-size:16px">{{ sh.brand }}</span></span>
<span class="grow">{{ sh.foot }}</span>
<span>{{ sh.terms }}</span><span>{{ sh.privacy }}</span><span>{{ sh.help }}</span>
</div>
</footer>
`;

function statebar(listName = 'views', label = 'stateLabel') {
  return `<div class="statebar">
<span class="lbl">{{ ${label} }}</span>
<sc-for list="{{ ${listName} }}" as="sv" hint-placeholder-count="5">
<button type="button" onClick="{{ sv.pick }}" aria-pressed="{{ sv.on }}" class="sw" style="background:{{ sv.bg }};color:{{ sv.fg }}">{{ sv.label }}</button>
</sc-for>
</div>
`;
}

function sitePage(inner, { tier = 'tier-public', signedIn = false, search = false, bar = '' } = {}) {
  return `<div ref="{{ rootRef }}" dir="rtl" lang="ar" class="${tier} web site-page">
${siteHeader(signedIn, search)}${bar}<main class="site-main">
${inner}
</main>
${SITE_FOOT}</div>
`;
}

const LOGIC_HEAD = (w, h, state) => `<script type="text/x-dc" data-dc-script data-props="{&quot;$preview&quot;:{&quot;width&quot;:${w},&quot;height&quot;:${h}}}">
class Component extends DCLogic {
  /* Locale: ?lang= in the URL, else the browser, else French. */
  static FALLBACK = 'fr';
  static detect() {
    const q = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('lang') : null;
    const tag = (q || (typeof navigator !== 'undefined' && navigator.language) || '').slice(0, 2).toLowerCase();
    return ['ar', 'fr', 'en'].includes(tag) ? tag : Component.FALLBACK;
  }
  static param(k) { return typeof location !== 'undefined' ? new URLSearchParams(location.search).get(k) : null; }
  state = { ${state}, lang: Component.detect() };
  root = React.createRef();
  componentDidMount() { this._apply(); }
  componentDidUpdate() { this._apply(); }
  _apply() {
    const el = this.root.current;
    if (el) { el.setAttribute('dir', this.L[this.state.lang].dir); el.setAttribute('lang', this.state.lang); }
  }
  iso(s) { if (/[\\u0600-\\u06FF]/.test(s)) s = s.replace(/\\d[\\d ,.:]*\\d%?|\\d%?/g, m => '\\u2066' + m + '\\u2069'); return '\\u2068' + s + '\\u2069'; }
  fmt(n, sep) { return '\\u2066' + String(n).replace(/\\B(?=(\\d{3})+(?!\\d))/g, sep === undefined ? ' ' : sep) + '\\u2069'; }
  langsFor(cur) {
    return ['ar', 'fr', 'en'].map(id => ({
      short: this.L[id].short, label: this.L[id].label, on: cur === id,
      bg: cur === id ? 'var(--ink)' : 'var(--surface)',
      fg: cur === id ? 'var(--ink-on)' : 'var(--ink-2)',
      pick: () => this.setState({ lang: id })
    }));
  }
  sw(list, key, labels) {
    return list.map((id, i) => ({ id, label: labels[i], on: this.state[key] === id,
      bg: this.state[key] === id ? 'var(--ink)' : 'var(--surface)', fg: this.state[key] === id ? 'var(--ink-on)' : 'var(--ink-2)',
      pick: () => this.setState({ [key]: id }) }));
  }
`;

const LOGIC_TAIL = `}
</script>
</body>
</html>
`;

function build(spec) {
  let out = head(spec.css, spec.extraHead || '', spec.web !== false);
  out += spec.template;
  out += '\n</x-dc>\n';
  out += LOGIC_HEAD(spec.w || 1440, spec.h || 1200, spec.state);
  out += spec.logic;
  out += LOGIC_TAIL;
  const file = path.join(ROOT, spec.name + '.dc.html');
  fs.writeFileSync(file, out);
  // binding sanity check: every root used in the template must appear in the logic
  const tpl = spec.template;
  const used = new Set([...tpl.matchAll(/{{\s*([a-zA-Z_][\w.]*)/g)].map(m => m[1].split('.')[0]));
  const loopVars = new Set([...tpl.matchAll(/as="(\w+)"/g)].map(m => m[1]));
  const missing = [...used].filter(r => !loopVars.has(r) && !['sh', 'langs', 'rootRef', 'true', 'false'].includes(r)
    && !new RegExp('\\b' + r + '\\b').test(spec.logic)).sort();
  console.log('wrote', file, '| unbound roots:', missing.length ? missing.join(', ') : 'none');
}

module.exports = { build, head, siteHeader, sitePage, statebar, LANGSW, LOGO, LOGO_S, SITE_FOOT };
