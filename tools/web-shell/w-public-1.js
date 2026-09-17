const W = require('./weblib.js');
const VERIFIED = (label, size = 14) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="flex:none" role="img" aria-label="${label}"><circle cx="12" cy="12" r="10" fill="var(--allowed)"/><path d="M7.4 12.4l3 3 6.2-6.6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const HEART = (fill, stroke, size = 18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="${stroke}" stroke-width="1.9"><path d="M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.7c0 4.9-7 9.3-7 9.3z"/></svg>`;
const SEC = `.sech{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin:0 0 16px}
.sech h2{margin:0;font-size:24px;font-weight:600}
.block{margin-bottom:44px}`;

/* ───────────────────────── CONSUMER HOME ───────────────────────── */
W.convert({
  file: 'Consumer Home.dc.html', surface: 'public', active: 'home', w: 1440, h: 1500,
  css: SEC + `
.cgrid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:18px}
.tile{border:1px solid var(--rule-faint);border-radius:var(--r-lg);background:var(--surface);overflow:hidden;cursor:pointer;text-align:start;padding:0;color:inherit;box-shadow:var(--e1)}
`,
  markup: W.siteShell({ inner: `
<section class="block">
<div class="sech"><h2>{{ t.cats }}</h2></div>
<div class="cgrid">
<sc-for list="{{ cats }}" as="c" hint-placeholder-count="5">
<button type="button" class="tile"><span class="img img-tile ph {{ c.ph }}" style="border-radius:0"></span><span style="display:block;padding:14px 16px"><span style="display:block;font-size:var(--t-h3);font-weight:600">{{ c.label }}</span><span class="num" style="display:block;font-size:var(--t-sm);color:var(--ink-3);margin-top:3px"><bdi>{{ c.n }}</bdi></span></span></button>
</sc-for>
</div>
</section>

<section class="block">
<div class="sech"><h2>{{ t.fresh }}</h2><button type="button" class="link">{{ t.all }}</button></div>
<div class="pgrid">
<sc-for list="{{ fresh }}" as="p" hint-placeholder-count="4">
<article class="pcard">
<div style="position:relative"><span class="img img-card ph {{ p.ph }}" style="border-radius:0"></span><span class="chip chip-verified" style="position:absolute;inset-block-start:10px;inset-inline-start:10px">{{ p.when }}</span></div>
<div style="padding:14px 16px"><div class="clamp2" style="font-size:var(--t-body);min-height:44px">{{ p.title }}</div><div class="num" style="font-size:18px;font-weight:600;margin-top:8px"><bdi>{{ p.price }}</bdi></div></div>
</article>
</sc-for>
</div>
</section>

<div class="split">
<section class="panel">
<div class="panel-h"><h2>{{ t.sellers }}</h2><span class="meta num"><bdi>{{ t.city }}</bdi></span></div>
<div class="rows">
<sc-for list="{{ sellers }}" as="s" hint-placeholder-count="3">
<button type="button" style="width:100%;display:flex;align-items:center;gap:14px;padding:16px 20px;border:0;background:transparent;color:inherit;text-align:start;cursor:pointer">
<span class="av" style="width:48px;height:48px;font-size:13px;background:{{ s.avBg }};color:{{ s.avFg }}">{{ s.initials }}</span>
<span style="flex:1;min-width:0"><span style="display:flex;align-items:center;gap:6px"><span style="font-size:var(--t-h3);font-weight:600">{{ s.name }}</span>${VERIFIED('')}</span><span class="num" style="display:block;font-size:var(--t-sm);color:var(--ink-2);margin-top:4px"><bdi>{{ s.meta }}</bdi></span></span>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" stroke-width="2" style="flex:none;transform:scaleX({{ arrow }})"><path d="M15 5l-7 7 7 7"/></svg>
</button>
</sc-for>
</div>
</section>

<aside class="stack">
<section class="panel">
<div class="panel-h"><h2>{{ t.saved }}</h2><button type="button" class="link">{{ t.all }}</button></div>
<div class="rows">
<sc-for list="{{ saved }}" as="s" hint-placeholder-count="2">
<div style="display:flex;align-items:center;gap:12px;padding:13px 20px"><span class="img ph {{ s.ph }}" style="flex:none;width:44px;height:54px;border-radius:var(--r-sm)"></span><div style="flex:1;min-width:0"><div style="font-size:var(--t-sm)">{{ s.title }}</div><div style="font-size:var(--t-xs);color:{{ s.fg }};margin-top:3px;font-weight:500">{{ s.note }}</div></div><span class="num" style="font-weight:600"><bdi>{{ s.price }}</bdi></span></div>
</sc-for>
</div>
</section>
<section class="panel">
<div class="panel-h"><h2>{{ t.howTitle }}</h2></div>
<div class="panel-b">
<sc-for list="{{ how }}" as="h" hint-placeholder-count="3"><div style="display:flex;gap:12px;padding:7px 0"><span aria-hidden="true" style="flex:none;width:24px;height:24px;border-radius:50%;background:var(--brand-bg);color:var(--brand-ink);display:grid;place-items:center;font-size:12px;font-weight:600">{{ h.n }}</span><span style="font-size:var(--t-sm);line-height:1.65;color:var(--ink-2)">{{ h.t }}</span></div></sc-for>
</div>
</section>
</aside>
</div>
` })
});

