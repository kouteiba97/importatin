const W = require('./weblib.js');
const STATE_LABEL = `stateLabel: ({ ar: 'الحالة', fr: 'État de l’écran', en: 'Screen state' })[this.state.lang],`;
const BACK = (label) => `<div class="crumb"><button type="button" aria-label="{{ t.back }}" style="display:inline-flex;align-items:center;gap:6px"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transform:scaleX({{ backFlip }})"><path d="M15 5l-7 7 7 7"/></svg>${label}</button></div>`;
const CHECK = (bg, fg, glyph, size = 20) => `<span aria-hidden="true" style="flex:none;width:${size}px;height:${size}px;border-radius:50%;background:${bg};display:grid;place-items:center;font-size:11px;color:${fg}">${glyph}</span>`;

/* ───────────────────────── COMMITMENT ───────────────────────── */
W.convert({
  file: 'Commitment.dc.html', surface: 'trader', active: 'cmt', w: 1440, h: 1150, extra: STATE_LABEL,
  css: ``,
  markup: W.appShell({ statebar: W.STATEBAR('switcher', 'stateLabel'), inner: `
<div class="page-head">
<div class="grow">${BACK('{{ sh.current }}')}<div style="display:flex;align-items:center;gap:12px"><h1>{{ t.title }}</h1><span class="ref">CMT-26-0331</span></div></div>
</div>

<section style="display:flex;align-items:center;gap:18px;padding:22px 24px;border:1px solid {{ st.bd }};border-radius:var(--r-lg);background:{{ st.bg }};margin-bottom:24px;flex-wrap:wrap">
<span aria-hidden="true" style="flex:none;width:46px;height:46px;border-radius:50%;background:{{ st.dot }};color:#fff;display:grid;place-items:center;font-size:20px;font-weight:600">{{ st.glyph }}</span>
<div style="flex:1;min-width:260px"><div style="font-size:var(--t-h2);font-weight:600;margin-bottom:5px">{{ st.title }}</div><p style="margin:0;font-size:var(--t-body);line-height:1.65;color:var(--ink-2)">{{ st.body }}</p></div>
<sc-if value="{{ st.hasAlt }}" hint-placeholder-val="{{ true }}"><button type="button" class="btn btn-lg">{{ st.alt }}</button></sc-if>
<button type="button" class="btn btn-lg" style="border:0;background:{{ st.ctaBg }};color:{{ st.ctaFg }}">{{ st.cta }}</button>
</section>

<div class="split">
<div class="cols cols-2">
<section class="panel">
<div class="panel-h"><h2>{{ t.lifecycle }}</h2></div>
<div class="panel-b">
<sc-for list="{{ stages }}" as="g" hint-placeholder-count="7">
<div style="display:flex;gap:14px">
<div style="flex:none;display:flex;flex-direction:column;align-items:center;width:22px">
<span aria-hidden="true" style="width:18px;height:18px;border-radius:50%;background:{{ g.dotBg }};border:2px solid {{ g.dotBd }};display:grid;place-items:center;font-size:9px;color:#fff">{{ g.glyph }}</span>
<sc-if value="{{ g.line }}" hint-placeholder-val="{{ true }}"><span aria-hidden="true" style="flex:1;width:2px;background:{{ g.lineFg }};min-height:26px"></span></sc-if>
</div>
<div style="flex:1;min-width:0;padding-block-end:16px">
<div style="display:flex;align-items:baseline;gap:10px"><span style="flex:1;font-size:var(--t-body);font-weight:{{ g.fw }};color:{{ g.fg }}">{{ g.label }}</span><span class="num" style="flex:none;font-size:var(--t-xs);color:var(--ink-3)"><bdi>{{ g.when }}</bdi></span></div>
<sc-if value="{{ g.hasNote }}" hint-placeholder-val="{{ false }}"><div style="font-size:var(--t-xs);color:var(--ink-2);margin-top:4px">{{ g.note }}</div></sc-if>
</div>
</div>
</sc-for>
</div>
</section>

<section class="panel">
<div class="rows">
<sc-for list="{{ terms }}" as="tm" hint-placeholder-count="6">
<div style="padding:15px 20px"><div style="font-size:var(--t-xs);color:var(--ink-3)">{{ tm.k }}</div><div class="num" style="font-size:var(--t-body);font-weight:{{ tm.fw }};margin-top:4px"><bdi>{{ tm.v }}</bdi></div></div>
</sc-for>
</div>
</section>
</div>

<aside class="stack sticky">
<section class="panel"><div class="panel-b" style="display:flex;align-items:center;gap:12px">
<span class="av" style="width:46px;height:46px;font-size:13px;background:var(--role-importer-bg);color:var(--role-importer-ink)">{{ t.cpInitials }}</span>
<div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:6px"><span style="font-weight:600">{{ t.cpName }}</span><svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="var(--allowed)"/><path d="M7.4 12.4l3 3 6.2-6.6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="num" style="font-size:var(--t-xs);color:var(--ink-2);margin-top:3px"><bdi>{{ cpMeta }}</bdi></div></div>
<button type="button" class="btn">{{ t.message }}</button>
</div></section>
<sc-if value="{{ hasDeposit }}" hint-placeholder-val="{{ true }}">
<section class="panel"><div class="panel-b">
<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px"><span style="font-weight:600">{{ t.deposit }}</span><span class="num" style="font-size:var(--t-h2);font-weight:600"><bdi>{{ depositAmount }}</bdi></span></div>
<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px"><span class="chip chip-verified">{{ t.depositDeclared }}</span><span class="num" style="font-size:var(--t-xs);color:var(--ink-3)"><bdi>{{ depositDate }}</bdi></span></div>
<p style="margin:0;font-size:var(--t-sm);line-height:1.7;color:var(--ink-2)">{{ t.depositNote }}</p>
</div></section>
</sc-if>
</aside>
</div>
` })
});

