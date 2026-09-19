#!/usr/bin/env python3
"""Assemble a new .dc.html screen from parts (site shell or app shell).
Usage from a recipe: from newscreen import build; build(dict(...))."""
import json, os, re

ROOT = os.path.join(os.path.dirname(__file__), '..', 'designs')

LOGO = '<svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 36V23a8 8 0 0 1 16 0v13"/><path d="M24 23a8 8 0 0 1 16 0v13"/></g></svg>'
LOGO_S = LOGO.replace('width="28" height="28"', 'width="20" height="20"')

LANGSW = '''<div class="langsw" role="group" aria-label="{{ sh.langLabel }}">
<sc-for list="{{ langs }}" as="l" hint-placeholder-count="3">
<button type="button" onClick="{{ l.pick }}" aria-pressed="{{ l.on }}" style="background:{{ l.bg }};color:{{ l.fg }}">{{ l.short }}</button>
</sc-for>
</div>'''

def head(css, extra_head=''):
    return f'''<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="./support.js"></script>
<script src="./shell.js"></script>
</head>
<body>
<x-dc>
<helmet>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="./tokens.css">
<link rel="stylesheet" href="./web.css">
{extra_head}<style>
{css}
</style>
</helmet>
'''

def site_header(signed_in=False):
    actions = ('''<button type="button" class="iconbtn" aria-label="{{ sh.saved }}">{{ sh.icHeart }}</button>
<button type="button" class="iconbtn" aria-label="{{ sh.messages }}">{{ sh.icMsg }}</button>
<span class="av" style="width:40px;height:40px;font-size:12px;background:{{ sh.roleBg }};color:{{ sh.roleFg }}">{{ sh.userInitials }}</span>'''
      if signed_in else
      '''<div class="site-actions">
<button type="button" class="btn">{{ sh.entry.signin }}</button>
<button type="button" class="btn btn-dark">{{ sh.entry.importer }}</button>
<button type="button" class="btn btn-dark">{{ sh.entry.trader }}</button>
</div>''')
    return f'''<header class="site">
<div class="container site-in">
<div class="site-brand">{LOGO}<span class="wordmark">{{{{ sh.brand }}}}</span></div>
<nav class="site-nav" aria-label="{{{{ sh.navLabel }}}}">
<sc-for list="{{{{ sh.nav }}}}" as="n" hint-placeholder-count="4">
<button type="button" class="site-link" aria-current="{{{{ n.on }}}}">{{{{ n.label }}}}</button>
</sc-for>
</nav>
<div style="flex:1"></div>
{LANGSW}
{actions}
</div>
</header>
'''

SITE_FOOT = f'''<footer class="site-foot">
<div class="container site-foot-in">
<span class="site-brand">{LOGO_S}<span class="wordmark" style="font-size:16px">{{{{ sh.brand }}}}</span></span>
<span class="grow">{{{{ sh.foot }}}}</span>
<span>{{{{ sh.terms }}}}</span><span>{{{{ sh.privacy }}}}</span><span>{{{{ sh.help }}}}</span>
</div>
</footer>
'''

def statebar(list_name='views', label='stateLabel'):
    return f'''<div class="statebar">
<span class="lbl">{{{{ {label} }}}}</span>
<sc-for list="{{{{ {list_name} }}}}" as="sv" hint-placeholder-count="5">
<button type="button" onClick="{{{{ sv.pick }}}}" aria-pressed="{{{{ sv.on }}}}" class="sw" style="background:{{{{ sv.bg }}}};color:{{{{ sv.fg }}}}">{{{{ sv.label }}}}</button>
</sc-for>
</div>
'''

def site_page(inner, tier='tier-public', signed_in=False, bar=''):
    return f'''<div ref="{{{{ rootRef }}}}" dir="rtl" lang="ar" class="{tier} web site-page">
{site_header(signed_in)}{bar}<main class="site-main">
{inner}
</main>
{SITE_FOOT}</div>
'''

