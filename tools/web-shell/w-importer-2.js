const W = require('./weblib.js');
const STATE_LABEL = `stateLabel: ({ ar: 'الحالة', fr: 'État de l’écran', en: 'Screen state' })[this.state.lang],`;

/* ───────────────────────── RECORDS ───────────────────────── */
W.convert({
  file: 'Records.dc.html', surface: 'importer', active: 'rec', w: 1440, h: 1000,
  css: `
.stats3{grid-template-columns:repeat(3,minmax(0,1fr))}
.labelbox{border:1.5px dashed var(--rule-strong);border-radius:var(--r);padding:20px;background:var(--surface-2)}
`,
  markup: W.appShell({ inner: `
<div class="page-head"><div class="grow"><h1>{{ t.title }}</h1></div></div>

<nav class="tabs-h" aria-label="{{ t.sections }}">
<sc-for list="{{ tabs }}" as="tb" hint-placeholder-count="3">
<button type="button" onClick="{{ tb.pick }}" aria-current="{{ tb.on }}" class="tab-h">{{ tb.label }}</button>
</sc-for>
</nav>

<sc-if value="{{ isLedger }}" hint-placeholder-val="{{ true }}">
<div class="stack">
<div>
<div style="font-size:var(--t-sm);color:var(--ink-3);margin-bottom:10px">{{ t.thisMonth }}</div>
<div class="stats stats3">
<sc-for list="{{ summary }}" as="s" hint-placeholder-count="3">
<div class="stat"><div class="v num"><bdi>{{ s.v }}</bdi></div><div class="k">{{ s.k }}</div></div>
</sc-for>
</div>
</div>
<div class="split">
<section class="panel">
<div class="panel-h"><h2>{{ t.ops }}</h2><button type="button" class="btn">{{ t.export }}</button></div>
<div class="rows">
<sc-for list="{{ entries }}" as="e" hint-placeholder-count="5">
<div style="display:flex;gap:14px;align-items:center;padding:15px 20px">
<span aria-hidden="true" style="flex:none;width:4px;align-self:stretch;border-radius:2px;background:{{ e.bar }}"></span>
<div style="flex:1;min-width:0">
<div style="font-size:var(--t-body);font-weight:600">{{ e.what }}</div>
<div class="num" style="font-size:var(--t-sm);color:var(--ink-2);margin-top:3px"><bdi>{{ e.meta }}</bdi></div>
</div>
<span class="num" style="flex:none;font-size:var(--t-h3);font-weight:600"><bdi>{{ e.amount }}</bdi></span>
</div>
</sc-for>
</div>
</section>
<aside class="stack sticky">
<div class="note"><span class="i">i</span><span>{{ t.ledgerNote }}</span></div>
</aside>
</div>
</div>
</sc-if>

<sc-if value="{{ isLabels }}" hint-placeholder-val="{{ false }}">
<div class="cols cols-3">
<section class="panel">
<div class="panel-h"><h2>{{ t.pickItem }}</h2></div>
<div class="rows">
<sc-for list="{{ items }}" as="it" hint-placeholder-count="3">
<button type="button" onClick="{{ it.pick }}" aria-pressed="{{ it.on }}" style="width:100%;display:flex;align-items:center;gap:12px;padding:14px 18px;border:0;background:{{ it.bg }};text-align:start;cursor:pointer;color:inherit">
<span aria-hidden="true" style="flex:none;width:4px;align-self:stretch;border-radius:2px;background:{{ it.bar }}"></span>
<span class="img ph {{ it.ph }}" style="flex:none;width:44px;height:54px;border-radius:var(--r-sm)"></span>
<span style="flex:1;min-width:0"><span style="display:block;font-size:var(--t-body);font-weight:{{ it.fw }}">{{ it.name }}</span><span class="num" style="display:block;font-size:var(--t-xs);color:var(--ink-2);margin-top:3px"><bdi>{{ it.meta }}</bdi></span></span>
</button>
</sc-for>
</div>
</section>

<section class="panel">
<div class="panel-h"><h2>{{ t.label }}</h2></div>
<div class="panel-b">
<div dir="rtl" lang="ar" class="labelbox">
<sc-for list="{{ labelRows }}" as="r" hint-placeholder-count="4">
<div style="display:grid;grid-template-columns:90px 1fr;gap:10px;padding:8px 0;border-top:1px solid var(--rule-faint)">
<span style="font-size:var(--t-xs);color:var(--ink-3);padding-top:2px">{{ r.k }}</span>
<span style="font-size:var(--t-body);font-weight:{{ r.fw }};line-height:1.5"><bdi>{{ r.v }}</bdi></span>
</div>
</sc-for>
</div>
<p style="margin:14px 0 0;font-size:var(--t-sm);color:var(--ink-2);line-height:1.6">{{ t.labelNote }}</p>
<sc-if value="{{ missingAddr }}" hint-placeholder-val="{{ false }}">
<div role="alert" class="note" style="margin-top:12px;background:var(--conditional-bg);border-color:var(--conditional-bd)"><span class="i" style="color:var(--conditional-ink)">!</span><span>{{ t.missingAddr }}</span></div>
</sc-if>
</div>
<div class="panel-f" style="display:flex;gap:10px"><button type="button" class="btn btn-primary btn-lg" style="flex:1">{{ printLabel }}</button><button type="button" class="btn btn-lg">PDF</button></div>
</section>

<section class="panel">
<div class="panel-h"><h2>{{ t.deliveryNote }}</h2></div>
<div class="rows">
<sc-for list="{{ noteRows }}" as="r" hint-placeholder-count="5">
<div style="display:flex;justify-content:space-between;gap:14px;padding:13px 20px"><span style="font-size:var(--t-sm);color:var(--ink-2)">{{ r.k }}</span><span class="num" style="font-size:var(--t-body);font-weight:{{ r.fw }}"><bdi>{{ r.v }}</bdi></span></div>
</sc-for>
</div>
</section>
</div>
</sc-if>

<sc-if value="{{ isCredits }}" hint-placeholder-val="{{ false }}">
<div class="split">
<div class="stack">
<section class="panel">
<div class="panel-h"><h2>{{ t.renew }}</h2></div>
<div class="cols cols-3 panel-b">
<sc-for list="{{ plans }}" as="p" hint-placeholder-count="3">
<label class="panel" style="padding:18px;cursor:pointer;display:flex;flex-direction:column;gap:8px">
<span style="display:flex;align-items:center;gap:8px"><input type="radio" name="plan" checked="{{ p.on }}" style="accent-color:var(--brand);width:18px;height:18px"><span class="num" style="font-size:var(--t-h3);font-weight:600"><bdi>{{ p.label }}</bdi></span></span>
<span class="num" style="font-size:24px;font-weight:600"><bdi>{{ p.price }}</bdi></span>
<span class="num" style="font-size:var(--t-sm);color:var(--ink-2)"><bdi>{{ p.note }}</bdi></span>
</label>
</sc-for>
</div>
</section>
<section class="panel">
<div class="panel-h"><h2>{{ t.payMethod }}</h2></div>
<div class="cols cols-2 panel-b">
<sc-for list="{{ methods }}" as="m" hint-placeholder-count="2">
<button type="button" onClick="{{ m.pick }}" aria-pressed="{{ m.on }}" class="panel" style="display:flex;align-items:center;gap:13px;padding:16px;background:{{ m.bg }};text-align:start;cursor:pointer;color:inherit">
<span aria-hidden="true" style="flex:none;width:44px;height:44px;border-radius:var(--r-sm);background:{{ m.iconBg }};display:grid;place-items:center;font-size:var(--t-xs);font-weight:600;color:{{ m.iconFg }}">{{ m.tag }}</span>
<span style="flex:1;min-width:0"><span style="display:block;font-size:var(--t-body);font-weight:{{ m.fw }}">{{ m.label }}</span><span style="display:block;font-size:var(--t-xs);color:var(--ink-2);margin-top:3px">{{ m.note }}</span></span>
</button>
</sc-for>
</div>
<sc-if value="{{ isCcp }}" hint-placeholder-val="{{ true }}">
<div class="panel-f">
<div style="font-size:var(--t-sm);font-weight:600;margin-bottom:10px">{{ t.uploadReceipt }}</div>
<button type="button" style="width:100%;height:110px;border:1.5px dashed var(--rule-strong);border-radius:var(--r);background:var(--surface-2);cursor:pointer;color:var(--ink-2);font-size:var(--t-sm);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 16V6M8 10l4-4 4 4"/><path d="M4 18h16"/></svg>{{ t.snapReceipt }}</button>
<p style="margin:10px 0 0;font-size:var(--t-xs);color:var(--ink-2)">{{ t.activation }}</p>
</div>
</sc-if>
</section>
</div>
<aside class="stack sticky">
<section class="panel"><div class="panel-b">
<div style="display:flex;align-items:baseline;gap:9px"><span class="num" style="font-size:40px;font-weight:600;line-height:1"><bdi>{{ daysLeft }}</bdi></span><span style="color:var(--ink-2)">{{ t.daysLeft }}</span></div>
<div style="font-size:var(--t-body);margin-top:8px">{{ planName }}</div>
<div style="height:7px;border-radius:4px;background:var(--neutral-bg);overflow:hidden;margin-top:14px"><i style="display:block;height:100%;width:{{ planPct }}%;background:var(--brand)"></i></div>
<div class="num" style="font-size:var(--t-xs);color:var(--ink-3);margin-top:8px"><bdi>{{ planUntil }}</bdi></div>
</div>
<div class="panel-f"><button type="button" class="btn btn-dark btn-lg btn-block">{{ payCta }}</button></div>
</section>
<p style="margin:0;font-size:var(--t-xs);color:var(--ink-3);line-height:1.65">{{ t.subNote }}</p>
</aside>
</div>
</sc-if>
` })
});