/* ───────────────────────── MARKETPLACE ───────────────────────── */
const PCARD = `
<article class="pcard">
<div style="position:relative">
<span class="img img-card ph {{ p.ph }}" style="border-radius:0"></span>
<button type="button" onClick="{{ p.save }}" aria-label="{{ p.saveLabel }}" aria-pressed="{{ p.saved }}" style="position:absolute;inset-block-start:10px;inset-inline-end:10px;width:36px;height:36px;border:0;border-radius:50%;background:oklch(1 0 0 / 0.9);display:grid;place-items:center;cursor:pointer;box-shadow:var(--e1)">${HEART('{{ p.heartFill }}', '{{ p.heartStroke }}', 17)}</button>
<sc-if value="{{ p.hasFlag }}" hint-placeholder-val="{{ true }}"><span style="position:absolute;inset-block-start:12px;inset-inline-start:12px;height:24px;padding:0 10px;display:inline-flex;align-items:center;border-radius:999px;background:{{ p.flagBg }};color:{{ p.flagFg }};font-size:var(--t-xs);font-weight:500">{{ p.flag }}</span></sc-if>
</div>
<div style="padding:14px 16px 16px;display:flex;flex-direction:column;gap:8px;flex:1">
<h3 class="clamp2" style="margin:0;font-size:var(--t-body);font-weight:400;line-height:1.45;min-height:42px">{{ p.title }}</h3>
<div style="display:flex;align-items:baseline;gap:6px"><span class="num" style="font-size:20px;font-weight:600"><bdi>{{ p.price }}</bdi></span><span class="num" style="font-size:var(--t-sm);color:var(--ink-3)"><bdi>{{ p.unit }}</bdi></span></div>
<div style="display:flex;align-items:center;gap:8px;padding-top:10px;border-top:1px solid var(--rule-faint)">
<span class="av" style="width:24px;height:24px;font-size:9px;background:{{ p.avBg }};color:{{ p.avFg }}">{{ p.initials }}</span>
<span style="flex:1;min-width:0;font-size:var(--t-sm);color:var(--ink-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ p.seller }}</span>
${VERIFIED('{{ t.verifiedShop }}', 14)}
</div>
<div class="num" style="font-size:var(--t-xs);color:var(--ink-3)"><bdi>{{ p.trust }}</bdi></div>
</div>
</article>`;

