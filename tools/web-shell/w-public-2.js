const W = require('./weblib.js');
const VERIFIED = (label, size = 14) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="flex:none" role="img" aria-label="${label}"><circle cx="12" cy="12" r="10" fill="var(--allowed)"/><path d="M7.4 12.4l3 3 6.2-6.6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const HEART = (fill, stroke, size = 18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="${stroke}" stroke-width="1.9"><path d="M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.7c0 4.9-7 9.3-7 9.3z"/></svg>`;
const BACK = `<div class="crumb" style="margin-bottom:16px"><button type="button" aria-label="{{ t.back }}" style="display:inline-flex;align-items:center;gap:6px"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transform:scaleX({{ backFlip }})"><path d="M15 5l-7 7 7 7"/></svg>{{ sh.current }}</button></div>`;

/* ───────────────────────── SELLER PROFILE ───────────────────────── */
W.convert({
  file: 'Seller Profile.dc.html', surface: 'public', active: 'market', w: 1440, h: 1500,
  css: `
.cover{height:150px;border-radius:var(--r-lg) var(--r-lg) 0 0;background:linear-gradient(120deg, var(--brand-bg), var(--role-trader-bg))}
.idrow{display:flex;align-items:flex-end;gap:20px;flex-wrap:wrap;padding:0 28px 24px;margin-top:-46px}
.pgrid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}
@media (max-width:1240px){.pgrid3{grid-template-columns:repeat(2,minmax(0,1fr))}}
`,
  markup: W.siteShell({ inner: `
${BACK}

<section class="panel" style="margin-bottom:26px;overflow:hidden">
<div class="cover"></div>
<div class="idrow">
<span class="av" style="width:104px;height:104px;font-size:30px;border-radius:var(--r-lg);border:4px solid var(--surface);background:var(--role-trader-bg);color:var(--role-trader-ink)">{{ initials }}</span>
<div style="flex:1;min-width:260px;padding-bottom:4px">
<div style="display:flex;align-items:center;gap:8px"><h1 style="margin:0;font-size:30px;font-weight:600">{{ name }}</h1>${VERIFIED('{{ t.verifiedShop }}', 20)}</div>
<div style="font-size:var(--t-body);color:var(--ink-2);margin-top:5px">{{ kind }}</div>
<div class="num" style="font-size:var(--t-sm);color:var(--ink-3);margin-top:3px"><bdi>{{ since }}</bdi></div>
</div>
<button type="button" class="btn btn-primary btn-lg">{{ t.message }}</button>
<button type="button" class="btn btn-lg">{{ t.askStock }}</button>
<button type="button" onClick="{{ save }}" aria-pressed="{{ saved }}" aria-label="{{ saveLabel }}" class="btn btn-lg" style="padding:0 14px">${HEART('{{ heartFill }}', '{{ heartStroke }}', 20)}</button>
</div>
</section>

<div class="split-l" style="display:grid;gap:26px;align-items:start">
<aside class="stack sticky">
<div class="stats" style="grid-template-columns:1fr">
<sc-for list="{{ stats }}" as="s" hint-placeholder-count="3">
<div class="stat" style="border-inline-start:0;border-top:1px solid var(--rule-faint)"><div class="v num" style="color:{{ s.fg }}"><bdi>{{ s.v }}</bdi></div><div class="k">{{ s.k }}</div></div>
</sc-for>
</div>
<section class="panel"><div class="panel-b">
<p style="margin:0 0 14px;font-size:var(--t-body);line-height:1.7;color:var(--ink-2)">{{ bio }}</p>
<div class="fchips"><sc-for list="{{ cats }}" as="c" hint-placeholder-count="4"><span class="chip chip-neutral">{{ c }}</span></sc-for></div>
</div></section>
<section class="panel">
<div class="rows">
<sc-for list="{{ verified }}" as="v" hint-placeholder-count="3">
<div style="display:flex;align-items:center;gap:10px;padding:12px 18px">${VERIFIED('', 16)}<span style="font-size:var(--t-sm)">{{ v }}</span></div>
</sc-for>
</div>
<div class="panel-f" style="font-size:var(--t-xs);color:var(--ink-3)">{{ t.notEndorsement }}</div>
</section>
</aside>

<div class="stack" style="gap:30px">
<section>
<div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:16px"><h2 style="margin:0;font-size:24px;font-weight:600">{{ t.listings }}</h2><span class="num" style="color:var(--ink-3)"><bdi>{{ listingCount }}</bdi></span></div>
<div class="pgrid3">
<sc-for list="{{ products }}" as="p" hint-placeholder-count="4">
<article class="pcard">
<div style="position:relative"><span class="img img-card ph {{ p.ph }}" style="border-radius:0"></span>
<sc-if value="{{ p.hasFlag }}" hint-placeholder-val="{{ false }}"><span style="position:absolute;inset-block-start:12px;inset-inline-start:12px;height:24px;padding:0 10px;display:inline-flex;align-items:center;border-radius:999px;background:{{ p.flagBg }};color:{{ p.flagFg }};font-size:var(--t-xs);font-weight:500">{{ p.flag }}</span></sc-if></div>
<div style="padding:14px 16px"><h3 class="clamp2" style="margin:0;font-size:var(--t-body);font-weight:400;min-height:42px">{{ p.title }}</h3>
<div style="display:flex;align-items:baseline;gap:6px;margin-top:8px"><span class="num" style="font-size:20px;font-weight:600"><bdi>{{ p.price }}</bdi></span><span class="num" style="font-size:var(--t-sm);color:var(--ink-3)"><bdi>{{ t.cur }}</bdi></span></div></div>
</article>
</sc-for>
</div>
</section>

<section class="panel">
<div class="panel-h"><h2>{{ t.reviewsTitle }}</h2><span class="meta num"><bdi>{{ reviewCount }}</bdi></span></div>
<div class="rows">
<sc-for list="{{ reviews }}" as="r" hint-placeholder-count="2">
<div style="padding:18px 20px">
<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="font-weight:600">{{ r.by }}</span><span class="chip chip-verified">{{ t.confirmedBuy }}</span><span class="num" style="margin-inline-start:auto;font-size:var(--t-xs);color:var(--ink-3)"><bdi>{{ r.when }}</bdi></span></div>
<p style="margin:0;line-height:1.7;color:var(--ink-2)">{{ r.text }}</p>
<sc-if value="{{ r.hasReply }}" hint-placeholder-val="{{ false }}">
<div style="margin-top:12px;padding:12px 14px;background:var(--surface-2);border-radius:var(--r-sm);border-inline-start:3px solid var(--rule-strong)"><div style="font-size:var(--t-xs);color:var(--ink-3);margin-bottom:5px">{{ replyFrom }}</div><p style="margin:0;font-size:var(--t-sm);line-height:1.65;color:var(--ink-2)">{{ r.reply }}</p></div>
</sc-if>
</div>
</sc-for>
</div>
</section>
</div>
</div>
` })
});

