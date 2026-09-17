const W = require('./weblib.js');

/* ───────────────────────── TRIP ───────────────────────── */
W.convert({
  file: 'Trip.dc.html', surface: 'importer', active: 'trip', w: 1440, h: 1200,
  css: `
.stages{display:flex;align-items:flex-start;padding:22px 26px}
.stage{flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;position:relative}
.meters3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px}
.meter{height:8px;border-radius:4px;background:var(--neutral-bg);overflow:hidden}
.meter>i{display:block;height:100%;border-radius:4px}
`,
  markup: W.appShell({ inner: `
<div class="page-head">
<div class="grow">
<div class="crumb">{{ sh.current }}</div>
<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
<span aria-hidden="true" style="flex:none;width:52px;height:52px;border-radius:var(--r);background:var(--brand-bg);display:grid;place-items:center;font-size:var(--t-body);font-weight:600;color:var(--brand-ink)">TR</span>
<h1>{{ dest }}</h1>
<span class="chip chip-verified">{{ status }}</span>
</div>
<p class="sub num"><bdi>{{ dates }}</bdi></p>
</div>
<button type="button" class="btn btn-lg">{{ t.exportList }}</button>
<button type="button" class="btn btn-primary btn-lg">{{ t.closeList }}</button>
</div>

<section class="panel" style="margin-bottom:24px">
<div class="stages">
<sc-for list="{{ stages }}" as="s" hint-placeholder-count="5">
<div class="stage">
<sc-if value="{{ s.line }}" hint-placeholder-val="{{ true }}">
<span aria-hidden="true" style="position:absolute;top:11px;inset-inline-start:-50%;width:100%;height:2px;background:{{ s.lineFg }}"></span>
</sc-if>
<span aria-hidden="true" style="position:relative;z-index:1;width:24px;height:24px;border-radius:50%;background:{{ s.dotBg }};border:2px solid {{ s.dotBd }};display:grid;place-items:center;font-size:11px;color:#fff">{{ s.glyph }}</span>
<span style="font-size:var(--t-sm);color:{{ s.fg }};font-weight:{{ s.fw }}">{{ s.label }}</span>
</div>
</sc-for>
</div>
</section>

<div class="split">
<div class="stack">
<section class="panel">
<div class="panel-h"><h2>{{ t.capTitle }}</h2></div>
<div class="panel-b meters3">
<sc-for list="{{ meters }}" as="m" hint-placeholder-count="3">
<div>
<div style="font-size:var(--t-sm);color:var(--ink-2);margin-bottom:6px">{{ m.label }}</div>
<div class="num" style="font-size:22px;font-weight:600;color:{{ m.fg }};margin-bottom:10px"><bdi>{{ m.text }}</bdi></div>
<div class="meter"><i style="width:{{ m.pct }}%;background:{{ m.fg }}"></i></div>
<div class="num" style="font-size:var(--t-xs);color:var(--ink-3);margin-top:8px;line-height:1.5"><bdi>{{ m.sub }}</bdi></div>
</div>
</sc-for>
</div>
</section>

<section class="panel">
<div class="panel-h"><h2>{{ t.listTitle }}</h2><button type="button" class="link">{{ t.addItem }}</button></div>
<div class="rows">
<sc-for list="{{ list }}" as="l" hint-placeholder-count="3">
<div style="display:flex;align-items:center;gap:16px;padding:14px 20px">
<span class="img ph {{ l.ph }}" style="flex:none;width:52px;height:64px;border-radius:var(--r-sm)"></span>
<div style="flex:1;min-width:0">
<div style="font-size:var(--t-h3);font-weight:600">{{ l.name }}</div>
<div class="num" style="font-size:var(--t-sm);color:var(--ink-2);margin-top:4px"><bdi>{{ l.qty }}</bdi></div>
</div>
<span class="chip {{ l.chip }}">{{ l.state }}</span>
<span class="num" style="flex:none;min-width:120px;text-align:end;font-size:var(--t-sm);color:var(--ink-2)"><bdi>{{ l.buyers }}</bdi></span>
</div>
</sc-for>
</div>
<div class="panel-f" style="display:flex;justify-content:space-between;align-items:baseline">
<span style="color:var(--ink-2)">{{ t.total }}</span>
<span class="num" style="font-size:var(--t-h2);font-weight:600"><bdi>{{ listTotal }}</bdi></span>
</div>
</section>
</div>

<div class="stack sticky">
<section class="panel">
<div class="panel-h"><h2>{{ t.buyersTitle }}</h2><span class="meta num"><bdi>{{ buyerCount }}</bdi></span></div>
<div class="rows">
<sc-for list="{{ buyers }}" as="b" hint-placeholder-count="3">
<div style="display:flex;align-items:center;gap:12px;padding:13px 20px">
<span class="av" style="width:38px;height:38px;font-size:11px;background:{{ b.avBg }};color:{{ b.avFg }}">{{ b.initials }}</span>
<div style="flex:1;min-width:0">
<div style="font-size:var(--t-sm);font-weight:600">{{ b.name }}</div>
<div class="num" style="font-size:var(--t-xs);color:var(--ink-2);margin-top:3px"><bdi>{{ b.meta }}</bdi></div>
</div>
<button type="button" class="btn" style="height:34px">{{ t.message }}</button>
</div>
</sc-for>
</div>
</section>

<section style="display:flex;gap:12px;padding:18px;border:1px solid var(--conditional-bd);border-radius:var(--r-lg);background:var(--conditional-bg)">
<span aria-hidden="true" style="flex:none;width:28px;height:28px;border-radius:50%;background:var(--conditional);color:#fff;display:grid;place-items:center;font-weight:600">!</span>
<div style="flex:1">
<div style="font-size:var(--t-body);font-weight:600;margin-bottom:5px">{{ t.declareTitle }}</div>
<p style="margin:0 0 12px;font-size:var(--t-sm);line-height:1.65;color:var(--ink-2)">{{ t.declareLede }}</p>
<button type="button" class="btn" style="background:var(--conditional-ink);border-color:var(--conditional-ink);color:#fff">{{ t.openAnae }}</button>
</div>
</section>
</div>
</div>
` })
});

