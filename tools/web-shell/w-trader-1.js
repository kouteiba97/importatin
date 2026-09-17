const W = require('./weblib.js');
const STATE_LABEL = `stateLabel: ({ ar: 'الحالة', fr: 'État de l’écran', en: 'Screen state' })[this.state.lang],`;

/* ───────────────────────── TRADER HOME ───────────────────────── */
W.convert({
  file: 'Trader Home.dc.html', surface: 'trader', active: 'home', w: 1440, h: 1500,
  css: `.fgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}`,
  markup: W.appShell({ inner: `
<div class="page-head">
<div class="grow"><h1>{{ sh.current }}</h1><p class="sub">{{ t.oppsNote }}</p></div>
<div role="group" aria-label="{{ t.context }}" class="langsw">
<sc-for list="{{ ctx }}" as="c" hint-placeholder-count="2">
<button type="button" onClick="{{ c.pick }}" aria-pressed="{{ c.on }}" style="height:40px;padding:0 16px;font-size:var(--t-sm);background:{{ c.bg }};color:{{ c.fg }}">{{ c.label }}</button>
</sc-for>
</div>
<button type="button" class="btn btn-primary btn-lg">{{ t.newReq }}</button>
</div>

<h2 style="margin:0 0 14px;font-size:var(--t-h2);font-weight:600">{{ t.oppsTitle }}</h2>
<div class="cols cols-3" style="margin-bottom:28px">
<sc-for list="{{ opps }}" as="o" hint-placeholder-count="3">
<article class="panel" style="padding:20px;display:flex;flex-direction:column;gap:12px">
<div style="display:flex;align-items:center;gap:8px"><span class="chip {{ o.kindChip }}">{{ o.kind }}</span><span class="num" style="margin-inline-start:auto;font-size:var(--t-xs);color:var(--ink-3)"><bdi>{{ o.when }}</bdi></span></div>
<div style="font-size:var(--t-h2);font-weight:600;line-height:1.4"><bdi>{{ o.title }}</bdi></div>
<div class="num" style="font-size:var(--t-sm);color:var(--ink-2);line-height:1.65;flex:1"><bdi>{{ o.why }}</bdi></div>
<div style="display:flex;align-items:center;gap:10px;padding-top:12px;border-top:1px solid var(--rule-faint)">
<span class="av" style="width:32px;height:32px;font-size:11px;background:{{ o.avBg }};color:{{ o.avFg }}">{{ o.initials }}</span>
<span style="flex:1;min-width:0;font-size:var(--t-sm);color:var(--ink-2)">{{ o.who }}</span>
<span class="num" style="font-size:var(--t-xs);color:var(--ink-3)"><bdi>{{ o.tx }}</bdi></span>
</div>
<button type="button" class="btn btn-primary btn-block">{{ o.cta }}</button>
</article>
</sc-for>
</div>

<div class="split" style="margin-bottom:28px">
<div class="stack">
<section class="panel">
<div class="panel-h"><h2>{{ t.decTitle }}</h2><span class="meta">{{ t.decNote }}</span></div>
<div class="rows">
<sc-for list="{{ decisions }}" as="d" hint-placeholder-count="3">
<div style="display:flex;gap:14px;padding:16px 20px">
<span aria-hidden="true" style="flex:none;width:4px;align-self:stretch;border-radius:2px;background:{{ d.bar }}"></span>
<div style="flex:1;min-width:0">
<div style="display:flex;align-items:baseline;gap:10px"><span style="flex:1;font-size:var(--t-h3);font-weight:600">{{ d.title }}</span><span class="num" style="flex:none;font-size:var(--t-xs);font-weight:600;color:{{ d.timerFg }}"><bdi>{{ d.timer }}</bdi></span></div>
<p style="margin:6px 0 12px;font-size:var(--t-sm);color:var(--ink-2);line-height:1.6">{{ d.sub }}</p>
<div style="display:flex;gap:9px"><button type="button" class="btn btn-dark">{{ d.primary }}</button><button type="button" class="btn">{{ d.secondary }}</button></div>
</div>
</div>
</sc-for>
</div>
</section>

<section class="panel">
<div class="panel-h"><h2>{{ t.tripsTitle }}</h2><button type="button" class="link">{{ t.allTrips }}</button></div>
<table class="table">
<tbody>
<sc-for list="{{ trips }}" as="tr" hint-placeholder-count="3">
<tr>
<td style="width:64px"><span aria-hidden="true" style="width:44px;height:44px;border-radius:var(--r-sm);background:{{ tr.flagBg }};display:grid;place-items:center;font-size:var(--t-xs);font-weight:600;color:{{ tr.flagFg }}">{{ tr.cc }}</span></td>
<td><div style="font-size:var(--t-body);font-weight:600">{{ tr.dest }}</div><div class="num" style="font-size:var(--t-xs);color:var(--ink-3);margin-top:3px"><bdi>{{ tr.dates }}</bdi></div></td>
<td style="color:var(--ink-2)">{{ tr.cats }}</td>
<td><span class="chip {{ tr.capChip }}">{{ tr.cap }}</span></td>
<td class="num" style="color:var(--ink-2)"><bdi>{{ tr.whoLine }}</bdi></td>
<td style="text-align:end"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" stroke-width="2" style="transform:scaleX({{ arrow }})"><path d="M15 5l-7 7 7 7"/></svg></td>
</tr>
</sc-for>
</tbody>
</table>
</section>
</div>

<aside class="stack">
<section class="panel" style="background:var(--brand-bg);border-color:var(--brand-bd)"><div class="panel-b">
<div style="font-size:var(--t-xs);font-weight:600;color:var(--brand-ink);margin-bottom:8px">{{ t.nextStep }}</div>
<div style="font-size:var(--t-h2);font-weight:600;margin-bottom:8px">{{ next.title }}</div>
<p style="margin:0 0 16px;font-size:var(--t-sm);line-height:1.7;color:var(--ink-2)">{{ next.body }}</p>
<button type="button" class="btn btn-primary btn-block">{{ next.cta }}</button>
</div></section>

<section class="panel">
<div class="panel-h"><h2>{{ t.recordTitle }}</h2><button type="button" class="link">{{ t.details }}</button></div>
<div style="display:grid;grid-template-columns:repeat(3,1fr)">
<sc-for list="{{ rep }}" as="s" hint-placeholder-count="3">
<div style="padding:16px 12px;text-align:center"><div class="num" style="font-size:22px;font-weight:600"><bdi>{{ s.v }}</bdi></div><div style="font-size:var(--t-xs);color:var(--ink-2);margin-top:4px">{{ s.k }}</div></div>
</sc-for>
</div>
</section>

<section class="panel">
<div class="panel-h"><h2>{{ t.reqTitle }}</h2><button type="button" class="link">{{ t.all }}</button></div>
<div class="rows">
<sc-for list="{{ reqs }}" as="r" hint-placeholder-count="3">
<div style="display:flex;align-items:center;gap:10px;padding:13px 20px">
<span class="chip {{ r.chip }}" style="flex:none">{{ r.state }}</span>
<span style="flex:1;min-width:0;font-size:var(--t-sm)">{{ r.title }}</span>
<span class="num" style="flex:none;font-size:var(--t-xs);color:var(--ink-3)"><bdi>{{ r.meta }}</bdi></span>
</div>
</sc-for>
</div>
</section>
</aside>
</div>

<section class="panel">
<div class="panel-h"><h2>{{ t.freshTitle }}</h2><button type="button" class="link">{{ t.market }}</button></div>
<div class="panel-b fgrid">
<sc-for list="{{ fresh }}" as="p" hint-placeholder-count="4">
<article class="pcard">
<span class="img img-card ph {{ p.ph }}" style="border-radius:0"></span>
<div style="padding:12px 14px"><div class="clamp2" style="font-size:var(--t-sm);min-height:38px">{{ p.title }}</div><div class="num" style="font-size:var(--t-h3);font-weight:600;margin-top:6px"><bdi>{{ p.price }}</bdi></div></div>
</article>
</sc-for>
</div>
</section>
` })
});