/* ───────────────────────── SAVED ───────────────────────── */
W.convert({
  file: 'Saved.dc.html', surface: 'public', active: '', w: 1440, h: 1200,
  extra: `stateLabel: ({ ar: 'الحالة', fr: 'État de l’écran', en: 'Screen state' })[this.state.lang],`,
  css: `.empty{max-width:620px;margin:20px auto;padding:44px;text-align:center}`,
  markup: W.siteShell({ statebar: W.STATEBAR('views', 'stateLabel'), inner: `
<div class="page-head" style="margin-bottom:18px"><div class="grow"><h1 style="margin:0;font-size:30px;font-weight:600">{{ t.title }}</h1></div></div>

<nav class="tabs-h" aria-label="{{ t.kind }}">
<sc-for list="{{ tabs }}" as="tb" hint-placeholder-count="3">
<button type="button" onClick="{{ tb.pick }}" aria-current="{{ tb.on }}" class="tab-h">{{ tb.label }}<span class="num" style="font-size:var(--t-xs);color:var(--ink-3)"><bdi>{{ tb.n }}</bdi></span></button>
</sc-for>
</nav>

<sc-if value="{{ isProd }}" hint-placeholder-val="{{ true }}">
<div class="pgrid">
<sc-for list="{{ products }}" as="p" hint-placeholder-count="4">
<article class="pcard" style="opacity:{{ p.op }}">
<div style="position:relative">
<span class="img img-card ph {{ p.ph }}" style="border-radius:0"></span>
<button type="button" aria-label="{{ t.unsave }}" style="position:absolute;inset-block-start:10px;inset-inline-end:10px;width:36px;height:36px;border:0;border-radius:50%;background:oklch(1 0 0 / 0.9);display:grid;place-items:center;cursor:pointer;box-shadow:var(--e1)">${HEART('var(--brand)', 'var(--brand)', 17)}</button>
<sc-if value="{{ p.gone }}" hint-placeholder-val="{{ false }}"><span style="position:absolute;inset:0;background:oklch(1 0 0 / 0.62);display:grid;place-items:center"><span class="chip chip-neutral" style="background:var(--surface)">{{ p.goneLabel }}</span></span></sc-if>
</div>
<div style="padding:14px 16px;display:flex;flex-direction:column;gap:8px;flex:1">
<h3 class="clamp2" style="margin:0;font-size:var(--t-body);font-weight:400;min-height:42px">{{ p.title }}</h3>
<div style="display:flex;align-items:baseline;gap:8px"><span class="num" style="font-size:20px;font-weight:600;color:{{ p.priceFg }}"><bdi>{{ p.price }}</bdi></span>
<sc-if value="{{ p.dropped }}" hint-placeholder-val="{{ false }}"><span class="num" style="font-size:var(--t-sm);color:var(--ink-3);text-decoration:line-through"><bdi>{{ p.was }}</bdi></span></sc-if></div>
<sc-if value="{{ p.hasNote }}" hint-placeholder-val="{{ false }}"><div style="font-size:var(--t-sm);color:{{ p.noteFg }};font-weight:500">{{ p.note }}</div></sc-if>
<div style="font-size:var(--t-sm);color:var(--ink-2);padding-top:9px;border-top:1px solid var(--rule-faint);margin-top:auto">{{ p.seller }}</div>
</div>
</article>
</sc-for>
</div>
</sc-if>

<sc-if value="{{ isPeople }}" hint-placeholder-val="{{ false }}">
<div class="cols cols-3">
<sc-for list="{{ people }}" as="p" hint-placeholder-count="3">
<article class="panel" style="padding:20px;display:flex;align-items:flex-start;gap:14px">
<span class="av" style="width:54px;height:54px;font-size:14px;background:{{ p.avBg }};color:{{ p.avFg }}">{{ p.initials }}</span>
<div style="flex:1;min-width:0">
<div style="display:flex;align-items:center;gap:6px"><span style="font-size:var(--t-h3);font-weight:600">{{ p.name }}</span>${VERIFIED('', 14)}</div>
<div class="num" style="font-size:var(--t-sm);color:var(--ink-2);margin-top:4px"><bdi>{{ p.meta }}</bdi></div>
<sc-if value="{{ p.hasNews }}" hint-placeholder-val="{{ false }}"><span class="chip chip-brand" style="margin-top:10px">{{ p.news }}</span></sc-if>
</div>
<button type="button" aria-label="{{ t.remove }}" class="iconbtn" style="border:0">${HEART('var(--brand)', 'var(--brand)', 18)}</button>
</article>
</sc-for>
</div>
</sc-if>

<sc-if value="{{ isTrips }}" hint-placeholder-val="{{ false }}">
<div class="cols cols-3">
<sc-for list="{{ trips }}" as="tr" hint-placeholder-count="2">
<article class="panel" style="padding:20px;display:flex;align-items:center;gap:14px;opacity:{{ tr.op }}">
<span aria-hidden="true" style="flex:none;width:52px;height:52px;border-radius:var(--r-sm);background:{{ tr.bg }};display:grid;place-items:center;font-weight:600;color:{{ tr.fg }}">{{ tr.cc }}</span>
<div style="flex:1;min-width:0">
<div style="display:flex;align-items:baseline;gap:8px"><span style="font-size:var(--t-h3);font-weight:600">{{ tr.dest }}</span><span class="num" style="font-size:var(--t-sm);color:var(--ink-3)"><bdi>{{ tr.dates }}</bdi></span></div>
<div class="num" style="font-size:var(--t-sm);color:var(--ink-2);margin-top:3px"><bdi>{{ tr.who }}</bdi></div>
<span class="chip {{ tr.chip }}" style="margin-top:8px">{{ tr.state }}</span>
</div>
<sc-if value="{{ tr.expired }}" hint-placeholder-val="{{ false }}"><button type="button" class="btn">{{ t.drop }}</button></sc-if>
</article>
</sc-for>
</div>
</sc-if>

<sc-if value="{{ isEmpty }}" hint-placeholder-val="{{ false }}">
<section class="panel empty">
<span aria-hidden="true" style="display:inline-grid;place-items:center;width:64px;height:64px;border-radius:50%;background:var(--neutral-bg);color:var(--ink-3);margin-bottom:16px">${HEART('none', 'currentColor', 26)}</span>
<h2 style="margin:0 0 8px;font-size:24px;font-weight:600">{{ t.emptyTitle }}</h2>
<p style="margin:0 0 20px;line-height:1.7;color:var(--ink-2)">{{ t.emptyLede }}</p>
<button type="button" class="btn btn-primary btn-lg">{{ t.browse }}</button>
</section>
</sc-if>
` })
});