W.convert({
  file: 'Marketplace.dc.html', surface: 'public', active: 'market', w: 1440, h: 1500,
  css: SEC + `
.catrow{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:14px;margin-bottom:30px}
.cat{border:1px solid var(--rule-faint);border-radius:var(--r-lg);background:var(--surface);padding:0;overflow:hidden;text-align:start;color:inherit;cursor:pointer}
.pgrid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}
.fgroup{padding:16px 18px;border-top:1px solid var(--rule-faint)}
.fgroup:first-child{border-top:0}
.opt{display:flex;align-items:center;gap:10px;width:100%;padding:7px 0;border:0;background:none;color:inherit;font-size:var(--t-sm);cursor:pointer;text-align:start}
.box{flex:none;width:18px;height:18px;border-radius:5px;border:1.5px solid var(--rule-strong);display:grid;place-items:center;color:#fff;font-size:11px}
@media (max-width:1240px){.catrow{grid-template-columns:repeat(4,minmax(0,1fr))}.pgrid3{grid-template-columns:repeat(2,minmax(0,1fr))}}
`,
  logic: [["opts: g.opts.map((id, oi) => {\n          const on = s.filters[g.id] === id;\n          return {", "opts: g.opts.map((id, oi) => {\n          const on = s.filters[g.id] === id;\n          return {\n            box: on ? 'var(--brand)' : 'transparent', tick: on ? '✓' : '',"]],
  markup: W.siteShell({ inner: `
<div class="sech"><h2>{{ t.byCat }}</h2></div>
<div class="catrow">
<sc-for list="{{ cats }}" as="c" hint-placeholder-count="7">
<button type="button" onClick="{{ c.pick }}" aria-pressed="{{ c.on }}" class="cat" style="border-color:{{ c.bd }};box-shadow:{{ c.sh }}">
<span class="img img-tile ph {{ c.ph }}" style="border-radius:0"></span>
<span style="display:block;padding:11px 13px"><span style="display:block;font-size:var(--t-sm);font-weight:{{ c.fw }}">{{ c.label }}</span><span class="num" style="display:block;font-size:var(--t-xs);color:var(--ink-3);margin-top:2px"><bdi>{{ c.count }}</bdi></span></span>
</button>
</sc-for>
</div>

<div class="split-l" style="display:grid;gap:26px;align-items:start">
<aside class="panel sticky">
<div class="panel-h"><h2>{{ t.filter }}</h2><sc-if value="{{ hasFilters }}" hint-placeholder-val="{{ false }}"><span class="chip chip-brand num"><bdi>{{ filterCount }}</bdi></span></sc-if></div>
<sc-for list="{{ filterGroups }}" as="g" hint-placeholder-count="3">
<div class="fgroup">
<div style="font-size:var(--t-xs);font-weight:600;color:var(--ink-3);margin-bottom:6px">{{ g.label }}</div>
<sc-for list="{{ g.opts }}" as="o" hint-placeholder-count="4">
<button type="button" onClick="{{ o.pick }}" aria-pressed="{{ o.on }}" class="opt"><span class="box" style="background:{{ o.box }};border-color:{{ o.bd }}">{{ o.tick }}</span>{{ o.label }}</button>
</sc-for>
</div>
</sc-for>
</aside>

<main>
<div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;flex-wrap:wrap">
<span class="num" style="flex:1;font-size:var(--t-body);color:var(--ink-2)"><bdi>{{ resultCount }}</bdi></span>
<span style="font-size:var(--t-sm);color:var(--ink-3)">{{ t.sort }}</span>
<div class="fchips">
<sc-for list="{{ sorts }}" as="s" hint-placeholder-count="4">
<button type="button" onClick="{{ s.pick }}" aria-pressed="{{ s.on }}" class="fchip" style="height:32px;font-weight:{{ s.fw }}">{{ s.label }}</button>
</sc-for>
</div>
</div>
<div class="pgrid3">
<sc-for list="{{ items }}" as="p" hint-placeholder-count="6">${PCARD}</sc-for>
</div>
</main>
</div>
` })
});