/* ───────────────────────── DISCOVER ───────────────────────── */
W.convert({
  file: 'Discover.dc.html', surface: 'trader', active: 'disc', w: 1440, h: 1200,
  css: `
.meter{height:6px;border-radius:3px;background:var(--neutral-bg);overflow:hidden}
.meter>i{display:block;height:100%;border-radius:3px}
.searchbar{display:flex;align-items:center;gap:10px;height:52px;padding:0 16px;border:1px solid var(--rule-strong);border-radius:var(--r);background:var(--surface);box-shadow:var(--e1);margin-bottom:18px}
`,
  markup: W.appShell({ inner: `
<div class="page-head"><div class="grow"><h1>{{ t.title }}</h1><p class="sub num"><bdi>{{ scopeNote }}</bdi></p></div></div>

<div class="searchbar">
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" stroke-width="2" style="flex:none"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
<input value="{{ q }}" onChange="{{ onQ }}" placeholder="{{ placeholder }}" aria-label="{{ t.search }}" style="flex:1;min-width:0;border:0;background:transparent;font-size:16px;color:inherit;outline:none">
</div>

<nav class="tabs-h" aria-label="{{ t.sections }}" style="margin-bottom:16px">
<sc-for list="{{ tabs }}" as="tb" hint-placeholder-count="3">
<button type="button" onClick="{{ tb.pick }}" aria-current="{{ tb.on }}" class="tab-h">{{ tb.label }}</button>
</sc-for>
</nav>

<div class="fchips" style="margin-bottom:24px">
<sc-for list="{{ chips }}" as="c" hint-placeholder-count="5">
<button type="button" onClick="{{ c.pick }}" aria-pressed="{{ c.on }}" class="fchip" style="border-color:{{ c.bd }};background:{{ c.bg }};color:{{ c.fg }}">{{ c.label }}</button>
</sc-for>
</div>

<sc-if value="{{ isTrips }}" hint-placeholder-val="{{ true }}">
<div class="cols cols-3">
<sc-for list="{{ trips }}" as="tr" hint-placeholder-count="3">
<article class="panel" style="padding:20px;display:flex;flex-direction:column;gap:14px">
<div style="display:flex;align-items:flex-start;gap:12px">
<span aria-hidden="true" style="flex:none;width:48px;height:48px;border-radius:var(--r-sm);background:{{ tr.ccBg }};display:grid;place-items:center;font-size:var(--t-sm);font-weight:600;color:{{ tr.ccFg }}">{{ tr.cc }}</span>
<div style="flex:1;min-width:0">
<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span style="font-size:var(--t-h2);font-weight:600">{{ tr.dest }}</span><span class="chip {{ tr.stateChip }}">{{ tr.state }}</span></div>
<div class="num" style="font-size:var(--t-sm);color:var(--ink-2);margin-top:4px"><bdi>{{ tr.datesLine }}</bdi></div>
</div>
</div>
<div style="font-size:var(--t-sm);color:var(--ink-2)">{{ tr.catsLine }}</div>
<div style="padding:14px 0;border-block:1px solid var(--rule-faint);display:flex;flex-direction:column;gap:10px">
<div style="display:flex;justify-content:space-between;font-size:var(--t-xs);color:var(--ink-3)"><span>{{ capTitle }}</span><span>{{ tr.capNote }}</span></div>
<sc-for list="{{ tr.meters }}" as="m" hint-placeholder-count="2">
<div><div style="display:flex;justify-content:space-between;margin-bottom:5px"><span style="font-size:var(--t-sm);color:var(--ink-2)">{{ m.label }}</span><span class="num" style="font-size:var(--t-sm);font-weight:600"><bdi>{{ m.text }}</bdi></span></div><div class="meter"><i style="width:{{ m.pct }}%;background:{{ m.fg }}"></i></div></div>
</sc-for>
</div>
<div style="display:flex;align-items:center;gap:10px">
<span class="av" style="width:36px;height:36px;font-size:11px;background:{{ tr.avBg }};color:{{ tr.avFg }}">{{ tr.initials }}</span>
<div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:5px"><span style="font-size:var(--t-sm);font-weight:600">{{ tr.who }}</span><svg width="13" height="13" viewBox="0 0 24 24" role="img" aria-label="{{ verifiedImporter }}"><circle cx="12" cy="12" r="10" fill="var(--allowed)"/><path d="M7.4 12.4l3 3 6.2-6.6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="num" style="font-size:var(--t-xs);color:var(--ink-2);margin-top:2px"><bdi>{{ tr.whoMeta }}</bdi></div></div>
</div>
<div style="display:flex;gap:9px;margin-top:auto">
<button type="button" class="btn btn-primary" style="flex:1">{{ requestOffer }}</button>
<button type="button" onClick="{{ tr.follow }}" aria-pressed="{{ tr.followed }}" aria-label="{{ tr.followLabel }}" class="iconbtn"><svg width="17" height="17" viewBox="0 0 24 24" fill="{{ tr.bellFill }}" stroke="{{ tr.bellStroke }}" stroke-width="1.8"><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10.5 19.5a2 2 0 0 0 3 0" fill="none"/></svg></button>
</div>
</article>
</sc-for>
</div>
</sc-if>

<sc-if value="{{ isImporters }}" hint-placeholder-val="{{ false }}">
<div class="cols cols-3">
<sc-for list="{{ importers }}" as="im" hint-placeholder-count="3">
<article class="panel" style="padding:20px;display:flex;flex-direction:column;gap:14px">
<div style="display:flex;align-items:flex-start;gap:12px">
<span class="av" style="width:52px;height:52px;font-size:var(--t-sm);background:{{ im.avBg }};color:{{ im.avFg }}">{{ im.initials }}</span>
<div style="flex:1;min-width:0">
<div style="display:flex;align-items:center;gap:6px"><span style="font-size:var(--t-h2);font-weight:600">{{ im.name }}</span><svg width="15" height="15" viewBox="0 0 24 24" role="img" aria-label="{{ verified }}"><circle cx="12" cy="12" r="10" fill="var(--allowed)"/><path d="M7.4 12.4l3 3 6.2-6.6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
<div style="font-size:var(--t-sm);color:var(--ink-2);margin-top:3px">{{ im.level }}</div>
</div>
</div>
<div class="fchips"><sc-for list="{{ im.cats }}" as="c" hint-placeholder-count="3"><span class="chip chip-neutral">{{ c }}</span></sc-for></div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--rule);border-radius:var(--r-sm);overflow:hidden">
<sc-for list="{{ im.stats }}" as="s" hint-placeholder-count="4">
<div style="padding:11px 6px;text-align:center;border-inline-end:1px solid var(--rule-faint)"><div class="num" style="font-size:16px;font-weight:600;color:{{ s.fg }}"><bdi>{{ s.v }}</bdi></div><div style="font-size:var(--t-micro);color:var(--ink-2);margin-top:3px">{{ s.k }}</div></div>
</sc-for>
</div>
<div class="num" style="font-size:var(--t-sm);color:var(--ink-2)"><bdi>{{ im.next }}</bdi></div>
<div style="display:flex;gap:9px;margin-top:auto"><button type="button" class="btn" style="flex:1">{{ profile }}</button><button type="button" class="btn btn-dark" style="flex:1">{{ message }}</button></div>
</article>
</sc-for>
</div>
</sc-if>

<sc-if value="{{ isProducts }}" hint-placeholder-val="{{ false }}">
<section class="panel" style="padding:50px;text-align:center">
<p style="margin:0 0 18px;font-size:var(--t-body);color:var(--ink-2)">{{ productsLede }}</p>
<button type="button" class="btn btn-primary btn-lg">{{ openMarket }}</button>
</section>
</sc-if>
` })
});