def app_rail():
    return f'''<aside class="rail">
<div class="rail-brand">{LOGO}<span><span class="wordmark">{{{{ sh.brand }}}}</span><sc-if value="{{{{ sh.hasMark }}}}" hint-placeholder-val="{{{{ true }}}}"><span class="mark" style="color:{{{{ sh.roleFg }}}}">{{{{ sh.mark }}}}</span></sc-if></span></div>
<div class="rail-role" style="background:{{{{ sh.roleBg }}}};color:{{{{ sh.roleFg }}}}">{{{{ sh.role }}}}</div>
<nav class="rail-nav" aria-label="{{{{ sh.navLabel }}}}">
<sc-for list="{{{{ sh.nav }}}}" as="n" hint-placeholder-count="7">
<button type="button" class="rail-link" aria-current="{{{{ n.on }}}}"><span class="ri" aria-hidden="true">{{{{ n.icon }}}}</span><span class="lbl">{{{{ n.label }}}}</span><sc-if value="{{{{ n.hasBadge }}}}" hint-placeholder-val="{{{{ false }}}}"><span class="badge num">{{{{ n.badge }}}}</span></sc-if></button>
</sc-for>
<div class="rail-sep"></div>
<button type="button" class="rail-link"><span class="ri" aria-hidden="true">{{{{ sh.icSettings }}}}</span><span class="lbl">{{{{ sh.settings }}}}</span></button>
</nav>
<div class="rail-user" title="{{{{ sh.switcher.title }}}}">
<span class="av" style="width:36px;height:36px;font-size:12px;background:{{{{ sh.roleBg }}}};color:{{{{ sh.roleFg }}}}">{{{{ sh.userInitials }}}}</span>
<div style="min-width:0"><div style="font-size:var(--t-sm);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{{{ sh.userName }}}}</div><div style="font-size:var(--t-xs);color:var(--ink-3)">{{{{ sh.userRole }}}}</div></div>
<span class="sw-ic" aria-hidden="true">⇅</span>
</div>
</aside>
'''

def app_page(inner, tier='tier-op', bar=''):
    return f'''<div ref="{{{{ rootRef }}}}" dir="rtl" lang="ar" class="{tier} web">
<div class="app">
{app_rail()}<div class="main">
<header class="topbar">
<div class="gsearch">{{{{ sh.icSearch }}}}<span>{{{{ sh.search }}}}</span><kbd>/</kbd></div>
<div style="flex:1"></div>
{LANGSW}
<button type="button" class="iconbtn" aria-label="{{{{ sh.alerts }}}}">{{{{ sh.icBell }}}}<span class="dot"></span></button>
</header>
{bar}<div class="page">
{inner}
</div>
</div>
</div>
</div>
'''

LOGIC_HEAD = '''<script type="text/x-dc" data-dc-script data-props="{&quot;$preview&quot;:{&quot;width&quot;:%d,&quot;height&quot;:%d}}">
class Component extends DCLogic {
  /* Locale: ?lang= in the URL, else the browser, else French. */
  static FALLBACK = 'fr';
  static detect() {
    const q = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('lang') : null;
    const tag = (q || (typeof navigator !== 'undefined' && navigator.language) || '').slice(0, 2).toLowerCase();
    return ['ar', 'fr', 'en'].includes(tag) ? tag : Component.FALLBACK;
  }
  state = { %s, lang: Component.detect() };
  root = React.createRef();
  componentDidMount() { this._apply(); }
  componentDidUpdate() { this._apply(); }
  _apply() {
    const el = this.root.current;
    if (el) { el.setAttribute('dir', this.L[this.state.lang].dir); el.setAttribute('lang', this.state.lang); }
  }
  iso(s) { if (/[\\u0600-\\u06FF]/.test(s)) s = s.replace(/\\d[\\d ,.:]*\\d%%?|\\d%%?/g, m => '\\u2066' + m + '\\u2069'); return '\\u2068' + s + '\\u2069'; }
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
'''

LOGIC_TAIL = '''}
</script>
</body>
</html>
'''

def build(spec):
    """spec: name, w, h, css, template (full markup incl. root div), state (js object body),
    logic (extra class members incl. L = {...} and renderVals())."""
    out = head(spec['css'], spec.get('extra_head', ''))
    out += spec['template']
    out += '\n</x-dc>\n\n'
    out += LOGIC_HEAD % (spec.get('w', 1440), spec.get('h', 1200), spec['state'])
    out += spec['logic']
    out += LOGIC_TAIL
    path = os.path.join(ROOT, spec['name'] + '.dc.html')
    open(path, 'w', encoding='utf8').write(out)
    # binding sanity check
    tpl = spec['template']
    used = set(re.findall(r'{{\s*([a-zA-Z_][\w.]*)', tpl))
    loopvars = set(re.findall(r'as="(\w+)"', tpl))
    roots = {u.split('.')[0] for u in used} - loopvars
    missing = [r for r in sorted(roots) if r not in ('sh', 'langs', 'rootRef', 'true', 'false') and not re.search(r'\b' + re.escape(r) + r'\b', spec['logic'])]
    print('wrote', path, '| unbound roots:', missing or 'none')