/* ───────────────────────── VERIFICATION ───────────────────────── */
W.convert({
  file: 'Verification.dc.html', surface: 'importer', active: 'ver', w: 1440, h: 1100, extra: STATE_LABEL,
  css: `
.center{max-width:720px;margin:0 auto;text-align:center;padding:30px 0}
.docimg{aspect-ratio:1.45;border-radius:var(--r);background:linear-gradient(135deg, var(--rule-strong), var(--neutral-bd));border:1px solid var(--rule);display:grid;place-items:center}
`,
  markup: W.appShell({ statebar: W.STATEBAR('views', 'stateLabel'), inner: `
<div class="page-head"><div class="grow"><h1>{{ t.title }}</h1></div></div>

<nav class="tabs-h" aria-label="{{ t.role }}">
<sc-for list="{{ roles }}" as="r" hint-placeholder-count="2">
<button type="button" onClick="{{ r.pick }}" aria-current="{{ r.on }}" class="tab-h">{{ r.label }}</button>
</sc-for>
</nav>

<sc-if value="{{ isLadder }}" hint-placeholder-val="{{ true }}">
<div class="split">
<section class="panel">
<div class="panel-h"><h2>{{ t.levelsTitle }}</h2></div>
<div class="panel-b" style="display:flex;flex-direction:column;gap:12px">
<sc-for list="{{ levels }}" as="l" hint-placeholder-count="4">
<div class="panel" style="padding:18px;border-color:{{ l.bd }};border-width:{{ l.bw }}px">
<div style="display:flex;align-items:center;gap:12px;margin-bottom:{{ l.gap }}px">
<span aria-hidden="true" style="flex:none;width:30px;height:30px;border-radius:50%;background:{{ l.dotBg }};border:2px solid {{ l.dotBd }};display:grid;place-items:center;font-size:12px;font-weight:600;color:{{ l.dotFg }}">{{ l.glyph }}</span>
<span style="flex:1;min-width:0;font-size:var(--t-h3);font-weight:{{ l.fw }}">{{ l.title }}</span>
<span class="chip {{ l.chip }}">{{ l.state }}</span>
</div>
<sc-if value="{{ l.expanded }}" hint-placeholder-val="{{ true }}">
<div class="cols cols-2" style="padding-inline-start:42px">
<div>
<div style="font-size:var(--t-xs);color:var(--ink-3);margin-bottom:8px">{{ requiredLabel }}</div>
<sc-for list="{{ l.needs }}" as="n" hint-placeholder-count="3">
<div style="display:flex;align-items:center;gap:9px;padding:5px 0"><span aria-hidden="true" style="flex:none;width:18px;height:18px;border-radius:50%;background:{{ n.bg }};display:grid;place-items:center;font-size:10px;color:{{ n.fg }}">{{ n.glyph }}</span><span style="font-size:var(--t-sm);color:{{ n.tone }}">{{ n.label }}</span></div>
</sc-for>
</div>
<div>
<div style="font-size:var(--t-xs);color:var(--ink-3);margin-bottom:8px">{{ unlocksLabel }}</div>
<sc-for list="{{ l.unlocks }}" as="u" hint-placeholder-count="2"><div style="font-size:var(--t-sm);color:var(--ink-2);padding:4px 0">• {{ u }}</div></sc-for>
</div>
</div>
<sc-if value="{{ l.hasCta }}" hint-placeholder-val="{{ false }}">
<div style="padding-inline-start:42px;margin-top:14px"><button type="button" onClick="{{ goDoc }}" class="btn btn-primary">{{ l.cta }}</button></div>
</sc-if>
</sc-if>
</div>
</sc-for>
</div>
</section>
<aside class="stack sticky">
<section class="panel"><div class="panel-b">
<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
<span aria-hidden="true" style="flex:none;width:48px;height:48px;border-radius:50%;background:var(--allowed-bg);display:grid;place-items:center;color:var(--allowed-ink);font-size:20px;font-weight:600">2</span>
<div><div style="font-size:var(--t-h3);font-weight:600">{{ t.currentLevelName }}</div><div style="font-size:var(--t-sm);color:var(--ink-2)">{{ t.currentLevel }}</div></div>
</div>
<div style="height:7px;border-radius:4px;background:var(--neutral-bg);overflow:hidden"><i style="display:block;height:100%;width:50%;background:var(--brand)"></i></div>
<div style="font-size:var(--t-sm);color:var(--ink-2);margin-top:10px">{{ oneStep }}</div>
</div></section>
<div class="note"><span class="i">i</span><span>{{ t.noteA }} <strong style="font-weight:600;color:var(--ink)">{{ t.noteB }}</strong> {{ t.noteC }}</span></div>
</aside>
</div>
</sc-if>

<sc-if value="{{ isNeed }}" hint-placeholder-val="{{ false }}">
<div class="split">
<section class="panel"><div class="panel-b" style="padding:30px">
<h2 style="margin:0 0 10px;font-size:26px;font-weight:600">{{ docTitle }}</h2>
<p style="margin:0 0 22px;font-size:var(--t-body);line-height:1.7;color:var(--ink-2)">{{ docLede }}</p>
<div style="font-size:var(--t-body);font-weight:600;margin-bottom:8px">{{ t.why }}</div>
<p style="margin:0 0 26px;font-size:var(--t-body);line-height:1.7;color:var(--ink-2)">{{ docWhy }}</p>
<div style="display:flex;gap:12px;flex-wrap:wrap">
<button type="button" onClick="{{ goCapture }}" class="btn btn-primary btn-lg">{{ t.shoot }}</button>
<button type="button" class="btn btn-lg">{{ t.pickPhoto }}</button>
</div>
<p style="margin:20px 0 0;font-size:var(--t-sm);color:var(--ink-3)">{{ t.storage }}</p>
</div></section>
<aside class="panel sticky">
<div class="panel-h"><h2>{{ t.photoRules }}</h2></div>
<div class="panel-b">
<sc-for list="{{ tips }}" as="tip" hint-placeholder-count="4">
<div style="display:flex;align-items:center;gap:10px;padding:6px 0"><span aria-hidden="true" style="flex:none;width:18px;height:18px;border-radius:50%;background:var(--allowed-bg);display:grid;place-items:center;font-size:10px;color:var(--allowed-ink)">✓</span><span style="font-size:var(--t-sm);color:var(--ink-2)">{{ tip }}</span></div>
</sc-for>
</div>
</aside>
</div>
</sc-if>

<sc-if value="{{ isPreview }}" hint-placeholder-val="{{ false }}">
<div class="split">
<section class="panel"><div class="panel-b">
<h2 style="margin:0 0 16px;font-size:24px;font-weight:600">{{ t.checkPhoto }}</h2>
<div class="docimg"><span style="color:var(--ink-2)">{{ t.docImage }}</span></div>
</div></section>
<aside class="panel sticky">
<div class="rows">
<sc-for list="{{ checks }}" as="c" hint-placeholder-count="3">
<div style="display:flex;align-items:center;gap:10px;padding:14px 20px"><span aria-hidden="true" style="flex:none;width:20px;height:20px;border-radius:50%;background:{{ c.bg }};display:grid;place-items:center;font-size:11px;color:{{ c.fg }}">{{ c.glyph }}</span><span style="font-size:var(--t-body)">{{ c.label }}</span></div>
</sc-for>
</div>
<div class="panel-f" style="display:flex;flex-direction:column;gap:10px">
<button type="button" onClick="{{ goUploading }}" class="btn btn-primary btn-lg btn-block">{{ t.sendReview }}</button>
<button type="button" onClick="{{ goCapture }}" class="btn btn-lg btn-block">{{ t.retake }}</button>
</div>
</aside>
</div>
</sc-if>

<sc-if value="{{ isUploading }}" hint-placeholder-val="{{ false }}">
<section class="panel center" style="padding:40px">
<div style="font-size:24px;font-weight:600;margin-bottom:8px">{{ t.sending }}</div>
<p class="num" style="margin:0 0 18px;color:var(--ink-2)"><bdi>{{ progressText }}</bdi></p>
<div style="height:8px;border-radius:4px;background:var(--neutral-bg);overflow:hidden;margin-bottom:18px"><i style="display:block;height:100%;width:52%;background:var(--brand)"></i></div>
<p style="margin:0 0 20px;font-size:var(--t-sm);color:var(--ink-3)">{{ t.resume }}</p>
<button type="button" class="btn btn-lg">{{ t.cancel }}</button>
</section>
</sc-if>

<sc-if value="{{ isReview }}" hint-placeholder-val="{{ false }}">
<div class="split">
<section class="panel">
<div class="panel-b" style="display:flex;gap:16px;align-items:center;border-bottom:1px solid var(--rule-faint)">
<span aria-hidden="true" style="flex:none;width:56px;height:56px;border-radius:50%;background:var(--conditional-bg);color:var(--conditional-ink);font-size:24px;display:grid;place-items:center">⏱</span>
<div><h2 style="margin:0 0 5px;font-size:24px;font-weight:600">{{ t.reviewTitle }}</h2><p style="margin:0;color:var(--ink-2)">{{ t.reviewLede }}</p></div>
</div>
<div class="rows">
<sc-for list="{{ submitted }}" as="d" hint-placeholder-count="4">
<div style="display:flex;align-items:center;gap:12px;padding:14px 20px"><span aria-hidden="true" style="flex:none;width:20px;height:20px;border-radius:50%;background:{{ d.bg }};display:grid;place-items:center;font-size:11px;color:{{ d.fg }}">{{ d.glyph }}</span><span style="flex:1;font-size:var(--t-body)">{{ d.label }}</span><span style="font-size:var(--t-sm);color:var(--ink-3)">{{ d.state }}</span></div>
</sc-for>
</div>
</section>
<aside class="stack sticky"><button type="button" class="btn btn-lg btn-block">{{ t.whatNow }}</button></aside>
</div>
</sc-if>

<sc-if value="{{ isFix }}" hint-placeholder-val="{{ false }}">
<div class="split">
<div class="stack">
<div style="display:flex;gap:14px;padding:20px;border:1px solid var(--conditional-bd);border-radius:var(--r-lg);background:var(--conditional-bg)">
<span aria-hidden="true" style="flex:none;width:34px;height:34px;border-radius:50%;background:var(--conditional);color:#fff;display:grid;place-items:center;font-weight:600">!</span>
<div><div style="font-size:var(--t-h2);font-weight:600;margin-bottom:5px">{{ t.fixTitle }}</div><p style="margin:0;color:var(--ink-2);line-height:1.7">{{ t.fixLede }}</p></div>
</div>
<div class="cols cols-2">
<section class="panel"><div class="panel-h"><h2>{{ t.problem }}</h2></div><div class="panel-b">
<sc-for list="{{ problems }}" as="p" hint-placeholder-count="2"><div style="display:flex;gap:10px;padding:7px 0"><span aria-hidden="true" style="flex:none;width:7px;height:7px;border-radius:50%;background:var(--conditional);margin-top:8px"></span><span style="font-size:var(--t-sm);line-height:1.65;color:var(--ink-2)">{{ p }}</span></div></sc-for>
</div></section>
<section class="panel"><div class="panel-h"><h2>{{ t.todo }}</h2></div><div class="panel-b">
<sc-for list="{{ fixes }}" as="f" hint-placeholder-count="2"><div style="display:flex;gap:10px;padding:7px 0"><span aria-hidden="true" style="flex:none;width:18px;height:18px;border-radius:50%;background:var(--allowed-bg);display:grid;place-items:center;font-size:10px;color:var(--allowed-ink)">✓</span><span style="font-size:var(--t-sm);line-height:1.65">{{ f }}</span></div></sc-for>
</div></section>
</div>
</div>
<aside class="stack sticky">
<button type="button" onClick="{{ goCapture }}" class="btn btn-primary btn-lg btn-block">{{ t.reshoot }}</button>
<button type="button" class="btn btn-lg btn-block">{{ t.support }}</button>
</aside>
</div>
</sc-if>

<sc-if value="{{ isDone }}" hint-placeholder-val="{{ false }}">
<section class="panel center" style="padding:40px">
<span aria-hidden="true" style="display:inline-grid;place-items:center;width:72px;height:72px;border-radius:50%;background:var(--allowed-bg);color:var(--allowed-ink);font-size:32px;margin-bottom:16px">✓</span>
<h2 style="margin:0 0 8px;font-size:28px;font-weight:600">{{ doneTitle }}</h2>
<p style="margin:0 0 24px;font-size:var(--t-body);color:var(--ink-2)">{{ doneLede }}</p>
<div class="cols cols-2" style="text-align:start;margin-bottom:24px">
<sc-for list="{{ newUnlocks }}" as="u" hint-placeholder-count="4"><div style="display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid var(--rule);border-radius:var(--r)"><span aria-hidden="true" style="flex:none;width:20px;height:20px;border-radius:50%;background:var(--allowed-bg);display:grid;place-items:center;font-size:10px;color:var(--allowed-ink)">✓</span><span style="font-size:var(--t-sm)">{{ u }}</span></div></sc-for>
</div>
<div style="display:flex;gap:12px;justify-content:center"><button type="button" class="btn btn-primary btn-lg">{{ doneCta }}</button><button type="button" class="btn btn-lg">{{ t.later }}</button></div>
<p style="margin:18px 0 0;font-size:var(--t-sm);color:var(--ink-3)">{{ validity }}</p>
</section>
</sc-if>

<sc-if value="{{ isExpired }}" hint-placeholder-val="{{ false }}">
<div class="split">
<div class="stack">
<div style="display:flex;gap:14px;padding:20px;border:1px solid var(--prohibited-bd);border-radius:var(--r-lg);background:var(--prohibited-bg)">
<span aria-hidden="true" style="flex:none;width:34px;height:34px;border-radius:50%;background:var(--prohibited);color:#fff;display:grid;place-items:center;font-weight:600">!</span>
<div><div style="font-size:var(--t-h2);font-weight:600;margin-bottom:5px">{{ t.expiredTitle }}</div><p class="num" style="margin:0;color:var(--ink-2)"><bdi>{{ expiredLede }}</bdi></p></div>
</div>
<section class="panel"><div class="rows">
<sc-for list="{{ frozen }}" as="f" hint-placeholder-count="3"><div style="display:flex;align-items:center;gap:12px;padding:14px 20px"><span aria-hidden="true" style="flex:none;width:20px;height:20px;border-radius:50%;background:{{ f.bg }};display:grid;place-items:center;font-size:11px;color:{{ f.fg }}">{{ f.glyph }}</span><span style="font-size:var(--t-body);color:{{ f.tone }}">{{ f.label }}</span></div></sc-for>
</div></section>
</div>
<aside class="sticky"><button type="button" onClick="{{ goNeed }}" class="btn btn-dark btn-lg btn-block">{{ t.uploadNew }}</button></aside>
</div>
</sc-if>
` })
});