/* ───────────────────────── TRIP CREATION ───────────────────────── */
W.convert({
  file: 'Trip Creation.dc.html', surface: 'importer', active: 'trip', w: 1440, h: 1100,
  css: `
.wz h2{margin:0 0 8px;font-size:26px;font-weight:600;line-height:1.3}
.wz .lede{margin:0 0 26px;font-size:var(--t-body);color:var(--ink-2);line-height:1.7}
.wz .sec{margin-bottom:24px}
.chipbtn{height:40px;padding:0 16px;border:1px solid var(--rule-strong);border-radius:999px;background:var(--surface);font-size:var(--t-sm);cursor:pointer;display:inline-flex;align-items:center;gap:7px}
.lock{display:flex;align-items:center;gap:6px;font-size:var(--t-xs);color:var(--ink-3)}
.progress{height:6px;border-radius:3px;background:var(--neutral-bg);overflow:hidden}
.progress>i{display:block;height:100%;background:var(--brand);border-radius:3px;transition:width .2s ease}
.wz-foot{display:flex;gap:12px;align-items:center;padding-top:22px;margin-top:8px;border-top:1px solid var(--rule-faint)}
`,
  markup: W.appShell({ inner: `
<div class="page-head">
<div class="grow">
<div class="crumb"><button type="button" onClick="{{ back }}" aria-label="{{ t.back }}" style="display:inline-flex;align-items:center;gap:6px"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transform:scaleX({{ backFlip }})"><path d="M15 5l-7 7 7 7"/></svg>{{ sh.current }}</button></div>
<h1>{{ t.title }}</h1>
</div>
<div style="min-width:280px">
<div class="num" style="font-size:var(--t-sm);color:var(--ink-2);margin-bottom:8px;text-align:end"><bdi>{{ stepLabel }}</bdi></div>
<div class="progress"><i style="width:{{ progress }}%"></i></div>
</div>
</div>

<div class="split split-wide">
<section class="panel wz"><div class="panel-b" style="padding:32px 36px">

<sc-if value="{{ is0 }}" hint-placeholder-val="{{ true }}">
<div>
<h2>{{ t.s0Title }}</h2><p class="lede">{{ t.s0Lede }}</p>
<div class="sec">
<label class="field" for="dst">{{ t.destination }}</label>
<div style="display:flex;align-items:center;gap:10px;height:48px;padding:0 14px;border:1px solid var(--rule-strong);border-radius:var(--r-sm);background:var(--surface)">
<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" stroke-width="2" style="flex:none"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
<input id="dst" value="{{ destName }}" placeholder="{{ t.destPh }}" style="flex:1;min-width:0;border:0;background:transparent;font-size:15px;color:inherit;outline:none">
</div>
<div style="font-size:var(--t-xs);color:var(--ink-3);margin:14px 0 9px">{{ t.mostUsed }}</div>
<div class="fchips">
<sc-for list="{{ dests }}" as="d" hint-placeholder-count="8">
<button type="button" onClick="{{ d.pick }}" aria-pressed="{{ d.on }}" class="chipbtn" style="border-color:{{ d.bd }};background:{{ d.bg }};color:{{ d.fg }}">{{ d.label }}</button>
</sc-for>
</div>
</div>
<div class="sec cols cols-3">
<div><label class="field" for="d1">{{ t.depart }}</label><input id="d1" class="input num" value="{{ t.d1 }}"></div>
<div><label class="field" for="d2">{{ t.ret }}</label><input id="d2" class="input num" value="{{ t.d2 }}"></div>
<div><label class="field" for="ar">{{ t.arrival }}</label><input id="ar" class="input num" value="{{ t.d3 }}"></div>
</div>
<p style="margin:-10px 0 22px;font-size:var(--t-sm);color:var(--ink-3)">{{ t.arrivalHint }}</p>
<div class="note" style="background:var(--allowed-bg);border-color:var(--allowed-bd);color:var(--ink)">
<span class="i" style="color:var(--allowed-ink)">✓</span>
<div><div style="font-weight:600">{{ tripOf }}</div><div style="font-size:var(--t-xs);color:var(--ink-2);margin-top:2px">{{ t.tripLeft }}</div></div>
</div>
<div class="wz-foot"><div style="flex:1"></div><button type="button" onClick="{{ next }}" class="btn btn-dark btn-lg">{{ t.cont }}</button></div>
</div>
</sc-if>

<sc-if value="{{ is1 }}" hint-placeholder-val="{{ false }}">
<div>
<h2>{{ t.s1Title }}</h2><p class="lede">{{ t.s1Lede }}</p>
<div class="fchips sec">
<sc-for list="{{ cats }}" as="c" hint-placeholder-count="7">
<button type="button" onClick="{{ c.pick }}" aria-pressed="{{ c.on }}" class="chipbtn" style="height:44px;border-color:{{ c.bd }};background:{{ c.bg }};color:{{ c.fg }};font-weight:{{ c.fw }}">
<sc-if value="{{ c.on }}" hint-placeholder-val="{{ false }}"><span aria-hidden="true">✓</span></sc-if>{{ c.label }}</button>
</sc-for>
</div>
<div class="note"><span class="i">i</span><span>{{ t.s1Note }}</span></div>
<div class="wz-foot"><div style="flex:1"></div><button type="button" onClick="{{ next }}" class="btn btn-dark btn-lg">{{ t.cont }}</button></div>
</div>
</sc-if>

<sc-if value="{{ is2 }}" hint-placeholder-val="{{ false }}">
<div>
<h2>{{ t.s2Title }}</h2><p class="lede">{{ t.s2Lede }}</p>
<div class="cols cols-2 sec">
<div class="panel" style="border-color:var(--allowed-bd)"><div class="panel-b">
<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
<span aria-hidden="true" style="flex:none;width:30px;height:30px;border-radius:50%;background:var(--allowed);color:#fff;display:grid;place-items:center">§</span>
<div><div style="font-size:var(--t-h3);font-weight:600">{{ t.value }}</div><div class="lock"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg> {{ t.legalLock }}</div></div>
</div>
<div class="num" style="font-size:30px;font-weight:600"><bdi>{{ maxValue }}</bdi></div>
<div class="num" style="font-size:var(--t-sm);color:var(--ink-2);margin-top:6px"><bdi>{{ valueNote }}</bdi></div>
</div></div>
<div class="panel"><div class="panel-b">
<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
<span aria-hidden="true" style="flex:none;width:30px;height:30px;border-radius:50%;background:var(--neutral-bg);color:var(--ink-2);display:grid;place-items:center">✎</span>
<div><div style="font-size:var(--t-h3);font-weight:600">{{ t.wv }}</div><div style="font-size:var(--t-xs);color:var(--ink-3)">{{ t.wvHint }}</div></div>
</div>
<div class="cols cols-2" style="gap:12px">
<div><label class="field" for="wg">{{ t.weightKg }}</label><input id="wg" class="input num" value="46"></div>
<div><label class="field" for="vl">{{ t.volM3 }}</label><input id="vl" class="input num" value="{{ volVal }}"></div>
</div>
<div class="fchips" style="margin-top:12px">
<sc-for list="{{ presets }}" as="p" hint-placeholder-count="3"><button type="button" class="sw">{{ p }}</button></sc-for>
</div>
</div></div>
</div>
<div class="wz-foot"><div style="flex:1"></div><button type="button" onClick="{{ next }}" class="btn btn-dark btn-lg">{{ t.cont }}</button></div>
</div>
</sc-if>

<sc-if value="{{ is3 }}" hint-placeholder-val="{{ false }}">
<div>
<h2>{{ t.s3Title }}</h2><p class="lede">{{ t.s3Lede }}</p>
<div class="cols cols-3 sec">
<sc-for list="{{ visibility }}" as="v" hint-placeholder-count="3">
<button type="button" onClick="{{ v.pick }}" aria-pressed="{{ v.on }}" class="panel" style="padding:18px;display:flex;flex-direction:column;gap:10px;text-align:start;cursor:pointer;color:inherit;border-color:{{ v.bd }};border-width:{{ v.bw }}px">
<span aria-hidden="true" style="width:22px;height:22px;border-radius:50%;border:2px solid {{ v.dotBd }};background:{{ v.dotBg }};display:grid;place-items:center;color:#fff;font-size:11px">{{ v.check }}</span>
<span style="font-size:var(--t-body);font-weight:600">{{ v.title }}</span>
<span style="font-size:var(--t-sm);color:var(--ink-2);line-height:1.6">{{ v.body }}</span>
</button>
</sc-for>
</div>
<div class="wz-foot"><div style="flex:1"></div><button type="button" onClick="{{ next }}" class="btn btn-dark btn-lg">{{ t.cont }}</button></div>
</div>
</sc-if>

<sc-if value="{{ is4 }}" hint-placeholder-val="{{ false }}">
<div>
<h2>{{ t.s4Title }}</h2>
<div class="rows sec" style="border:1px solid var(--rule);border-radius:var(--r);margin-top:18px">
<sc-for list="{{ review }}" as="r" hint-placeholder-count="6">
<div style="display:flex;justify-content:space-between;gap:16px;padding:14px 18px"><span style="color:var(--ink-2)">{{ r.k }}</span><span class="num" style="font-weight:500;text-align:end"><bdi>{{ r.v }}</bdi></span></div>
</sc-for>
</div>
<div class="note" style="background:var(--conditional-bg);border-color:var(--conditional-bd);color:var(--ink)"><span class="i" style="color:var(--conditional-ink)">!</span><div><div style="font-weight:600">{{ t.declareTitle }}</div><div style="color:var(--ink-2);margin-top:3px">{{ t.declareBody }}</div></div></div>
<div class="wz-foot"><button type="button" class="btn btn-lg">{{ t.saveDraft }}</button><div style="flex:1"></div><button type="button" onClick="{{ next }}" class="btn btn-primary btn-lg">{{ t.publish }}</button></div>
</div>
</sc-if>

<sc-if value="{{ is5 }}" hint-placeholder-val="{{ false }}">
<div style="text-align:center;padding:30px 0">
<span aria-hidden="true" style="display:inline-grid;place-items:center;width:72px;height:72px;border-radius:50%;background:var(--allowed-bg);color:var(--allowed-ink);font-size:32px;margin-bottom:16px">✓</span>
<h2>{{ t.s5Title }}</h2>
<p class="lede num"><bdi>{{ publishedLede }}</bdi></p>
<div style="display:flex;gap:12px;justify-content:center"><button type="button" class="btn btn-primary btn-lg">{{ t.openBoard }}</button><button type="button" class="btn btn-lg">{{ t.viewTrip }}</button></div>
</div>
</sc-if>

</div></section>

<aside class="stack sticky">
<section class="panel">
<div class="panel-h"><h2>{{ t.s4Title }}</h2></div>
<div class="rows">
<sc-for list="{{ review }}" as="r" hint-placeholder-count="6">
<div style="padding:12px 20px"><div style="font-size:var(--t-xs);color:var(--ink-3)">{{ r.k }}</div><div class="num" style="font-size:var(--t-sm);font-weight:500;margin-top:3px"><bdi>{{ r.v }}</bdi></div></div>
</sc-for>
</div>
</section>
<div class="note"><span class="i">!</span><span>{{ t.declareBody }}</span></div>
</aside>
</div>
` })
});