/* ───────────────────────── SEARCH ───────────────────────── */
W.convert({
  file: 'Search.dc.html', surface: 'public', active: 'market', w: 1440, h: 1300,
  extra: `stateLabel: ({ ar: 'الحالة', fr: 'État de l’écran', en: 'Screen state' })[this.state.lang],`,
  css: SEC + `
.bigsearch{display:flex;align-items:center;gap:12px;height:60px;padding:0 20px;border:1px solid var(--rule-strong);border-radius:var(--r-lg);background:var(--surface);box-shadow:var(--e1);margin-bottom:20px}
.sk{background:linear-gradient(90deg,var(--surface-3),var(--surface-2),var(--surface-3));border-radius:var(--r-sm)}
.empty{max-width:640px;margin:30px auto;text-align:center;padding:40px}
`,
  markup: W.siteShell({ statebar: W.STATEBAR('states', 'stateLabel'), inner: `
<div class="bigsearch">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" stroke-width="2" style="flex:none"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
<input value="{{ q }}" onChange="{{ onQ }}" aria-label="{{ t.search }}" placeholder="{{ t.search }}" style="flex:1;min-width:0;border:0;background:transparent;font-size:18px;color:inherit;outline:none">
<sc-if value="{{ hasQ }}" hint-placeholder-val="{{ true }}"><button type="button" onClick="{{ clear }}" class="btn">{{ t.clear }}</button></sc-if>
</div>

<nav class="tabs-h" aria-label="{{ t.scope }}">
<sc-for list="{{ scopes }}" as="s" hint-placeholder-count="4">
<button type="button" onClick="{{ s.pick }}" aria-current="{{ s.on }}" class="tab-h">{{ s.label }}<sc-if value="{{ s.hasN }}" hint-placeholder-val="{{ true }}"><span class="num" style="font-size:var(--t-xs);color:var(--ink-3)"><bdi>{{ s.n }}</bdi></span></sc-if></button>
</sc-for>
</nav>

<sc-if value="{{ showFilters }}" hint-placeholder-val="{{ true }}">
<div class="fchips" style="margin-bottom:20px">
<sc-for list="{{ chips }}" as="c" hint-placeholder-count="5"><button type="button" onClick="{{ c.pick }}" aria-pressed="{{ c.on }}" class="fchip" style="border-color:{{ c.bd }};background:{{ c.bg }};color:{{ c.fg }}">{{ c.label }}</button></sc-for>
</div>
</sc-if>

<sc-if value="{{ isLoading }}" hint-placeholder-val="{{ false }}">
<div class="pgrid"><sc-for list="{{ skeletons }}" as="k" hint-placeholder-count="4"><div class="pcard"><div class="sk" style="aspect-ratio:4/5;border-radius:0"></div><div style="padding:14px;display:flex;flex-direction:column;gap:8px"><div class="sk" style="height:13px;width:90%"></div><div class="sk" style="height:13px;width:60%"></div><div class="sk" style="height:18px;width:40%"></div></div></div></sc-for></div>
</sc-if>

<sc-if value="{{ isProducts }}" hint-placeholder-val="{{ true }}">
<div>
<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:16px"><span class="num" style="color:var(--ink-2)"><bdi>{{ resultLine }}</bdi></span><button type="button" class="link">{{ t.newest }}</button></div>
<div class="pgrid">
<sc-for list="{{ products }}" as="p" hint-placeholder-count="4">
<article class="pcard"><span class="img img-card ph {{ p.ph }}" style="border-radius:0"></span><div style="padding:14px 16px;display:flex;flex-direction:column;gap:8px"><h3 class="clamp2" style="margin:0;font-size:var(--t-body);font-weight:400;min-height:42px">{{ p.title }}</h3><div class="num" style="font-size:20px;font-weight:600"><bdi>{{ p.price }}</bdi></div><div style="display:flex;align-items:center;gap:6px;padding-top:9px;border-top:1px solid var(--rule-faint)"><span style="flex:1;font-size:var(--t-sm);color:var(--ink-2)">{{ p.seller }}</span>${VERIFIED('', 13)}</div></div></article>
</sc-for>
</div>
</div>
</sc-if>

<sc-if value="{{ isPeople }}" hint-placeholder-val="{{ false }}">
<div class="cols cols-3">
<sc-for list="{{ people }}" as="p" hint-placeholder-count="3">
<article class="panel" style="padding:20px;display:flex;align-items:center;gap:14px"><span class="av" style="width:54px;height:54px;font-size:14px;background:{{ p.avBg }};color:{{ p.avFg }}">{{ p.initials }}</span><div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:6px"><span style="font-size:var(--t-h3);font-weight:600">{{ p.name }}</span>${VERIFIED('', 14)}</div><div style="font-size:var(--t-sm);color:var(--ink-2);margin-top:3px">{{ p.kind }}</div><div class="num" style="font-size:var(--t-xs);color:var(--ink-3);margin-top:3px"><bdi>{{ p.meta }}</bdi></div></div></article>
</sc-for>
</div>
</sc-if>

<sc-if value="{{ isTrips }}" hint-placeholder-val="{{ false }}">
<div class="cols cols-3">
<sc-for list="{{ trips }}" as="tr" hint-placeholder-count="2">
<article class="panel" style="padding:20px;display:flex;align-items:center;gap:14px"><span aria-hidden="true" style="flex:none;width:52px;height:52px;border-radius:var(--r-sm);background:{{ tr.bg }};display:grid;place-items:center;font-weight:600;color:{{ tr.fg }}">{{ tr.cc }}</span><div style="flex:1;min-width:0"><div style="display:flex;align-items:baseline;gap:8px"><span style="font-size:var(--t-h3);font-weight:600">{{ tr.dest }}</span><span class="num" style="font-size:var(--t-sm);color:var(--ink-3)"><bdi>{{ tr.dates }}</bdi></span></div><div style="font-size:var(--t-sm);color:var(--ink-2);margin-top:3px">{{ tr.cats }}</div><div style="display:flex;align-items:center;gap:8px;margin-top:8px"><span class="chip {{ tr.chip }}">{{ tr.cap }}</span><span class="num" style="font-size:var(--t-xs);color:var(--ink-3)"><bdi>{{ tr.who }}</bdi></span></div></div></article>
</sc-for>
</div>
</sc-if>

<sc-if value="{{ isEmpty }}" hint-placeholder-val="{{ false }}">
<section class="panel empty">
<span aria-hidden="true" style="display:inline-grid;place-items:center;width:64px;height:64px;border-radius:50%;background:var(--neutral-bg);color:var(--ink-3);margin-bottom:16px"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></span>
<h2 style="margin:0 0 8px;font-size:24px;font-weight:600">{{ emptyTitle }}</h2>
<p style="margin:0 0 20px;color:var(--ink-2);line-height:1.7">{{ t.emptyLede }}</p>
<div class="fchips" style="justify-content:center;margin-bottom:20px"><sc-for list="{{ suggestions }}" as="s" hint-placeholder-count="3"><button type="button" class="fchip">{{ s }}</button></sc-for></div>
<button type="button" class="btn btn-primary btn-lg">{{ t.postRequest }}</button>
</section>
</sc-if>

<sc-if value="{{ isError }}" hint-placeholder-val="{{ false }}">
<section class="panel empty">
<span aria-hidden="true" style="display:inline-grid;place-items:center;width:64px;height:64px;border-radius:50%;background:var(--prohibited-bg);color:var(--prohibited-ink);font-size:26px;margin-bottom:16px">!</span>
<h2 style="margin:0 0 8px;font-size:24px;font-weight:600">{{ t.errTitle }}</h2>
<p style="margin:0 0 20px;color:var(--ink-2)">{{ t.errLede }}</p>
<button type="button" class="btn btn-dark btn-lg">{{ t.retry }}</button>
</section>
</sc-if>

<sc-if value="{{ isOffline }}" hint-placeholder-val="{{ false }}">
<div>
<div class="note" style="margin-bottom:18px"><span class="i" style="color:var(--conditional)">●</span><span>{{ t.offline }}</span></div>
<div class="pgrid" style="opacity:.72"><sc-for list="{{ products }}" as="p" hint-placeholder-count="4"><article class="pcard"><span class="img img-card ph {{ p.ph }}" style="border-radius:0"></span><div style="padding:14px 16px"><div class="clamp2" style="font-size:var(--t-body);min-height:42px">{{ p.title }}</div><div class="num" style="font-size:20px;font-weight:600;margin-top:6px"><bdi>{{ p.price }}</bdi></div></div></article></sc-for></div>
</div>
</sc-if>
` })
});