/* ───────────────────────── DISPUTE ───────────────────────── */
W.convert({
  file: 'Dispute.dc.html', surface: 'trader', active: 'cmt', w: 1440, h: 1100, extra: STATE_LABEL,
  css: `.center{max-width:760px;margin:0 auto;padding:36px;text-align:center}`,
  markup: W.appShell({ statebar: W.STATEBAR('views', 'stateLabel'), inner: `
<div class="page-head"><div class="grow">${BACK('{{ sh.current }}')}<h1>{{ headline }}</h1></div></div>

<sc-if value="{{ isPick }}" hint-placeholder-val="{{ true }}">
<div class="split">
<section class="panel"><div class="panel-b" style="padding:28px">
<h2 style="margin:0 0 8px;font-size:24px;font-weight:600">{{ t.pickTitle }}</h2>
<p style="margin:0 0 22px;color:var(--ink-2)">{{ t.pickLede }}</p>
<div class="cols cols-2" style="gap:12px">
<sc-for list="{{ kinds }}" as="k" hint-placeholder-count="5">
<button type="button" onClick="{{ k.pick }}" aria-pressed="{{ k.on }}" class="panel" style="padding:16px;display:flex;gap:12px;align-items:flex-start;text-align:start;cursor:pointer;color:inherit;border-color:{{ k.bd }};border-width:{{ k.bw }}px">
<span aria-hidden="true" style="flex:none;width:20px;height:20px;border-radius:50%;border:2px solid {{ k.dotBd }};background:{{ k.dotBg }};display:grid;place-items:center;color:#fff;font-size:10px">{{ k.check }}</span>
<span><span style="display:block;font-weight:600">{{ k.title }}</span><span style="display:block;font-size:var(--t-sm);color:var(--ink-2);margin-top:4px;line-height:1.6">{{ k.body }}</span></span>
</button>
</sc-for>
</div>
</div>
<div class="panel-f" style="display:flex"><div style="flex:1"></div><button type="button" onClick="{{ goDetail }}" class="btn btn-dark btn-lg">{{ t.cont }}</button></div>
</section>
<aside class="panel sticky"><div class="panel-b" style="display:flex;align-items:center;gap:14px">
<span class="img ph ph-coat" style="flex:none;width:60px;height:74px;border-radius:var(--r-sm)"></span>
<div><div style="font-weight:600">{{ t.item }}</div><div class="num" style="font-size:var(--t-sm);color:var(--ink-2);margin-top:4px"><bdi>{{ itemMeta }}</bdi></div></div>
</div></aside>
</div>
</sc-if>

<sc-if value="{{ isDetail }}" hint-placeholder-val="{{ false }}">
<div class="split">
<section class="panel"><div class="panel-b" style="padding:28px">
<h2 style="margin:0 0 8px;font-size:24px;font-weight:600">{{ t.detailTitle }}</h2>
<p style="margin:0 0 22px;color:var(--ink-2)">{{ t.detailLede }}</p>
<div style="margin-bottom:22px"><span class="field">{{ t.desc }}</span><textarea class="input" placeholder="{{ t.descPh }}"></textarea></div>
<div style="margin-bottom:22px"><span class="field">{{ t.evidence }}</span>
<div style="display:flex;gap:12px;flex-wrap:wrap">
<button type="button" style="width:110px;height:120px;border:1.5px dashed var(--rule-strong);border-radius:var(--r-sm);background:var(--surface-2);cursor:pointer;color:var(--ink-2);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;font-size:var(--t-xs)"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 16V6M8 10l4-4 4 4"/><path d="M4 18h16"/></svg>{{ t.addPhoto }}</button>
<sc-for list="{{ evidence }}" as="e" hint-placeholder-count="2">
<div style="width:110px;height:120px;border-radius:var(--r-sm);background:linear-gradient(135deg, oklch(0.9 0.02 {{ e.h }}), oklch(0.84 0.03 {{ e.h }}));border:1px solid var(--rule);position:relative">
<button type="button" aria-label="{{ removeLabel }}" style="position:absolute;inset-block-start:6px;inset-inline-end:6px;width:22px;height:22px;border:0;border-radius:50%;background:oklch(1 0 0 / 0.9);cursor:pointer;font-size:10px">✕</button>
</div>
</sc-for>
</div>
<p style="margin:10px 0 0;font-size:var(--t-sm);color:var(--ink-3)">{{ t.autoAttach }}</p>
</div>
<div><span class="field">{{ t.wantTitle }}</span><div class="fchips">
<sc-for list="{{ wants }}" as="w" hint-placeholder-count="3"><button type="button" onClick="{{ w.pick }}" aria-pressed="{{ w.on }}" class="fchip" style="border-color:{{ w.bd }};background:{{ w.bg }};color:{{ w.fg }}">{{ w.label }}</button></sc-for>
</div></div>
</div>
<div class="panel-f" style="display:flex"><div style="flex:1"></div><button type="button" onClick="{{ goSubmitted }}" class="btn btn-dark btn-lg">{{ t.send }}</button></div>
</section>
<aside class="stack sticky"><div class="note"><span class="i">i</span><span>{{ t.platformNote }}</span></div></aside>
</div>
</sc-if>

<sc-if value="{{ isSubmitted }}" hint-placeholder-val="{{ false }}">
<section class="panel center">
<span aria-hidden="true" style="display:inline-grid;place-items:center;width:68px;height:68px;border-radius:50%;background:var(--allowed-bg);color:var(--allowed-ink);font-size:30px;margin-bottom:14px">✓</span>
<h2 style="margin:0 0 8px;font-size:26px;font-weight:600">{{ t.gotTitle }}</h2>
<p style="margin:0 0 22px;color:var(--ink-2)">{{ t.gotLede }}</p>
<div class="cols cols-2" style="text-align:start;margin-bottom:22px">
<sc-for list="{{ attached }}" as="a" hint-placeholder-count="4"><div style="display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid var(--rule);border-radius:var(--r)">${CHECK('var(--allowed-bg)', 'var(--allowed-ink)', '✓', 18)}<span style="font-size:var(--t-sm)">{{ a }}</span></div></sc-for>
</div>
<button type="button" onClick="{{ goReview }}" class="btn btn-primary btn-lg">{{ t.follow }}</button>
</section>
</sc-if>

<sc-if value="{{ isReview }}" hint-placeholder-val="{{ false }}">
<div class="split">
<div class="stack">
<div style="display:flex;gap:14px;padding:20px;border:1px solid {{ rv.bd }};border-radius:var(--r-lg);background:{{ rv.bg }}">
<span aria-hidden="true" style="flex:none;width:36px;height:36px;border-radius:50%;background:{{ rv.dot }};color:#fff;display:grid;place-items:center;font-weight:600">{{ rv.glyph }}</span>
<div style="flex:1"><div style="font-size:var(--t-h2);font-weight:600;margin-bottom:5px">{{ rv.title }}</div><p style="margin:0;color:var(--ink-2);line-height:1.7">{{ rv.body }}</p>
<sc-if value="{{ rv.needsMore }}" hint-placeholder-val="{{ false }}"><button type="button" class="btn" style="margin-top:12px;background:var(--conditional-ink);border-color:var(--conditional-ink);color:#fff">{{ t.addEvidence }}</button></sc-if></div>
</div>
<section class="panel">
<div class="panel-h"><h2>{{ t.soFar }}</h2></div>
<div class="panel-b">
<sc-for list="{{ timeline }}" as="tl" hint-placeholder-count="4">
<div style="display:flex;gap:14px">
<div style="flex:none;display:flex;flex-direction:column;align-items:center;width:16px"><span aria-hidden="true" style="width:12px;height:12px;border-radius:50%;background:{{ tl.dot }}"></span><sc-if value="{{ tl.line }}" hint-placeholder-val="{{ true }}"><span aria-hidden="true" style="flex:1;width:2px;background:var(--rule);min-height:24px"></span></sc-if></div>
<div style="flex:1;padding-block-end:16px"><div style="display:flex;gap:10px"><span style="flex:1;font-weight:{{ tl.fw }}">{{ tl.what }}</span><span class="num" style="font-size:var(--t-xs);color:var(--ink-3)"><bdi>{{ tl.when }}</bdi></span></div><sc-if value="{{ tl.hasBy }}" hint-placeholder-val="{{ false }}"><div style="font-size:var(--t-xs);color:var(--ink-2);margin-top:3px">{{ tl.by }}</div></sc-if></div>
</div>
</sc-for>
</div>
</section>
</div>
<aside class="panel sticky"><div class="panel-b" style="display:flex;align-items:center;gap:14px">
<span class="img ph ph-coat" style="flex:none;width:60px;height:74px;border-radius:var(--r-sm)"></span>
<div><div style="font-weight:600">{{ t.item }}</div><div class="num" style="font-size:var(--t-sm);color:var(--ink-2);margin-top:4px"><bdi>{{ itemMeta }}</bdi></div></div>
</div></aside>
</div>
</sc-if>

<sc-if value="{{ isDecided }}" hint-placeholder-val="{{ false }}">
<div class="split">
<div class="stack">
<div style="display:flex;gap:14px;padding:20px;border:1px solid var(--brand-bd);border-radius:var(--r-lg);background:var(--brand-bg)">
<span aria-hidden="true" style="flex:none;width:36px;height:36px;border-radius:50%;background:var(--allowed);color:#fff;display:grid;place-items:center;font-weight:600">✓</span>
<div><div style="font-size:var(--t-h2);font-weight:600;margin-bottom:5px">{{ t.decTitle }}</div><p style="margin:0;color:var(--ink-2)">{{ t.decLede }}</p></div>
</div>
<div class="cols cols-2">
<section class="panel"><div class="panel-h"><h2>{{ t.reason }}</h2></div><div class="panel-b"><p style="margin:0;line-height:1.75">{{ t.reasonBody }}</p></div></section>
<section class="panel"><div class="panel-h"><h2>{{ t.effect }}</h2></div><div class="panel-b">
<sc-for list="{{ effects }}" as="e" hint-placeholder-count="3"><div style="display:flex;gap:10px;padding:6px 0"><span aria-hidden="true" style="flex:none;width:6px;height:6px;border-radius:50%;background:var(--ink-3);margin-top:9px"></span><span style="font-size:var(--t-sm);line-height:1.65;color:var(--ink-2)">{{ e }}</span></div></sc-for>
</div></section>
</div>
<div class="note"><span class="i">i</span><span>{{ t.decNote }}</span></div>
</div>
<aside class="sticky"><button type="button" class="btn btn-dark btn-lg btn-block">{{ t.leaveReview }}</button></aside>
</div>
</sc-if>
` })
});