/* ───────────────────────── DEMAND BOARD ───────────────────────── */
W.convert({
  file: 'Demand Board.dc.html', surface: 'importer', active: 'demand', w: 1440, h: 1200,
  css: `
.dgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}
@media (min-width:1500px){.dgrid{grid-template-columns:repeat(3,minmax(0,1fr))}}
.meter{height:7px;border-radius:4px;background:var(--neutral-bg);overflow:hidden}
.meter>i{display:block;height:100%;border-radius:4px;transition:width .18s ease}
.step{width:38px;height:38px;border:1px solid var(--rule-strong);border-radius:var(--r-sm);background:var(--surface);font-size:18px;cursor:pointer;color:inherit;display:grid;place-items:center}
.track{position:relative;height:6px;border-radius:3px;background:var(--neutral-bg)}
.track>b{position:absolute;top:0;height:100%;border-radius:3px;background:var(--brand)}
`,
  markup: W.appShell({ inner: `
<div class="page-head">
<div class="grow"><h1>{{ t.title }}</h1><p class="sub num"><bdi>{{ basis }}</bdi></p></div>
<div class="fchips">
<sc-for list="{{ filters }}" as="f" hint-placeholder-count="5">
<button type="button" onClick="{{ f.pick }}" aria-pressed="{{ f.on }}" class="fchip" style="border-color:{{ f.bd }};background:{{ f.bg }};color:{{ f.fg }}">{{ f.label }}</button>
</sc-for>
</div>
</div>

<div class="split">
<main class="dgrid">
<sc-for list="{{ items }}" as="it" hint-placeholder-count="4">
<article class="panel" style="padding:18px;display:flex;flex-direction:column;gap:14px">
<div style="display:flex;gap:14px">
<span class="img ph {{ it.ph }}" style="flex:none;width:76px;height:94px;border-radius:var(--r-sm)"></span>
<div style="flex:1;min-width:0">
<div style="display:flex;align-items:flex-start;gap:8px">
<h2 style="margin:0;flex:1;min-width:0;font-size:var(--t-h3);font-weight:600;line-height:1.4">{{ it.name }}</h2>
<span class="chip {{ it.compChip }}" style="flex:none">{{ it.comp }}</span>
</div>
<div style="font-size:var(--t-sm);color:var(--ink-2);margin-top:6px">{{ it.wilayas }}</div>
<div style="display:flex;align-items:baseline;gap:8px;margin-top:10px;flex-wrap:wrap">
<span class="num" style="font-size:28px;font-weight:600;line-height:1;color:var(--allowed-ink)"><bdi>{{ it.confirmed }}</bdi></span>
<span style="font-size:var(--t-sm);color:var(--ink-2)">{{ confirmedWord }}</span>
<span class="num" style="font-size:var(--t-sm);color:var(--ink-3)"><bdi>{{ it.interestedLine }}</bdi></span>
</div>
</div>
</div>
<div style="padding:13px 0;border-block:1px solid var(--rule-faint)">
<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px">
<span style="font-size:var(--t-xs);color:var(--ink-3)">{{ refPrice }}</span>
<span class="num" style="font-size:var(--t-sm);font-weight:600"><bdi>{{ it.band }}</bdi></span>
</div>
<div class="track"><b style="inset-inline-start:{{ it.bandStart }}%;width:{{ it.bandWidth }}%"></b></div>
<div class="num" style="display:flex;justify-content:space-between;font-size:var(--t-micro);color:var(--ink-3);margin-top:6px"><bdi>{{ it.trackLo }}</bdi><bdi>{{ it.trackHi }}</bdi></div>
</div>
<sc-if value="{{ it.hasNote }}" hint-placeholder-val="{{ false }}">
<div style="display:flex;gap:9px;padding:11px 12px;background:{{ it.noteBg }};border:1px solid {{ it.noteBd }};border-radius:var(--r-sm)">
<span aria-hidden="true" style="flex:none;font-weight:600;color:{{ it.noteFg }}">!</span>
<p style="margin:0;font-size:var(--t-sm);line-height:1.6;color:var(--ink-2)">{{ it.note }}</p>
</div>
</sc-if>
<sc-if value="{{ it.inList }}" hint-placeholder-val="{{ false }}">
<div style="display:flex;align-items:center;gap:10px;margin-top:auto">
<div style="flex:1;min-width:0">
<div class="num" style="font-size:var(--t-body);font-weight:600"><bdi>{{ it.inListLine }}</bdi></div>
<div class="num" style="font-size:var(--t-xs);color:var(--ink-3);margin-top:3px"><bdi>{{ it.lineCost }}</bdi></div>
</div>
<button type="button" class="step" onClick="{{ it.dec }}" aria-label="{{ less }}">−</button>
<button type="button" class="step" onClick="{{ it.inc }}" aria-label="{{ more }}">+</button>
</div>
</sc-if>
<sc-if value="{{ it.notInList }}" hint-placeholder-val="{{ true }}">
<button type="button" onClick="{{ it.add }}" disabled="{{ it.blocked }}" class="btn btn-lg btn-block" style="margin-top:auto;border:0;background:{{ it.addBg }};color:{{ it.addFg }}">{{ it.addLabel }}</button>
</sc-if>
</article>
</sc-for>
</main>

<aside class="stack sticky">
<section class="panel">
<div class="panel-h" style="flex-direction:column;align-items:flex-start;gap:4px"><h2>{{ tripLabel }}</h2><span class="meta num"><bdi>{{ tripCounter }}</bdi></span></div>
<div class="panel-b" style="display:flex;flex-direction:column;gap:16px">
<sc-for list="{{ meters }}" as="m" hint-placeholder-count="3">
<div>
<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px">
<span style="font-size:var(--t-sm);color:var(--ink-2)">{{ m.label }}</span>
<span class="num" style="font-size:var(--t-body);font-weight:600;color:{{ m.fg }}"><bdi>{{ m.left }}</bdi></span>
</div>
<div class="meter"><i style="width:{{ m.pct }}%;background:{{ m.fg }}"></i></div>
</div>
</sc-for>
</div>
<sc-if value="{{ hasList }}" hint-placeholder-val="{{ true }}">
<div class="panel-f">
<div style="font-size:var(--t-xs);color:var(--ink-3);margin-bottom:5px">{{ t.buyingList }}</div>
<div class="num" style="font-size:var(--t-body);font-weight:600;margin-bottom:14px"><bdi>{{ listSummary }}</bdi></div>
<button type="button" class="btn btn-primary btn-lg btn-block">{{ t.openList }}</button>
</div>
</sc-if>
</section>
</aside>
</div>
` })
});