/* ───────────────────────── IMPORTER PROFILE ───────────────────────── */
W.convert({
  file: 'Importer Profile.dc.html', surface: 'trader', active: 'disc', w: 1440, h: 1400,
  css: `
.bar{display:flex;align-items:flex-end;gap:8px;height:120px}
.bar>i{flex:1;border-radius:3px 3px 0 0;min-height:3px}
.overlay{position:fixed;inset:0;background:oklch(0.24 0.06 257 / 0.42);display:grid;place-items:center;z-index:60}
`,
  markup: W.appShell({ inner: `
<div class="crumb"><button type="button" aria-label="{{ t.back }}" style="display:inline-flex;align-items:center;gap:6px"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transform:scaleX({{ backFlip }})"><path d="M15 5l-7 7 7 7"/></svg>{{ sh.current }}</button></div>

<section class="panel" style="margin-bottom:24px"><div class="panel-b" style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;padding:24px">
<span class="av" style="width:84px;height:84px;font-size:24px;background:var(--role-importer-bg);color:var(--role-importer-ink)">{{ initials }}</span>
<div style="flex:1;min-width:260px">
<div style="display:flex;align-items:center;gap:8px"><h1 style="margin:0;font-size:28px;font-weight:600">{{ name }}</h1><svg width="20" height="20" viewBox="0 0 24 24" role="img" aria-label="{{ t.verified }}"><circle cx="12" cy="12" r="10" fill="var(--allowed)"/><path d="M7.4 12.4l3 3 6.2-6.6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
<div style="font-size:var(--t-body);color:var(--ink-2);margin-top:5px">{{ role }}</div>
<div class="num" style="font-size:var(--t-sm);color:var(--ink-3);margin-top:4px"><bdi>{{ since }}</bdi></div>
</div>
<button type="button" class="btn btn-primary btn-lg">{{ t.message }}</button>
<button type="button" class="btn btn-lg">{{ t.requestOffer }}</button>
<button type="button" class="iconbtn" aria-label="{{ t.report }}"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M5 21V4h10l-1.5 3.5L15 11H5"/></svg></button>
</div></section>

<div class="split">
<div class="stack">
<div class="stats">
<div class="stat"><div class="v num" style="font-size:36px"><bdi>{{ txCount }}</bdi></div><div class="k">{{ txLabel }}</div><div style="font-size:var(--t-xs);color:var(--ink-3);margin-top:3px">{{ t.txHint }}</div></div>
<sc-for list="{{ stats }}" as="s" hint-placeholder-count="3">
<button type="button" onClick="{{ s.open }}" class="stat" style="border:0;border-inline-start:1px solid var(--rule-faint);background:transparent;text-align:start;cursor:pointer;color:inherit;font:inherit">
<div class="v num" style="color:{{ s.fg }}"><bdi>{{ s.v }}</bdi></div><div class="k">{{ s.k }}</div><div style="font-size:var(--t-xs);color:var(--brand-ink);margin-top:3px">{{ t.breakdown }}</div>
</button>
</sc-for>
</div>

<section class="panel">
<div class="panel-h"><h2>{{ t.activityTitle }}</h2><span class="meta num"><bdi>{{ last12 }}</bdi></span></div>
<div class="panel-b">
<div class="bar"><sc-for list="{{ months }}" as="m" hint-placeholder-count="12"><i style="height:{{ m.h }}%;background:{{ m.fg }}" title="{{ m.t }}"></i></sc-for></div>
<div class="num" style="display:flex;justify-content:space-between;font-size:var(--t-xs);color:var(--ink-3);margin-top:8px"><bdi>{{ monthFrom }}</bdi><bdi>{{ monthTo }}</bdi></div>
<div style="display:flex;gap:40px;margin-top:18px;padding-top:16px;border-top:1px solid var(--rule-faint)">
<sc-for list="{{ activity }}" as="a" hint-placeholder-count="2"><div><div class="num" style="font-size:22px;font-weight:600"><bdi>{{ a.v }}</bdi></div><div style="font-size:var(--t-sm);color:var(--ink-2)">{{ a.k }}</div></div></sc-for>
</div>
</div>
</section>

<section class="panel">
<div class="panel-h"><h2>{{ t.reviewsTitle }}</h2><span class="meta num"><bdi>{{ reviewCount }}</bdi></span></div>
<div class="rows">
<sc-for list="{{ reviews }}" as="r" hint-placeholder-count="2">
<div style="padding:18px 20px">
<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="font-size:var(--t-body);font-weight:600">{{ r.by }}</span><span class="chip chip-verified">{{ recordedTx }}</span><span class="num" style="margin-inline-start:auto;font-size:var(--t-xs);color:var(--ink-3)"><bdi>{{ r.when }}</bdi></span></div>
<p style="margin:0;font-size:var(--t-body);line-height:1.7;color:var(--ink-2)">{{ r.text }}</p>
<sc-if value="{{ r.hasReply }}" hint-placeholder-val="{{ false }}">
<div style="margin-top:12px;padding:12px 14px;background:var(--surface-2);border-radius:var(--r-sm);border-inline-start:3px solid var(--rule-strong)"><div style="font-size:var(--t-xs);color:var(--ink-3);margin-bottom:5px">{{ replyFrom }}</div><p style="margin:0;font-size:var(--t-sm);line-height:1.65;color:var(--ink-2)">{{ r.reply }}</p></div>
</sc-if>
</div>
</sc-for>
</div>
</section>
</div>

<aside class="stack sticky">
<section class="panel">
<div class="panel-h"><h2>{{ t.verifiedTitle }}</h2></div>
<div class="rows">
<sc-for list="{{ docs }}" as="d" hint-placeholder-count="5">
<div style="display:flex;align-items:center;gap:10px;padding:12px 20px"><span aria-hidden="true" style="flex:none;width:20px;height:20px;border-radius:50%;background:{{ d.bg }};display:grid;place-items:center;font-size:10px">{{ d.glyph }}</span><span style="flex:1;min-width:0;font-size:var(--t-sm)">{{ d.label }}</span><span class="num" style="flex:none;font-size:var(--t-xs);color:{{ d.metaFg }}"><bdi>{{ d.meta }}</bdi></span></div>
</sc-for>
</div>
<div class="panel-f" style="font-size:var(--t-xs);color:var(--ink-3)">{{ t.notEndorsement }}</div>
</section>
<section class="panel"><div class="panel-h"><h2>{{ t.specTitle }}</h2></div><div class="panel-b">
<div style="font-size:var(--t-xs);color:var(--ink-3);margin-bottom:8px">{{ t.catsLabel }}</div>
<div class="fchips" style="margin-bottom:16px"><sc-for list="{{ cats }}" as="c" hint-placeholder-count="4"><span class="chip chip-neutral"><bdi>{{ c.line }}</bdi></span></sc-for></div>
<div style="font-size:var(--t-xs);color:var(--ink-3);margin-bottom:8px">{{ t.destsLabel }}</div>
<div class="fchips"><sc-for list="{{ dests }}" as="d" hint-placeholder-count="3"><span class="chip chip-neutral">{{ d }}</span></sc-for></div>
</div></section>
<section class="panel"><div class="panel-b" style="display:flex;align-items:center;gap:12px">
<span aria-hidden="true" style="flex:none;width:30px;height:30px;border-radius:50%;background:var(--allowed-bg);display:grid;place-items:center;color:var(--allowed-ink)">✓</span>
<div><div style="font-size:var(--t-body);font-weight:600">{{ disputeTitle }}</div><div class="num" style="font-size:var(--t-xs);color:var(--ink-2);margin-top:3px"><bdi>{{ disputeMeta }}</bdi></div></div>
</div></section>
</aside>
</div>

<sc-if value="{{ sheetOpen }}" hint-placeholder-val="{{ false }}">
<div role="dialog" aria-label="{{ t.breakdown }}" class="overlay">
<div class="panel" style="width:min(560px,92%);box-shadow:var(--e2)">
<div class="panel-h"><h2>{{ sheetTitle }}</h2><button type="button" onClick="{{ closeSheet }}" class="btn">{{ t.close }}</button></div>
<div class="panel-b">
<p style="margin:0 0 14px;font-size:var(--t-sm);line-height:1.7;color:var(--ink-2)">{{ sheetIntro }}</p>
<sc-for list="{{ sheetRows }}" as="r" hint-placeholder-count="3"><div style="display:flex;justify-content:space-between;gap:12px;padding:11px 0;border-top:1px solid var(--rule-faint)"><span style="font-size:var(--t-sm);color:var(--ink-2)">{{ r.k }}</span><span class="num" style="font-weight:600"><bdi>{{ r.v }}</bdi></span></div></sc-for>
<p style="margin:14px 0 0;font-size:var(--t-xs);color:var(--ink-3);line-height:1.65">{{ sheetFoot }}</p>
</div>
</div>
</div>
</sc-if>
` })
});