/* ───────────────────────── PRODUCT DETAIL ───────────────────────── */
W.convert({
  file: 'Product Detail.dc.html', surface: 'public', active: 'market', w: 1440, h: 1700,
  css: SEC + `
.pd{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:40px;align-items:start;margin-bottom:40px}
.thumbs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:12px}
.disc{width:100%;display:flex;align-items:center;gap:12px;padding:16px 20px;border:0;background:transparent;color:inherit;text-align:start;cursor:pointer;font-size:var(--t-body)}
.simgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:22px}
@media (max-width:980px){.pd{grid-template-columns:1fr}}
`,
  markup: W.siteShell({ inner: `
<div class="crumb" style="margin-bottom:18px"><button type="button" aria-label="{{ t.back }}" style="display:inline-flex;align-items:center;gap:6px"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transform:scaleX({{ backFlip }})"><path d="M15 5l-7 7 7 7"/></svg>{{ sh.current }}</button></div>

<div class="pd">
<div>
<span class="img img-hero ph {{ ph }}" style="border:1px solid var(--rule-faint);border-radius:var(--r-lg)"></span>
<div class="thumbs"><sc-for list="{{ thumbs }}" as="th" hint-placeholder-count="4"><span class="img img-thumb ph {{ th.ph }}" style="border:2px solid {{ th.bd }};border-radius:var(--r-sm)"></span></sc-for></div>
</div>

<div class="stack" style="gap:22px">
<div>
<h1 style="margin:0 0 14px;font-size:32px;font-weight:600;line-height:1.3">{{ title }}</h1>
<div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:14px"><span class="num" style="font-size:36px;font-weight:600"><bdi>{{ price }}</bdi></span><span class="num" style="font-size:var(--t-body);color:var(--ink-3)"><bdi>{{ perUnit }}</bdi></span></div>
<div class="fchips"><span class="chip {{ availChip }}">{{ availLabel }}</span><span class="chip chip-neutral"><bdi>{{ origin }}</bdi></span><span class="chip chip-neutral"><bdi>{{ updated }}</bdi></span></div>
</div>

<div style="display:flex;gap:10px;flex-wrap:wrap">
<button type="button" class="btn btn-primary btn-lg" style="flex:1;min-width:200px">{{ t.message }}</button>
<button type="button" class="btn btn-lg">{{ t.askStock }}</button>
<button type="button" onClick="{{ save }}" aria-pressed="{{ saved }}" aria-label="{{ saveLabel }}" class="btn btn-lg" style="padding:0 14px">${HEART('{{ heartFill }}', '{{ heartStroke }}', 20)}</button>
<button type="button" aria-label="{{ t.share }}" class="btn btn-lg" style="padding:0 14px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="6" cy="12" r="2.4"/><circle cx="17" cy="6" r="2.4"/><circle cx="17" cy="18" r="2.4"/><path d="M8.2 10.9l6.6-3.6M8.2 13.1l6.6 3.6"/></svg></button>
</div>

<section class="panel">
<button type="button" class="panel-b" style="width:100%;display:flex;align-items:center;gap:14px;border:0;background:none;text-align:start;cursor:pointer;color:inherit">
<span class="av" style="width:52px;height:52px;font-size:15px;background:var(--role-trader-bg);color:var(--role-trader-ink)">{{ initials }}</span>
<span style="flex:1;min-width:0"><span style="display:flex;align-items:center;gap:6px"><span style="font-size:var(--t-h3);font-weight:600">{{ seller }}</span>${VERIFIED('{{ t.verifiedShop }}', 15)}</span><span class="num" style="display:block;font-size:var(--t-sm);color:var(--ink-2);margin-top:4px"><bdi>{{ sellerMeta }}</bdi></span></span>
<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" stroke-width="2" style="flex:none;transform:scaleX({{ arrow }})"><path d="M15 5l-7 7 7 7"/></svg>
</button>
<div style="display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--rule-faint)">
<sc-for list="{{ trustStats }}" as="s" hint-placeholder-count="3"><div style="padding:14px;text-align:center"><div class="num" style="font-size:20px;font-weight:600"><bdi>{{ s.v }}</bdi></div><div style="font-size:var(--t-xs);color:var(--ink-2);margin-top:3px">{{ s.k }}</div></div></sc-for>
</div>
</section>

<section class="panel">
<div class="rows">
<sc-for list="{{ specs }}" as="s" hint-placeholder-count="6"><div style="display:flex;justify-content:space-between;gap:16px;padding:12px 20px"><span style="font-size:var(--t-sm);color:var(--ink-2)">{{ s.k }}</span><span class="num" style="font-size:var(--t-sm);font-weight:500;text-align:end"><bdi>{{ s.v }}</bdi></span></div></sc-for>
</div>
<div class="panel-f"><p style="margin:0;font-size:var(--t-body);line-height:1.75">{{ desc }}</p></div>
</section>
</div>
</div>

<div class="split" style="margin-bottom:44px">
<section class="panel">
<div class="panel-h"><h2>{{ t.reviewsTitle }}</h2><button type="button" class="link">{{ t.all }}</button></div>
<div class="rows">
<sc-for list="{{ reviews }}" as="r" hint-placeholder-count="2">
<div style="padding:18px 20px"><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="font-weight:600">{{ r.name }}</span><span class="chip chip-verified">{{ t.confirmedBuy }}</span><span class="num" style="margin-inline-start:auto;font-size:var(--t-xs);color:var(--ink-3)"><bdi>{{ r.when }}</bdi></span></div><p style="margin:0;line-height:1.7;color:var(--ink-2)">{{ r.text }}</p></div>
</sc-for>
</div>
</section>
<aside class="panel">
<sc-for list="{{ discs }}" as="d" hint-placeholder-count="3">
<div style="border-top:1px solid {{ d.bt }}">
<button type="button" onClick="{{ d.toggle }}" aria-expanded="{{ d.open }}" class="disc">
<span aria-hidden="true" style="flex:none;width:26px;height:26px;border-radius:50%;background:{{ d.iconBg }};display:grid;place-items:center;font-size:12px;font-weight:600;color:{{ d.iconFg }}">{{ d.glyph }}</span>
<span style="flex:1;font-weight:500">{{ d.label }}</span><span style="font-size:var(--t-xs);color:var(--ink-3)">{{ d.hint }}</span>
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" stroke-width="2" style="flex:none;transform:rotate({{ d.rot }}deg)"><path d="M6 9l6 6 6-6"/></svg>
</button>
<sc-if value="{{ d.open }}" hint-placeholder-val="{{ false }}">
<div style="padding:0 20px 16px;padding-inline-start:58px"><p style="margin:0 0 10px;font-size:var(--t-sm);line-height:1.7;color:var(--ink-2)">{{ d.body }}</p>
<sc-if value="{{ d.hasCite }}" hint-placeholder-val="{{ false }}"><div style="display:flex;justify-content:space-between;gap:10px;padding:10px 12px;background:var(--surface-2);border:1px solid var(--rule-faint);border-radius:var(--r-sm)"><span class="ref">{{ d.cite }}</span><a href="#" style="font-size:var(--t-xs)">{{ d.citeLink }}</a></div></sc-if></div>
</sc-if>
</div>
</sc-for>
</aside>
</div>

<div class="sech"><h2>{{ t.similarTitle }}</h2></div>
<div class="simgrid">
<sc-for list="{{ similar }}" as="p" hint-placeholder-count="3"><article class="pcard"><span class="img img-card ph {{ p.ph }}" style="border-radius:0"></span><div style="padding:14px 16px"><div class="clamp2" style="font-size:var(--t-body);min-height:42px">{{ p.title }}</div><div class="num" style="font-size:18px;font-weight:600;margin-top:6px"><bdi>{{ p.price }}</bdi></div></div></article></sc-for>
</div>
` })
});