/* ───────────────────────── COMPLIANCE CHECKER ───────────────────────── */
W.convert({
  file: 'Compliance Checker.dc.html', surface: 'public', active: 'check', w: 1440, h: 1150, langKey: 'label',
  css: `
.hero{text-align:center;padding:26px 0 30px}
.hero h1{margin:0 0 10px;font-size:40px;font-weight:600;line-height:1.2}
.qform{display:flex;gap:10px;max-width:760px;margin:0 auto 14px}
.qinput{flex:1;min-width:0;height:58px;padding:0 18px;border:1px solid var(--rule-strong);border-radius:var(--r-lg);background:var(--surface);font-size:17px;color:inherit;box-shadow:var(--e1)}
.disc{width:100%;display:flex;align-items:center;gap:10px;padding:16px 20px;border:0;border-top:1px solid var(--rule-faint);background:transparent;color:inherit;text-align:start;cursor:pointer;font-size:var(--t-body)}
`,
  markup: W.siteShell({ tier: 'tier-comply', langKey: 'label', inner: `
<section class="hero">
<h1>{{ title }}</h1>
<p style="margin:0 0 26px;font-size:18px;color:var(--ink-2)">{{ subtitle }}</p>
<form onSubmit="{{ submit }}" class="qform">
<input value="{{ query }}" onChange="{{ onQuery }}" placeholder="{{ placeholder }}" aria-label="{{ fieldLabel }}" class="qinput">
<button type="submit" class="btn btn-dark" style="height:58px;padding:0 28px;font-size:16px">{{ cta }}</button>
</form>
<div class="fchips" style="justify-content:center"><sc-for list="{{ quick }}" as="q" hint-placeholder-count="5"><button type="button" class="fchip">{{ q }}</button></sc-for></div>
</section>

<div class="split split-wide">
<section aria-live="polite" class="panel" style="overflow:hidden">
<div style="padding:26px 28px;background:{{ vBg }};border-bottom:1px solid {{ vBd }};display:flex;align-items:center;gap:16px">
<span aria-hidden="true" style="flex:none;width:54px;height:54px;border-radius:50%;background:{{ vFg }};color:#fff;display:grid;place-items:center;font-size:26px;font-weight:600">{{ vGlyph }}</span>
<div style="flex:1;min-width:0"><div style="font-size:28px;font-weight:600;color:{{ vFg }};line-height:1.2">{{ vLabel }}</div><div style="font-size:var(--t-body);color:var(--ink-2);margin-top:5px"><bdi>{{ subject }}</bdi></div></div>
</div>
<div class="panel-b" style="padding:24px 28px">
<p style="margin:0 0 22px;font-size:17px;line-height:1.75">{{ reason }}</p>
<div style="font-size:var(--t-xs);font-weight:600;color:var(--ink-3);margin-bottom:10px">{{ nextLabel }}</div>
<sc-for list="{{ steps }}" as="s" hint-placeholder-count="2">
<div style="display:flex;gap:12px;align-items:flex-start;padding:6px 0"><span aria-hidden="true" style="flex:none;width:24px;height:24px;border-radius:50%;background:var(--brand-bg);color:var(--brand-ink);display:grid;place-items:center;font-size:12px;font-weight:600">{{ s.n }}</span><span style="font-size:var(--t-body);line-height:1.65">{{ s.t }}</span></div>
</sc-for>
</div>
</section>

<aside class="stack sticky">
<section class="panel" style="overflow:hidden">
<sc-for list="{{ discs }}" as="d" hint-placeholder-count="2">
<div>
<button type="button" onClick="{{ d.toggle }}" aria-expanded="{{ d.open }}" class="disc">
<span style="flex:1;font-weight:500">{{ d.label }}</span><span style="flex:none;font-size:var(--t-xs);color:var(--ink-3)">{{ d.hint }}</span>
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" stroke-width="2" style="flex:none;transform:rotate({{ d.rot }}deg)"><path d="M6 9l6 6 6-6"/></svg>
</button>
<sc-if value="{{ d.open }}" hint-placeholder-val="{{ false }}">
<div style="padding:0 20px 16px"><p style="margin:0 0 10px;font-size:var(--t-sm);line-height:1.75;color:var(--ink-2)">{{ d.body }}</p>
<sc-if value="{{ d.hasLink }}" hint-placeholder-val="{{ false }}"><a href="#" style="font-size:var(--t-sm);font-weight:500">{{ d.link }}</a></sc-if></div>
</sc-if>
</div>
</sc-for>
</section>
<button type="button" onClick="{{ share }}" class="btn btn-lg btn-block"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="6" cy="12" r="2.4"/><circle cx="17" cy="6" r="2.4"/><circle cx="17" cy="18" r="2.4"/><path d="M8.2 10.9l6.6-3.6M8.2 13.1l6.6 3.6"/></svg>{{ shareCta }}</button>
<p style="margin:0;font-size:var(--t-sm);line-height:1.65;color:var(--ink-3)">{{ disclaimer }}</p>
</aside>
</div>
` })
});