/* ───────────────────────── SOURCING REQUEST ───────────────────────── */
W.convert({
  file: 'Sourcing Request.dc.html', surface: 'trader', active: 'req', w: 1440, h: 1200, extra: STATE_LABEL,
  css: `.chipbtn{height:40px;padding:0 16px;border:1px solid var(--rule-strong);border-radius:999px;background:var(--surface);font-size:var(--t-sm);cursor:pointer}`,
  markup: W.appShell({ statebar: W.STATEBAR('views', 'stateLabel'), inner: `
<div class="page-head"><div class="grow"><div class="crumb"><button type="button" aria-label="{{ t.back }}" style="display:inline-flex;align-items:center;gap:6px"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transform:scaleX({{ backFlip }})"><path d="M15 5l-7 7 7 7"/></svg>{{ sh.current }}</button></div><h1>{{ headline }}</h1></div></div>

<sc-if value="{{ isCompose }}" hint-placeholder-val="{{ true }}">
<div class="split split-wide">
<section class="panel"><div class="panel-b" style="padding:30px 32px">
<h2 style="margin:0 0 8px;font-size:24px;font-weight:600">{{ t.composeTitle }}</h2>
<p style="margin:0 0 26px;color:var(--ink-2)">{{ t.composeLede }}</p>
<div style="margin-bottom:22px"><span class="field">{{ t.category }}</span><div class="fchips">
<sc-for list="{{ cats }}" as="c" hint-placeholder-count="5"><button type="button" onClick="{{ c.pick }}" aria-pressed="{{ c.on }}" class="chipbtn" style="border-color:{{ c.bd }};background:{{ c.bg }};color:{{ c.fg }}">{{ c.label }}</button></sc-for>
</div></div>
<div style="margin-bottom:22px"><label class="field" for="nm">{{ t.itemName }}</label><input id="nm" class="input" value="{{ t.item }}"></div>
<div style="margin-bottom:22px"><label class="field" for="sp">{{ t.spec }}</label><textarea id="sp" class="input" placeholder="{{ t.specPh }}" value="{{ t.specVal }}"></textarea>
<div class="fchips" style="margin-top:10px"><sc-for list="{{ specHints }}" as="h" hint-placeholder-count="3"><button type="button" class="sw">+ {{ h }}</button></sc-for></div></div>
<div class="cols cols-3" style="margin-bottom:22px">
<div><label class="field" for="qt">{{ t.qty }}</label><input id="qt" class="input num" value="120"></div>
<div><label class="field" for="dl">{{ t.deadline }}</label><select id="dl" class="input"><option>{{ t.dl1 }}</option><option>{{ t.dl2 }}</option><option>{{ t.dl3 }}</option></select></div>
<div><label class="field" for="wl">{{ t.wilaya }}</label><select id="wl" class="input"><option>{{ t.w1 }}</option><option>{{ t.w2 }}</option><option>{{ t.w3 }}</option></select></div>
</div>
<div><span class="field">{{ t.targetRange }}</span>
<div style="display:flex;align-items:center;gap:10px;max-width:520px"><input class="input num" value="{{ lo }}" style="flex:1"><span style="color:var(--ink-3)">—</span><input class="input num" value="{{ hi }}" style="flex:1"><span class="num" style="color:var(--ink-2)"><bdi>{{ t.cur }}</bdi></span></div>
<p style="margin:8px 0 0;font-size:var(--t-sm);color:var(--ink-3)">{{ t.rangeHint }}</p></div>
</div></section>
<aside class="stack sticky">
<section class="panel"><div class="panel-h"><h2>{{ t.whoSees }}</h2></div><div class="panel-b" style="display:flex;flex-direction:column;gap:10px">
<sc-for list="{{ visibility }}" as="v" hint-placeholder-count="2">
<button type="button" onClick="{{ v.pick }}" aria-pressed="{{ v.on }}" class="panel" style="padding:14px;display:flex;gap:11px;align-items:flex-start;text-align:start;cursor:pointer;color:inherit;border-color:{{ v.bd }};border-width:{{ v.bw }}px">
<span aria-hidden="true" style="flex:none;width:20px;height:20px;border-radius:50%;border:2px solid {{ v.dotBd }};background:{{ v.dotBg }};display:grid;place-items:center;color:#fff;font-size:10px">{{ v.check }}</span>
<span><span style="display:block;font-weight:600">{{ v.title }}</span><span style="display:block;font-size:var(--t-sm);color:var(--ink-2);margin-top:3px">{{ v.body }}</span></span>
</button>
</sc-for>
</div>
<div class="panel-f"><button type="button" onClick="{{ goSent }}" class="btn btn-primary btn-lg btn-block">{{ t.publish }}</button><p style="margin:10px 0 0;font-size:var(--t-xs);color:var(--ink-3);line-height:1.65">{{ t.publishNote }}</p></div>
</section>
</aside>
</div>
</sc-if>

<sc-if value="{{ isSent }}" hint-placeholder-val="{{ false }}">
<div class="split">
<section class="panel">
<div class="panel-h"><div style="display:flex;align-items:center;gap:10px"><h2>{{ t.item }}</h2><span class="chip chip-verified">{{ t.published }}</span></div><span class="meta num"><bdi>{{ sinceHrs }}</bdi></span></div>
<div class="cols cols-4 panel-b">
<sc-for list="{{ summary }}" as="s" hint-placeholder-count="4"><div><div style="font-size:var(--t-xs);color:var(--ink-3)">{{ s.k }}</div><div class="num" style="font-size:var(--t-h3);font-weight:600;margin-top:4px"><bdi>{{ s.v }}</bdi></div></div></sc-for>
</div>
<div class="panel-f" style="display:flex;gap:10px"><button type="button" onClick="{{ goOffers }}" class="btn btn-primary btn-lg">{{ t.seeOffers }}</button><button type="button" class="btn btn-lg">{{ t.edit }}</button></div>
</section>
<aside class="panel sticky" style="padding:26px;text-align:center">
<div class="num" style="font-size:48px;font-weight:600;line-height:1"><bdi>7</bdi></div>
<div style="font-size:var(--t-body);color:var(--ink-2);margin-top:8px">{{ t.matched }}</div>
<div style="font-size:var(--t-sm);color:var(--ink-3);margin-top:10px">{{ t.firstOffers }}</div>
</aside>
</div>
</sc-if>

<sc-if value="{{ isOffers }}" hint-placeholder-val="{{ false }}">
<div>
<div style="display:flex;align-items:baseline;gap:10px;margin-bottom:16px"><h2 style="margin:0;font-size:var(--t-h2);font-weight:600">{{ t.offers }}</h2><span class="num" style="font-size:var(--t-sm);color:var(--ink-3)"><bdi>{{ t.byRecord }}</bdi></span></div>
<div class="cols cols-3">
<sc-for list="{{ offers }}" as="o" hint-placeholder-count="3">
<article class="panel" style="padding:20px;display:flex;flex-direction:column;gap:14px">
<div style="display:flex;align-items:center;gap:12px"><span class="av" style="width:46px;height:46px;font-size:13px;background:{{ o.avBg }};color:{{ o.avFg }}">{{ o.initials }}</span><div><div style="font-size:var(--t-h3);font-weight:600">{{ o.name }}</div><div class="num" style="font-size:var(--t-xs);color:var(--ink-2);margin-top:3px"><bdi>{{ o.record }}</bdi></div></div></div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--rule);border-radius:var(--r-sm);overflow:hidden">
<sc-for list="{{ o.cells }}" as="c" hint-placeholder-count="3"><div style="padding:12px 6px;text-align:center;border-inline-end:1px solid var(--rule-faint)"><div class="num" style="font-size:var(--t-h3);font-weight:600;color:{{ c.fg }}"><bdi>{{ c.v }}</bdi></div><div style="font-size:var(--t-micro);color:var(--ink-2);margin-top:3px">{{ c.k }}</div></div></sc-for>
</div>
<p style="margin:0;font-size:var(--t-sm);line-height:1.7;color:var(--ink-2);flex:1">{{ o.note }}</p>
<div style="display:flex;gap:9px"><button type="button" onClick="{{ goAgree }}" class="btn" style="flex:1;background:{{ o.ctaBg }};color:{{ o.ctaFg }};border-color:var(--rule-strong)">{{ o.cta }}</button><button type="button" class="btn">{{ messageLabel }}</button></div>
</article>
</sc-for>
</div>
</div>
</sc-if>

<sc-if value="{{ isAgree }}" hint-placeholder-val="{{ false }}">
<div class="split">
<div class="stack">
<section class="panel"><div class="panel-b" style="padding:26px">
<h2 style="margin:0 0 8px;font-size:24px;font-weight:600">{{ t.agreeTitle }}</h2>
<p style="margin:0 0 20px;color:var(--ink-2)">{{ t.agreeLede }}</p>
<div class="rows" style="border:1px solid var(--rule);border-radius:var(--r)">
<sc-for list="{{ terms }}" as="tm" hint-placeholder-count="6"><div style="display:flex;justify-content:space-between;gap:14px;padding:13px 18px"><span style="color:var(--ink-2)">{{ tm.k }}</span><span class="num" style="font-weight:{{ tm.fw }};text-align:end"><bdi>{{ tm.v }}</bdi></span></div></sc-for>
</div>
</div></section>
<div class="cols cols-2">
<section class="panel"><div class="panel-b"><div style="font-weight:600;margin-bottom:8px">{{ t.ifPrice }}</div><p style="margin:0;font-size:var(--t-sm);line-height:1.7;color:var(--ink-2)">{{ t.ifPriceBody }}</p></div></section>
<div class="note"><span class="i">i</span><span>{{ t.moneyNote }}</span></div>
</div>
</div>
<aside class="panel sticky">
<div class="panel-b" style="display:flex;align-items:center;gap:12px"><span class="av" style="width:44px;height:44px;font-size:13px;background:var(--role-importer-bg);color:var(--role-importer-ink)">{{ t.cpInitials }}</span><div><div style="font-weight:600">{{ t.cpName }}</div><div class="num" style="font-size:var(--t-xs);color:var(--ink-2);margin-top:3px"><bdi>{{ cpMeta }}</bdi></div></div></div>
<div class="panel-f" style="display:flex;flex-direction:column;gap:10px"><button type="button" class="btn btn-primary btn-lg btn-block">{{ t.accept }}</button><button type="button" class="btn btn-lg btn-block">{{ t.propose }}</button></div>
</aside>
</div>
</sc-if>
` })
});