/* ───────────────────────── LISTING COMPOSER ───────────────────────── */
W.convert({
  file: 'Listing Composer.dc.html', surface: 'trader', active: 'shop', w: 1440, h: 1350, extra: STATE_LABEL,
  css: `.chipbtn{height:40px;padding:0 16px;border:1px solid var(--rule-strong);border-radius:999px;background:var(--surface);font-size:var(--t-sm);cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.center{max-width:760px;margin:0 auto;padding:36px;text-align:center}
.sec{margin-bottom:24px}`,
  markup: W.appShell({ statebar: W.STATEBAR('views', 'stateLabel'), inner: `
<div class="page-head"><div class="grow">${BACK('{{ sh.current }}')}<h1>{{ headline }}</h1></div></div>

<sc-if value="{{ isBlocked }}" hint-placeholder-val="{{ false }}">
<section class="panel center">
<div style="display:flex;gap:14px;padding:18px;border:1px solid var(--conditional-bd);border-radius:var(--r);background:var(--conditional-bg);text-align:start;margin-bottom:22px">
<span aria-hidden="true" style="flex:none;width:34px;height:34px;border-radius:50%;background:var(--conditional);color:#fff;display:grid;place-items:center;font-weight:600">!</span>
<div><div style="font-size:var(--t-h2);font-weight:600;margin-bottom:5px">{{ t.blockedTitle }}</div><p style="margin:0;color:var(--ink-2);line-height:1.7">{{ t.blockedBody }}</p></div>
</div>
<div style="text-align:start;margin-bottom:22px"><div style="font-weight:600;margin-bottom:10px">{{ t.canDoTitle }}</div>
<sc-for list="{{ canDo }}" as="c" hint-placeholder-count="3"><div style="display:flex;align-items:center;gap:10px;padding:7px 0">${CHECK('var(--allowed-bg)', 'var(--allowed-ink)', '✓', 18)}<span>{{ c }}</span></div></sc-for></div>
<div style="display:flex;gap:12px;justify-content:center"><button type="button" class="btn btn-primary btn-lg">{{ t.addTrader }}</button><button type="button" class="btn btn-lg">{{ t.backToBoard }}</button></div>
</section>
</sc-if>

<sc-if value="{{ isCompose }}" hint-placeholder-val="{{ true }}">
<div class="split split-wide">
<section class="panel"><div class="panel-b" style="padding:28px 32px">
<div class="sec"><span class="field">{{ t.photos }}</span>
<div style="display:flex;gap:12px;flex-wrap:wrap">
<button type="button" style="width:130px;height:160px;border:1.5px dashed var(--rule-strong);border-radius:var(--r-sm);background:var(--surface-2);cursor:pointer;color:var(--ink-2);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;font-size:var(--t-xs)"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.4"/></svg>{{ t.addPhoto }}</button>
<sc-for list="{{ photos }}" as="p" hint-placeholder-count="2">
<div style="width:130px;height:160px;position:relative"><span class="img ph {{ p.ph }}" style="width:100%;height:100%;border-radius:var(--r-sm)"></span>
<sc-if value="{{ p.first }}" hint-placeholder-val="{{ false }}"><span style="position:absolute;inset-block-end:8px;inset-inline-start:8px;height:22px;padding:0 8px;display:inline-flex;align-items:center;border-radius:999px;background:var(--ink);color:var(--ink-on);font-size:var(--t-micro)">{{ cover }}</span></sc-if>
<button type="button" aria-label="{{ remove }}" style="position:absolute;inset-block-start:6px;inset-inline-end:6px;width:24px;height:24px;border:0;border-radius:50%;background:oklch(1 0 0 / 0.9);cursor:pointer;font-size:10px">✕</button></div>
</sc-for>
</div>
<p style="margin:10px 0 0;font-size:var(--t-sm);color:var(--ink-3)">{{ t.photoHint }}</p></div>
<div class="sec"><label class="field" for="ti">{{ t.name }}</label><input id="ti" class="input" value="{{ t.nameVal }}"></div>
<div class="sec"><span class="field">{{ t.category }}</span><div class="fchips">
<sc-for list="{{ cats }}" as="c" hint-placeholder-count="5"><button type="button" onClick="{{ c.pick }}" aria-pressed="{{ c.on }}" class="chipbtn" style="border-color:{{ c.bd }};background:{{ c.bg }};color:{{ c.fg }}">{{ c.label }}</button></sc-for>
</div></div>
<div class="sec"><label class="field" for="ds">{{ t.desc }}</label><textarea id="ds" class="input" value="{{ t.descVal }}"></textarea></div>
<div class="sec cols cols-2">
<div><label class="field" for="pr">{{ t.unitPrice }}</label><input id="pr" class="input num" value="{{ priceVal }}"></div>
<div><label class="field" for="qt">{{ t.qty }}</label><input id="qt" class="input num" value="14"></div>
</div>
<div class="sec"><span class="field">{{ t.details }}</span>
<div class="rows" style="border:1px solid var(--rule);border-radius:var(--r)">
<sc-for list="{{ attrs }}" as="a" hint-placeholder-count="3"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:13px 16px"><span style="color:var(--ink-2)">{{ a.k }}</span><span style="display:flex;align-items:center;gap:8px"><span class="num" style="font-weight:500"><bdi>{{ a.v }}</bdi></span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" stroke-width="2" style="transform:scaleX({{ arrow }})"><path d="M15 5l-7 7 7 7"/></svg></span></div></sc-for>
</div></div>
<div class="sec"><span class="field">{{ t.source }}</span>
<div class="panel" style="padding:14px;display:flex;align-items:center;gap:12px"><span class="av" style="width:38px;height:38px;font-size:11px;background:var(--role-importer-bg);color:var(--role-importer-ink)">{{ t.srcInitials }}</span><div><div style="font-weight:600">{{ t.srcTrip }}</div><div class="num" style="font-size:var(--t-xs);color:var(--ink-2);margin-top:3px"><bdi>{{ srcMeta }}</bdi></div></div></div>
<p style="margin:10px 0 0;font-size:var(--t-sm);color:var(--ink-3)">{{ t.srcHint }}</p></div>
<div><span class="field">{{ t.delivery }}</span><div class="fchips">
<sc-for list="{{ delivery }}" as="d" hint-placeholder-count="3"><button type="button" onClick="{{ d.pick }}" aria-pressed="{{ d.on }}" class="chipbtn" style="border-color:{{ d.bd }};background:{{ d.bg }};color:{{ d.fg }}"><sc-if value="{{ d.on }}" hint-placeholder-val="{{ false }}"><span aria-hidden="true">✓</span></sc-if>{{ d.label }}</button></sc-for>
</div></div>
</div></section>
<aside class="stack sticky">
<section class="panel">
<div class="panel-h"><h2>{{ t.buyerSees }}</h2></div>
<div class="panel-b" style="background:var(--paper-public)">
<article class="pcard" style="max-width:260px;margin:0 auto">
<span class="img img-card ph ph-coat" style="border-radius:0"></span>
<div style="padding:12px 14px"><div style="font-size:var(--t-sm)">{{ t.nameVal }}</div><div class="num" style="font-size:18px;font-weight:600;margin-top:6px"><bdi>{{ priceShown }}</bdi></div><div style="display:flex;align-items:center;gap:6px;padding-top:8px;margin-top:8px;border-top:1px solid var(--rule-faint)"><span style="flex:1;font-size:var(--t-xs);color:var(--ink-2)">{{ t.shop }}</span><svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="var(--allowed)"/><path d="M7.4 12.4l3 3 6.2-6.6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>
</article>
</div>
<div class="panel-f"><button type="button" onClick="{{ goReview }}" class="btn btn-dark btn-lg btn-block">{{ t.previewPublish }}</button></div>
</section>
</aside>
</div>
</sc-if>

<sc-if value="{{ isReview }}" hint-placeholder-val="{{ false }}">
<div class="split">
<section class="panel">
<div class="panel-h"><h2>{{ t.buyerSees }}</h2></div>
<div class="panel-b" style="background:var(--paper-public);display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px">
<article class="pcard"><span class="img img-card ph ph-coat" style="border-radius:0"></span><div style="padding:12px 14px"><div style="font-size:var(--t-sm)">{{ t.nameVal }}</div><div class="num" style="font-size:18px;font-weight:600;margin-top:6px"><bdi>{{ priceShown }}</bdi></div><div style="font-size:var(--t-xs);color:var(--ink-2);margin-top:8px">{{ t.shop }}</div></div></article>
</div>
</section>
<aside class="panel sticky">
<div class="rows">
<sc-for list="{{ checks }}" as="c" hint-placeholder-count="4"><div style="display:flex;align-items:center;gap:10px;padding:13px 20px">${CHECK('{{ c.bg }}', '{{ c.fg }}', '{{ c.glyph }}')}<span style="font-size:var(--t-sm);color:{{ c.tone }}">{{ c.label }}</span></div></sc-for>
</div>
<div class="panel-f" style="display:flex;flex-direction:column;gap:10px"><button type="button" onClick="{{ goDone }}" class="btn btn-primary btn-lg btn-block">{{ t.publish }}</button><button type="button" class="btn btn-lg btn-block">{{ t.saveDraft }}</button></div>
</aside>
</div>
</sc-if>

<sc-if value="{{ isDone }}" hint-placeholder-val="{{ false }}">
<section class="panel center">
<span aria-hidden="true" style="display:inline-grid;place-items:center;width:68px;height:68px;border-radius:50%;background:var(--conditional-bg);color:var(--conditional-ink);font-size:28px;margin-bottom:14px">⏱</span>
<h2 style="margin:0 0 8px;font-size:26px;font-weight:600">{{ t.pendingTitle }}</h2>
<p style="margin:0 0 20px;color:var(--ink-2)">{{ t.pendingBody }}</p>
<div style="text-align:start;margin-bottom:22px"><sc-for list="{{ after }}" as="a" hint-placeholder-count="3"><div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--rule-faint)"><span aria-hidden="true" style="flex:none;width:6px;height:6px;border-radius:50%;background:var(--ink-3)"></span><span style="color:var(--ink-2)">{{ a }}</span></div></sc-for></div>
<button type="button" class="btn btn-dark btn-lg">{{ t.addAnother }}</button>
</section>
</sc-if>
` })
});