/* ───────────────────────── MESSAGES ───────────────────────── */
W.convert({
  file: 'Messages.dc.html', surface: 'importer', active: 'msg', w: 1440, h: 1000,
  extra: `inbox: ({ ar: [['ي ب', 'ياسين ب.', 'واخّا. إذا تغيّر السعر خارج النطاق نعلمك…', '09:36', true], ['ك ح', 'كريمة ح.', 'البضاعة وصلت، نحدّد موعد التسليم؟', 'أمس', false], ['د أ', 'دار الأناقة', 'شكراً، استلمنا الحقائب كاملة.', 'الإثنين', false]], fr: [['YB', 'Yacine B.', 'D’accord. Si le prix sort de la fourchette…', '09:36', true], ['KH', 'Karima H.', 'La marchandise est arrivée, on fixe la remise ?', 'hier', false], ['DA', 'Dar El Anaqa', 'Merci, les sacs sont bien arrivés.', 'lundi', false]], en: [['YB', 'Yacine B.', 'Fine. If the price moves outside the range…', '09:36', true], ['KH', 'Karima H.', 'The goods have arrived — shall we set the handover?', 'yesterday', false], ['DA', 'Dar El Anaqa', 'Thanks, all the bags arrived.', 'Monday', false]] })[this.state.lang].map(([initials, name, last, when, on], i) => ({ initials, name, last, when: this.ltr(when), on, bg: on ? 'var(--brand-bg)' : 'transparent', avBg: ['var(--role-trader-bg)', 'var(--role-importer-bg)', 'var(--role-consumer-bg)'][i], avFg: ['var(--role-trader-ink)', 'var(--role-importer-ink)', 'var(--role-consumer-ink)'][i] })),`,
  css: `
.inbox3{display:grid;grid-template-columns:320px minmax(0,1fr) 320px;height:760px;background:var(--surface);border:1px solid var(--rule);border-radius:var(--r-lg);overflow:hidden}
.inbox3>*{min-width:0;min-height:0}
.col-list{border-inline-end:1px solid var(--rule);display:flex;flex-direction:column}
.col-thread{display:flex;flex-direction:column;background:var(--paper)}
.col-deal{border-inline-start:1px solid var(--rule);overflow:auto}
.conv{display:flex;gap:12px;align-items:flex-start;width:100%;padding:14px 16px;border:0;border-bottom:1px solid var(--rule-faint);text-align:start;cursor:pointer;color:inherit}
.bub{max-width:62%;padding:11px 15px;border-radius:var(--r-lg);font-size:var(--t-body);line-height:1.65}
.mine{background:var(--ink);color:var(--ink-on);border-end-end-radius:var(--r-xs)}
.theirs{background:var(--surface);border:1px solid var(--rule);border-end-start-radius:var(--r-xs)}
@media (max-width:1240px){.inbox3{grid-template-columns:280px minmax(0,1fr)}.col-deal{display:none}}
`,
  markup: W.appShell({ inner: `
<div class="page-head" style="margin-bottom:18px"><div class="grow"><h1>{{ sh.current }}</h1></div></div>

<div class="inbox3">

<div class="col-list">
<div style="padding:12px 14px;border-bottom:1px solid var(--rule)"><div class="gsearch" style="max-width:none;height:38px">{{ sh.icSearch }}<span>{{ sh.search }}</span></div></div>
<div style="overflow:auto">
<sc-for list="{{ inbox }}" as="c" hint-placeholder-count="3">
<button type="button" class="conv" style="background:{{ c.bg }}">
<span class="av" style="width:40px;height:40px;font-size:12px;background:{{ c.avBg }};color:{{ c.avFg }}">{{ c.initials }}</span>
<span style="flex:1;min-width:0">
<span style="display:flex;align-items:baseline;gap:8px"><span style="flex:1;font-size:var(--t-body);font-weight:600">{{ c.name }}</span><span class="num" style="font-size:var(--t-xs);color:var(--ink-3)"><bdi>{{ c.when }}</bdi></span></span>
<span style="display:block;font-size:var(--t-sm);color:var(--ink-2);margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ c.last }}</span>
</span>
</button>
</sc-for>
</div>
</div>

<div class="col-thread">
<div style="display:flex;align-items:center;gap:12px;padding:12px 20px;background:var(--surface);border-bottom:1px solid var(--rule)">
<span class="av" style="width:40px;height:40px;font-size:12px;background:var(--role-trader-bg);color:var(--role-trader-ink)">{{ t.initials }}</span>
<div style="flex:1;min-width:0">
<div style="display:flex;align-items:center;gap:6px"><span style="font-size:var(--t-h3);font-weight:600">{{ t.who }}</span>
<svg width="14" height="14" viewBox="0 0 24 24" role="img" aria-label="{{ t.verified }}"><circle cx="12" cy="12" r="10" fill="var(--allowed)"/><path d="M7.4 12.4l3 3 6.2-6.6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
<div class="num" style="font-size:var(--t-xs);color:var(--ink-2);margin-top:2px"><bdi>{{ whoMeta }}</bdi></div>
</div>
</div>

<div style="flex:1;overflow:auto;padding:22px 26px;display:flex;flex-direction:column;gap:12px">
<div style="text-align:center;font-size:var(--t-xs);color:var(--ink-3)">{{ t.day }}</div>
<sc-for list="{{ messages }}" as="m" hint-placeholder-count="6">
<div style="display:flex;flex-direction:column;gap:4px;align-items:{{ m.align }}">
<sc-if value="{{ m.isCard }}" hint-placeholder-val="{{ false }}">
<div class="panel" style="width:min(520px,100%);align-self:center;padding:16px">
<div style="display:flex;align-items:center;gap:9px;margin-bottom:10px">
<span aria-hidden="true" style="flex:none;width:24px;height:24px;border-radius:50%;background:{{ m.cardBg }};display:grid;place-items:center;font-size:12px;color:{{ m.cardFg }}">{{ m.glyph }}</span>
<span style="font-size:var(--t-body);font-weight:600">{{ m.cardTitle }}</span>
</div>
<sc-for list="{{ m.rows }}" as="r" hint-placeholder-count="3">
<div style="display:flex;justify-content:space-between;gap:14px;padding:8px 0;border-bottom:1px solid var(--rule-faint)"><span style="font-size:var(--t-sm);color:var(--ink-2)">{{ r.k }}</span><span class="num" style="font-size:var(--t-sm);font-weight:500"><bdi>{{ r.v }}</bdi></span></div>
</sc-for>
<sc-if value="{{ m.hasCta }}" hint-placeholder-val="{{ false }}">
<div style="display:flex;gap:9px;margin-top:14px"><button type="button" class="btn btn-primary" style="flex:1">{{ m.cta1 }}</button><button type="button" class="btn">{{ m.cta2 }}</button></div>
</sc-if>
</div>
</sc-if>
<sc-if value="{{ m.isText }}" hint-placeholder-val="{{ true }}"><div class="bub {{ m.cls }}">{{ m.text }}</div></sc-if>
<span class="num" style="font-size:var(--t-micro);color:var(--ink-3);padding-inline:4px"><bdi>{{ m.time }}</bdi></span>
</div>
</sc-for>
</div>

<div style="padding:12px 20px;background:var(--surface);border-top:1px solid var(--rule)">
<div class="fchips" style="margin-bottom:10px">
<sc-for list="{{ templates }}" as="x" hint-placeholder-count="4"><button type="button" class="sw">{{ x }}</button></sc-for>
</div>
<div style="display:flex;align-items:center;gap:10px">
<button type="button" aria-label="{{ t.attach }}" class="iconbtn"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="5" width="17" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="M4 17l5-4 4 3 3-2 4 3"/></svg></button>
<input placeholder="{{ t.compose }}" aria-label="{{ t.message }}" class="input" style="flex:1;border-radius:999px;height:44px">
<button type="button" class="btn btn-primary" style="height:44px">{{ t.send }}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" style="transform:scaleX({{ backFlip }})"><path d="M21 3L3 10.5l7 3 3 7z"/></svg></button>
</div>
</div>
</div>

<div class="col-deal">
<div style="padding:18px 20px;border-bottom:1px solid var(--rule-faint)">
<span class="img ph ph-coat" style="width:100%;height:150px;border-radius:var(--r);margin-bottom:14px"></span>
<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="flex:1;font-size:var(--t-h3);font-weight:600">{{ t.deal }}</span><span class="chip chip-verified">{{ t.agreed }}</span></div>
<div class="num" style="font-size:var(--t-sm);color:var(--ink-2);line-height:1.6"><bdi>{{ dealMeta }}</bdi></div>
</div>
<div style="padding:18px 20px">
<div style="display:flex;align-items:center;gap:12px">
<span class="av" style="width:44px;height:44px;font-size:13px;background:var(--role-trader-bg);color:var(--role-trader-ink)">{{ t.initials }}</span>
<div><div style="font-weight:600">{{ t.who }}</div><div class="num" style="font-size:var(--t-xs);color:var(--ink-2);margin-top:3px"><bdi>{{ whoMeta }}</bdi></div></div>
</div>
</div>
</div>

</div>
` })
});
