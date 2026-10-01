/* Admin "Rules pages" — the operations-console screen that controls the public Rules page.
   Structured content (no free-form page editing): each article has placement, text in
   EN/FR/AR, legal reference and linked regulatory values. A content editor (sub-admin)
   drafts and submits; a regulatory approver who is not the author publishes.
   Reads designs/rules-content.js, the same data the public page reads. */
const N = require('../newscreen.js');

const CSS = `
.q{width:100%;display:flex;align-items:center;gap:9px;padding:9px 11px;border:0;background:transparent;color:inherit;text-align:start;cursor:pointer;border-radius:var(--r-sm);font-size:var(--t-sm)}
.q:hover{background:var(--surface-3)}
.row{width:100%;display:flex;gap:10px;padding:11px 13px;border:0;border-bottom:1px solid var(--rule-faint);background:transparent;color:inherit;text-align:start;cursor:pointer}
.row:hover{background:var(--surface-2)}
.panel{background:var(--surface);border:1px solid var(--rule);border-radius:var(--r)}
.ph{padding:10px 13px;border-bottom:1px solid var(--rule);font-size:var(--t-sm);font-weight:600;display:flex;justify-content:space-between;align-items:center;gap:10px}
.pb{padding:13px}
.fld{display:block;font-size:var(--t-xs);color:var(--ink-3);margin-bottom:4px}
.in{width:100%;height:36px;padding:0 10px;border:1px solid var(--rule-strong);border-radius:var(--r-sm);background:var(--surface);font:inherit;font-size:var(--t-sm);color:inherit}
textarea.in{height:auto;min-height:74px;padding:8px 10px;line-height:1.6;resize:vertical}
.in:disabled{background:var(--surface-2);color:var(--ink-2)}
.g3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.g2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.seg{display:inline-flex;border:1px solid var(--rule-strong);border-radius:var(--r-sm);overflow:hidden}
.seg button{height:30px;padding:0 12px;border:0;border-inline-start:1px solid var(--rule);font:inherit;font-size:var(--t-xs);font-weight:500;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.seg button:first-child{border-inline-start:0}
.tok{height:28px;padding:0 10px;border:1px dashed var(--rule-strong);border-radius:999px;background:var(--surface-2);font:inherit;font-size:var(--t-xs);color:var(--ink-2);cursor:pointer}
.tok:disabled{cursor:default;opacity:.7}
.tok code{font-family:var(--mono);color:var(--brand-ink);margin-inline-end:6px}
.ck{display:flex;gap:9px;align-items:flex-start;padding:7px 0;font-size:var(--t-sm);border-bottom:1px solid var(--rule-faint)}
.ck:last-child{border-bottom:0}
.ck .m{flex:none;width:18px;height:18px;border-radius:50%;display:grid;place-items:center;font-size:10px;font-weight:700;margin-top:1px}
.step{display:flex;align-items:center;gap:9px;padding:6px 0;font-size:var(--t-sm)}
.step .d{flex:none;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;font-size:10px;font-weight:600}
.act{height:38px;padding:0 16px;border-radius:var(--r-sm);font:inherit;font-size:var(--t-sm);font-weight:600;cursor:pointer;border:1px solid var(--rule-strong);background:transparent;color:inherit}
.act-p{background:var(--ink);color:var(--ink-on);border-color:var(--ink)}
.act:disabled{opacity:.45;cursor:not-allowed}
.blk{padding:10px 12px;border-radius:var(--r-sm);background:var(--surface-2);border:1px solid var(--rule-faint);font-size:var(--t-sm);line-height:1.6;color:var(--ink-2)}
.pv{border:1px solid var(--rule);border-radius:var(--r);padding:16px 18px;background:var(--surface)}
.pv h3{margin:10px 0 6px;font-size:16px;font-weight:600;line-height:1.4}
.pv p{margin:0;line-height:1.7;color:var(--ink-2);font-size:var(--t-sm)}
.pv .mean{margin-top:12px;padding:10px 12px;border-radius:var(--r-sm);background:var(--surface-2);font-size:var(--t-sm);line-height:1.6}
.pv .mean b{display:block;font-weight:600}
.pv .rf{display:flex;flex-wrap:wrap;gap:4px 14px;margin-top:12px;padding-top:10px;border-top:1px solid var(--rule-faint);font-size:var(--t-xs);color:var(--ink-3)}
.vt{width:100%;border-collapse:collapse;font-size:var(--t-sm)}
.vt th{font-size:var(--t-xs);font-weight:500;color:var(--ink-3);text-align:start;padding:9px 12px;border-bottom:1px solid var(--rule)}
.vt td{padding:11px 12px;border-bottom:1px solid var(--rule-faint);vertical-align:top}
.vt tr[aria-selected="true"] td{background:var(--neutral-bg)}
.vt tr{cursor:pointer}
.hist{padding:8px 0;border-bottom:1px solid var(--rule-faint);font-size:var(--t-sm)}
.hist:last-child{border-bottom:0}
`;

const RAIL = `<aside style="flex:none;width:216px;background:var(--surface);border-inline-end:1px solid var(--rule);display:flex;flex-direction:column">
<div style="padding:13px 14px;border-bottom:1px solid var(--rule)">
<div style="display:flex;align-items:center;gap:8px">
<div style="flex:1;font-family:var(--font-display);font-weight:600;font-size:16px">{{ t.brand }}</div>
<div role="group" aria-label="{{ t.langLabel }}" style="display:flex;border:1px solid var(--rule-strong);border-radius:var(--r-sm);overflow:hidden;flex:none">
<sc-for list="{{ langs }}" as="l" hint-placeholder-count="3">
<button type="button" onClick="{{ l.pick }}" aria-pressed="{{ l.on }}" style="height:24px;padding:0 8px;border:0;background:{{ l.bg }};color:{{ l.fg }};font-size:var(--t-micro);font-weight:500;cursor:pointer">{{ l.short }}</button>
</sc-for>
</div>
</div>
<div style="font-size:var(--t-xs);color:var(--ink-3);margin-top:2px">{{ t.opsCenter }}</div>
</div>
<div style="padding:11px 8px;flex:1">
<sc-for list="{{ groups }}" as="g" hint-placeholder-count="3">
<div style="margin-bottom:13px">
<div style="font-size:var(--t-micro);color:var(--ink-3);padding:0 11px 6px">{{ g.label }}</div>
<sc-for list="{{ g.items }}" as="q" hint-placeholder-count="4">
<button type="button" aria-current="{{ q.on }}" class="q" style="background:{{ q.bg }};font-weight:{{ q.fw }}">
<span aria-hidden="true" style="flex:none;width:6px;height:6px;border-radius:50%;background:{{ q.dot }}"></span>
<span style="flex:1;min-width:0">{{ q.label }}</span>
<span class="num" style="flex:none;font-size:var(--t-xs);color:{{ q.nFg }};font-weight:600"><bdi>{{ q.n }}</bdi></span>
</button>
</sc-for>
</div>
</sc-for>
</div>
<div style="padding:11px 14px;border-top:1px solid var(--rule);display:flex;align-items:center;gap:8px">
<span aria-hidden="true" style="flex:none;width:26px;height:26px;border-radius:50%;background:var(--role-trader-bg);display:grid;place-items:center;font-size:10px;font-weight:600;color:var(--role-trader-ink)">{{ me.initials }}</span>
<div style="flex:1;min-width:0">
<div style="font-size:var(--t-xs);font-weight:500">{{ me.name }}</div>
<div style="font-size:var(--t-micro);color:var(--ink-3)">{{ me.role }}</div>
</div>
</div>
</aside>`;

const LIST = `<section style="flex:none;width:300px;background:var(--surface);border-inline-end:1px solid var(--rule);display:flex;flex-direction:column">
<div style="padding:12px 13px;border-bottom:1px solid var(--rule)">
<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
<span style="font-size:var(--t-h3);font-weight:600;flex:1">{{ t.title }}</span>
<sc-if value="{{ canCreate }}" hint-placeholder-val="{{ true }}"><button type="button" class="act" style="height:30px;padding:0 10px;font-size:var(--t-xs)">{{ t.newArticle }}</button></sc-if>
</div>
<div class="seg" role="tablist" style="display:flex;margin-bottom:10px">
<sc-for list="{{ views }}" as="v" hint-placeholder-count="2">
<button type="button" role="tab" onClick="{{ v.pick }}" aria-selected="{{ v.on }}" style="flex:1;justify-content:center;background:{{ v.bg }};color:{{ v.fg }}">{{ v.label }}</button>
</sc-for>
</div>
<sc-if value="{{ isArticles }}" hint-placeholder-val="{{ true }}">
<div class="g2">
<select class="in" style="height:32px;font-size:var(--t-xs)" value="{{ fAud }}" onChange="{{ onFAud }}" aria-label="{{ t.audience }}">
<sc-for list="{{ audOpts }}" as="o" hint-placeholder-count="4"><option value="{{ o.id }}">{{ o.label }}</option></sc-for>
</select>
<select class="in" style="height:32px;font-size:var(--t-xs)" value="{{ fSt }}" onChange="{{ onFSt }}" aria-label="{{ t.statusL }}">
<sc-for list="{{ stOpts }}" as="o" hint-placeholder-count="4"><option value="{{ o.id }}">{{ o.label }}</option></sc-for>
</select>
</div>
</sc-if>
</div>
<div style="flex:1;overflow:auto">
<sc-if value="{{ isArticles }}" hint-placeholder-val="{{ true }}">
<sc-for list="{{ rows }}" as="r" hint-placeholder-count="8">
<button type="button" onClick="{{ r.pick }}" aria-current="{{ r.on }}" class="row" style="background:{{ r.bg }}">
<span aria-hidden="true" style="flex:none;width:3px;align-self:stretch;border-radius:2px;background:{{ r.bar }}"></span>
<span style="flex:1;min-width:0">
<span style="display:flex;align-items:center;gap:7px">
<span class="ref" style="flex:1">{{ r.ref }}</span>
<span class="chip {{ r.chip }}" style="height:20px;font-size:var(--t-micro);padding:0 7px">{{ r.status }}</span>
</span>
<span style="display:block;margin-top:4px;font-size:var(--t-sm);font-weight:{{ r.fw }};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ r.title }}</span>
<span style="display:block;font-size:var(--t-micro);color:var(--ink-3);margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ r.sub }}</span>
</span>
</button>
</sc-for>
</sc-if>
<sc-if value="{{ isValues }}" hint-placeholder-val="{{ false }}">
<sc-for list="{{ vrows }}" as="r" hint-placeholder-count="5">
<button type="button" onClick="{{ r.pick }}" aria-current="{{ r.on }}" class="row" style="background:{{ r.bg }}">
<span style="flex:1;min-width:0">
<span style="display:flex;align-items:center;gap:7px"><span class="ref" style="flex:1">{{ r.key }}</span><sc-if value="{{ r.isPending }}" hint-placeholder-val="{{ false }}"><span class="chip chip-brand" style="height:20px;font-size:var(--t-micro);padding:0 7px">{{ t.status.review }}</span></sc-if></span>
<span style="display:block;margin-top:4px;font-size:var(--t-sm);font-weight:{{ r.fw }}">{{ r.name }}</span>
<span class="num" style="display:block;font-size:var(--t-xs);color:var(--ink-2);margin-top:3px">{{ r.value }}</span>
</span>
</button>
</sc-for>
</sc-if>
</div>
</section>`;

const ROLEBAR = `<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--surface);border:1px dashed var(--rule-strong);border-radius:var(--r-sm)">
<span style="font-size:var(--t-xs);color:var(--ink-3)">{{ t.viewAs }}</span>
<div class="seg">
<sc-for list="{{ roles }}" as="ro" hint-placeholder-count="3">
<button type="button" onClick="{{ ro.pick }}" aria-pressed="{{ ro.on }}" style="background:{{ ro.bg }};color:{{ ro.fg }}">{{ ro.label }}</button>
</sc-for>
</div>
<span style="flex:1"></span>
<span class="ref">{{ me.id }}</span>
</div>`;

const ARTICLE = `<sc-if value="{{ isArticles }}" hint-placeholder-val="{{ true }}">
<div style="display:flex;align-items:flex-start;gap:12px">
<div style="flex:1;min-width:0">
<h1 style="margin:0;font-size:var(--t-h1);font-weight:600">{{ cur.heading }}</h1>
<div style="display:flex;align-items:center;gap:9px;margin-top:6px;flex-wrap:wrap">
<span class="ref">{{ cur.ref }}</span>
<span class="num" style="font-size:var(--t-xs);color:var(--ink-2)">{{ cur.version }}</span>
<span style="font-size:var(--t-xs);color:var(--ink-3)">{{ cur.where }}</span>
</div>
</div>
<span class="chip {{ cur.chip }}">{{ cur.status }}</span>
</div>

<div style="display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:12px;align-items:start">
<div style="display:flex;flex-direction:column;gap:12px;min-width:0">

<div class="panel"><div class="ph"><span>{{ t.placement }}</span></div><div class="pb g3">
<label><span class="fld">{{ t.audience }}</span><select class="in" value="{{ cur.aud }}" onChange="{{ cur.onAud }}" disabled="{{ ro }}"><sc-for list="{{ audList }}" as="o" hint-placeholder-count="3"><option value="{{ o.id }}">{{ o.label }}</option></sc-for></select></label>
<label><span class="fld">{{ t.topic }}</span><select class="in" value="{{ cur.topic }}" onChange="{{ cur.onTopic }}" disabled="{{ ro }}"><sc-for list="{{ topicList }}" as="o" hint-placeholder-count="5"><option value="{{ o.id }}">{{ o.label }}</option></sc-for></select></label>
<label><span class="fld">{{ t.level }}</span><select class="in" value="{{ cur.level }}" onChange="{{ cur.onLevel }}" disabled="{{ ro }}"><sc-for list="{{ levelList }}" as="o" hint-placeholder-count="5"><option value="{{ o.id }}">{{ o.label }}</option></sc-for></select></label>
</div></div>

<div class="panel"><div class="ph"><span>{{ t.text }}</span>
<div class="seg" role="tablist" aria-label="{{ t.text }}">
<sc-for list="{{ txTabs }}" as="x" hint-placeholder-count="3">
<button type="button" role="tab" onClick="{{ x.pick }}" aria-selected="{{ x.on }}" style="background:{{ x.bg }};color:{{ x.fg }}"><span aria-hidden="true" style="width:7px;height:7px;border-radius:50%;background:{{ x.dot }}"></span>{{ x.label }}</button>
</sc-for>
</div></div>
<div class="pb" style="display:flex;flex-direction:column;gap:10px" dir="{{ txDir }}" lang="{{ txLang }}">
<label><span class="fld">{{ t.fTitle }}</span><input class="in" value="{{ tx.title }}" onChange="{{ tx.onTitle }}" disabled="{{ ro }}"></label>
<label><span class="fld">{{ t.fBody }}</span><textarea class="in" rows="3" value="{{ tx.body }}" onChange="{{ tx.onBody }}" disabled="{{ ro }}"></textarea></label>
<label><span class="fld">{{ t.fMean }}</span><textarea class="in" rows="2" value="{{ tx.mean }}" onChange="{{ tx.onMean }}" disabled="{{ ro }}" style="border-color:{{ tx.meanBd }}"></textarea></label>
<div>
<span class="fld">{{ t.insert }}</span>
<div style="display:flex;flex-wrap:wrap;gap:6px">
<sc-for list="{{ tokens }}" as="k" hint-placeholder-count="4">
<button type="button" class="tok" onClick="{{ k.add }}" disabled="{{ ro }}"><code>{{ k.code }}</code><span class="num">{{ k.value }}</span></button>
</sc-for>
</div>
</div>
</div></div>

<div class="panel"><div class="ph"><span>{{ t.legal }}</span></div><div class="pb" style="display:flex;flex-direction:column;gap:10px">
<div class="g2">
<label><span class="fld">{{ t.instrument }}</span><select class="in" value="{{ cur.ins }}" onChange="{{ cur.onIns }}" disabled="{{ ro }}"><sc-for list="{{ insList }}" as="o" hint-placeholder-count="5"><option value="{{ o.id }}">{{ o.label }}</option></sc-for></select></label>
<label><span class="fld">{{ t.article }}</span><input class="in" dir="ltr" value="{{ cur.art }}" onChange="{{ cur.onArt }}" disabled="{{ ro }}"></label>
</div>
<div class="g2">
<label><span class="fld">{{ t.source }}</span><input class="in" value="{{ cur.src }}" disabled="{{ true }}"></label>
<label><span class="fld">{{ t.reviewedL }}</span><input class="in num" value="{{ cur.reviewed }}" disabled="{{ true }}"></label>
</div>
</div></div>

<div class="panel"><div class="ph"><span>{{ t.preview }}</span><span style="font-size:var(--t-xs);font-weight:400;color:var(--ink-3)">{{ pvWhere }}</span></div><div class="pb" style="background:var(--surface-2)">
<div class="pv" dir="{{ txDir }}" lang="{{ txLang }}">
<span class="chip {{ pv.chip }}">{{ pv.level }}</span>
<h3>{{ pv.title }}</h3>
<p>{{ pv.body }}</p>
<sc-if value="{{ pv.hasMean }}" hint-placeholder-val="{{ true }}"><div class="mean"><b>{{ pv.forYou }}</b>{{ pv.mean }}</div></sc-if>
<div class="rf"><span style="color:var(--ink-2);font-weight:500">{{ pv.ref }}</span><span>{{ pv.src }}</span></div>
</div>
</div></div>

</div>

<div style="display:flex;flex-direction:column;gap:12px">

<div class="panel"><div class="ph"><span>{{ t.workflow }}</span></div><div class="pb">
<sc-for list="{{ steps }}" as="s" hint-placeholder-count="4">
<div class="step"><span class="d" style="background:{{ s.bg }};color:{{ s.fg }}">{{ s.mark }}</span><span style="font-weight:{{ s.fw }}">{{ s.label }}</span></div>
</sc-for>
<div style="display:flex;flex-direction:column;gap:4px;margin-top:10px;padding-top:10px;border-top:1px solid var(--rule-faint);font-size:var(--t-xs);color:var(--ink-2)">
<div>{{ t.author }} · <bdi>{{ cur.author }}</bdi></div>
<div>{{ t.approver }} · <bdi>{{ cur.approver }}</bdi></div>
</div>
</div></div>

<div class="panel"><div class="ph"><span>{{ t.checks }}</span><span class="num" style="font-weight:400;font-size:var(--t-xs);color:var(--ink-3)">{{ ckCount }}</span></div><div class="pb" style="padding-block:6px">
<sc-for list="{{ checks }}" as="c" hint-placeholder-count="4">
<div class="ck"><span class="m" style="background:{{ c.bg }};color:{{ c.fg }}">{{ c.mark }}</span><span style="flex:1"><span style="display:block">{{ c.label }}</span><sc-if value="{{ c.hasWhy }}" hint-placeholder-val="{{ false }}"><span style="display:block;font-size:var(--t-xs);color:var(--prohibited-ink);margin-top:2px">{{ c.why }}</span></sc-if></span></div>
</sc-for>
</div></div>

<div class="panel"><div class="pb" style="display:flex;flex-direction:column;gap:9px">
<sc-for list="{{ actions }}" as="a" hint-placeholder-count="2">
<button type="button" class="act {{ a.cls }}" onClick="{{ a.go }}" disabled="{{ a.off }}">{{ a.label }}</button>
</sc-for>
<sc-if value="{{ hasNote }}" hint-placeholder-val="{{ true }}"><div class="blk">{{ note }}</div></sc-if>
</div></div>

<div class="panel"><div class="ph"><span>{{ t.history }}</span></div><div class="pb" style="padding-block:4px">
<sc-for list="{{ history }}" as="h" hint-placeholder-count="3">
<div class="hist"><div style="display:flex;gap:8px;align-items:baseline"><span class="num" style="font-weight:600">{{ h.v }}</span><span style="flex:1">{{ h.status }}</span><span class="num" style="font-size:var(--t-micro);color:var(--ink-3)">{{ h.when }}</span></div><div style="font-size:var(--t-xs);color:var(--ink-3);margin-top:2px">{{ h.who }}</div></div>
</sc-for>
</div></div>

</div>
</div>
</sc-if>`;

const VALUES = `<sc-if value="{{ isValues }}" hint-placeholder-val="{{ false }}">
<div style="display:flex;align-items:flex-start;gap:12px">
<div style="flex:1;min-width:0">
<h1 style="margin:0;font-size:var(--t-h1);font-weight:600">{{ val.name }}</h1>
<div style="display:flex;align-items:center;gap:9px;margin-top:6px"><span class="ref">{{ val.key }}</span><span style="font-size:var(--t-xs);color:var(--ink-3)">{{ val.basis }}</span></div>
</div>
<span class="chip {{ val.chip }}">{{ val.status }}</span>
</div>

<div class="panel"><table class="vt">
<thead><tr><sc-for list="{{ t.vCols }}" as="h" hint-placeholder-count="5"><th>{{ h }}</th></sc-for></tr></thead>
<tbody>
<sc-for list="{{ vtable }}" as="r" hint-placeholder-count="5">
<tr onClick="{{ r.pick }}" aria-selected="{{ r.on }}"><td style="font-weight:500">{{ r.name }}</td><td class="num">{{ r.value }}</td><td class="num">{{ r.since }}</td><td>{{ r.basis }}</td><td class="num">{{ r.used }}</td></tr>
</sc-for>
</tbody>
</table></div>

<div style="display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:12px;align-items:start">
<div class="panel"><div class="ph"><span>{{ val.formTitle }}</span></div><div class="pb" style="display:flex;flex-direction:column;gap:10px">
<div class="g2">
<label><span class="fld">{{ t.newVal }}</span><input class="in num" dir="ltr" value="{{ val.draft }}" onChange="{{ val.onDraft }}" disabled="{{ vro }}"></label>
<label><span class="fld">{{ t.effective }}</span><input class="in num" dir="ltr" value="{{ val.from }}" onChange="{{ val.onFrom }}" disabled="{{ vro }}"></label>
</div>
<div class="g2">
<label><span class="fld">{{ t.instrument }}</span><input class="in" value="{{ val.ins }}" disabled="{{ true }}"></label>
<label><span class="fld">{{ t.source }}</span><input class="in" value="{{ val.src }}" disabled="{{ true }}"></label>
</div>
<div>
<span class="fld">{{ t.impact }}</span>
<div style="border:1px solid var(--rule);border-radius:var(--r-sm)">
<sc-for list="{{ val.impact }}" as="i" hint-placeholder-count="3">
<div style="display:flex;gap:10px;padding:8px 10px;border-bottom:1px solid var(--rule-faint);font-size:var(--t-sm)"><span class="ref" style="flex:none">{{ i.ref }}</span><span style="flex:1;min-width:0">{{ i.title }}</span><span style="flex:none;font-size:var(--t-xs);color:var(--ink-3)">{{ i.aud }}</span></div>
</sc-for>
<sc-if value="{{ val.figs }}" hint-placeholder-val="{{ true }}"><div style="padding:8px 10px;font-size:var(--t-sm);color:var(--ink-2)">{{ t.figsToo }}</div></sc-if>
</div>
</div>
</div></div>

<div style="display:flex;flex-direction:column;gap:12px">
<div class="panel"><div class="ph"><span>{{ t.checks }}</span></div><div class="pb" style="padding-block:6px">
<sc-for list="{{ val.checks }}" as="c" hint-placeholder-count="3">
<div class="ck"><span class="m" style="background:{{ c.bg }};color:{{ c.fg }}">{{ c.mark }}</span><span style="flex:1"><span style="display:block">{{ c.label }}</span><sc-if value="{{ c.hasWhy }}" hint-placeholder-val="{{ false }}"><span style="display:block;font-size:var(--t-xs);color:var(--prohibited-ink);margin-top:2px">{{ c.why }}</span></sc-if></span></div>
</sc-for>
</div></div>
<div class="panel"><div class="pb" style="display:flex;flex-direction:column;gap:9px">
<sc-for list="{{ val.actions }}" as="a" hint-placeholder-count="2">
<button type="button" class="act {{ a.cls }}" disabled="{{ a.off }}">{{ a.label }}</button>
</sc-for>
<sc-if value="{{ val.hasNote }}" hint-placeholder-val="{{ true }}"><div class="blk">{{ val.note }}</div></sc-if>
</div></div>
</div>
</div>
</sc-if>`;

const TEMPLATE = `<div ref="{{ rootRef }}" dir="rtl" lang="ar" class="tier-admin" style="min-height:100vh">
<div style="display:flex;min-height:100vh">
${RAIL}
${LIST}
<main style="flex:1;min-width:0;padding:14px;display:flex;flex-direction:column;gap:12px;overflow:auto">
${ROLEBAR}
${ARTICLE}
${VALUES}
<div style="font-size:var(--t-micro);color:var(--ink-3)">{{ t.audit }}</div>
</main>
</div>
</div>`;

const LOGIC = `
  count(n, t, f) {
    if (t.dir === 'rtl') {
      const m = n % 100;
      if (n === 1) return f.one;
      if (n === 2) return f.two;
      if (m >= 3 && m <= 10) return this.fmt(n, t.sep) + ' ' + f.few;
      return this.fmt(n, t.sep) + ' ' + f.many;
    }
    return this.fmt(n, t.sep) + ' ' + (n === 1 ? f.one : f.many);
  }

  L = {
    ar: {
      dir: 'rtl', short: 'ع', label: 'ع', langLabel: 'اللغة', sep: ' ',
      brand: 'مَعْبَر', opsCenter: 'مركز العمليات',
      groups: [
        ['الثقة والسلامة', ['طلبات التحقّق', 'مخاطرة', 'إشراف المحتوى', 'نزاعات']],
        ['الامتثال', ['أصناف تحتاج مراجعة', 'صفحات القوانين']],
        ['الفوترة', ['تأكيد اشتراكات']]
      ],
      title: 'صفحات القوانين', newArticle: '+ مادة جديدة',
      viewsL: ['المواد', 'القيم التنظيمية'],
      all: 'الكل', audience: 'الجمهور', statusL: 'الحالة', topic: 'الموضوع', level: 'النوع',
      status: { draft: 'مسودّة', review: 'قيد المراجعة', published: 'منشورة', superseded: 'مستبدَلة' },
      viewAs: 'العرض بصفة',
      people: { 'ADM-031': ['ل ك', 'لينا ك.'], 'ADM-007': ['ك م', 'كريم م.'], 'ADM-001': ['ن س', 'نورة س.'] },
      roleNames: { editor: 'محرّر محتوى · مشرف فرعي', approver: 'مُصادِق تنظيمي', superadmin: 'مشرف عام' },
      roleShort: { editor: 'محرّر', approver: 'مُصادِق', superadmin: 'مشرف عام' },
      placement: 'الموضع', text: 'النص', fTitle: 'العنوان', fBody: 'الشرح', fMean: 'ما يعنيه للمستخدم',
      insert: 'إدراج قيمة', legal: 'المرجع القانوني', instrument: 'النص القانوني', article: 'المادة', source: 'المصدر',
      reviewedL: 'آخر مراجعة', preview: 'معاينة كما يراها الجمهور', on: 'صفحة القوانين',
      workflow: 'مسار النشر', steps: ['مسودّة', 'قيد المراجعة', 'مُصادَق عليها', 'منشورة'],
      author: 'الكاتب', approver: 'المُصادِق', none: '—',
      checks: 'قبل النشر', ckOf: (a, b) => a + ' من ' + b,
      ck: { text: 'النص مكتمل بالعربية والفرنسية والإنجليزية', legal: 'مرجع قانوني بمصدر رسمي', values: 'كل القيم المدرجة مُصادَق عليها', sep: 'ينشرها شخص غير كاتبها' },
      why: { text: 'ناقص: ', legal: 'النص الرسمي لم يُنشر بعد في الجريدة الرسمية', values: 'قيمة غير مُصادَق عليها: ', unknown: 'قيمة غير معروفة: ', sep: 'أنت كاتب هذه النسخة' },
      act: { submit: 'أرسل للمراجعة', save: 'احفظ المسودّة', withdraw: 'اسحب من المراجعة', publish: 'صادِق وانشر', ret: 'أعِد إلى المحرّر', newDraft: 'ابدأ مسودّة جديدة', unpublish: 'أوقف النشر' },
      notes: { waiting: 'بانتظار مُصادِق.', notSubmitted: 'لم يُرسلها المحرّر للمراجعة بعد.', superadmin: 'المشرف العام يمنح الأدوار، ولا يحرّر القواعد ولا ينشرها.', self: 'أنت كاتب هذه النسخة. يجب أن ينشرها مُصادِق آخر.', blocked: 'لا يمكن النشر قبل اكتمال الشروط.', live: 'هذه النسخة معروضة الآن للجمهور.' },
      history: 'النسخ', forYou: 'ما يعنيه لك',
      vCols: ['القيمة', 'الحالية', 'سارية منذ', 'الأساس القانوني', 'مستعملة في'],
      vNames: { cap: 'أقصى قيمة في كل تنقّل', trips: 'أقصى عدد تنقّلات في الشهر', duty: 'الحقوق الجمركية', shelf: 'أدنى مدة صلاحية متبقّية', tax: 'الضريبة الجزافية الخاصة' },
      articlesN: { one: 'مادة واحدة', two: 'مادّتان', few: 'مواد', many: 'مادة' },
      propose: 'اقترح نسخة جديدة', pendingT: 'النسخة المقترحة', newVal: 'القيمة الجديدة', effective: 'سارية من',
      impact: 'المواد التي ستعرض القيمة الجديدة', figsToo: 'والأرقام الرئيسية في صفحة المستوردين.',
      vck: { legal: 'مرجع قانوني بمصدر رسمي', sep: 'يُصادِق عليها شخص غير مقترحها', date: 'تاريخ السريان في المستقبل أو اليوم' },
      vact: { propose: 'أرسل للمصادقة', approve: 'صادِق وجدوِل', ret: 'أعِد إلى المقترِح' },
      vnotes: { current: 'هذه هي القيمة السارية حالياً. أي تغيير يمرّ بنسخة جديدة مؤرَّخة.', pending: 'لا يمكن المصادقة قبل صدور النص الرسمي.' },
      audit: 'كل تغيير يُسجَّل باسم الكاتب والمُصادِق والتوقيت.'
    },
    fr: {
      dir: 'ltr', short: 'FR', label: 'FR', langLabel: 'Langue', sep: ' ',
      brand: 'Maabar', opsCenter: 'Centre des opérations',
      groups: [
        ['Confiance et sécurité', ['Demandes de vérification', 'Risque', 'Modération', 'Litiges']],
        ['Conformité', ['Articles à examiner', 'Pages des règles']],
        ['Facturation', ['Confirmation d’abonnements']]
      ],
      title: 'Pages des règles', newArticle: '+ Nouvel article',
      viewsL: ['Articles', 'Valeurs réglementaires'],
      all: 'Tous', audience: 'Public', statusL: 'Statut', topic: 'Rubrique', level: 'Type',
      status: { draft: 'Brouillon', review: 'En revue', published: 'Publié', superseded: 'Remplacé' },
      viewAs: 'Voir en tant que',
      people: { 'ADM-031': ['LK', 'Lina K.'], 'ADM-007': ['KM', 'Karim M.'], 'ADM-001': ['NS', 'Nora S.'] },
      roleNames: { editor: 'Rédactrice · sous-admin', approver: 'Approbateur réglementaire', superadmin: 'Super-admin' },
      roleShort: { editor: 'Rédactrice', approver: 'Approbateur', superadmin: 'Super-admin' },
      placement: 'Emplacement', text: 'Texte', fTitle: 'Titre', fBody: 'Explication', fMean: 'Ce que cela signifie pour l’utilisateur',
      insert: 'Insérer une valeur', legal: 'Référence juridique', instrument: 'Texte', article: 'Article', source: 'Source',
      reviewedL: 'Dernière vérification', preview: 'Aperçu public', on: 'Page Règles',
      workflow: 'Circuit de publication', steps: ['Brouillon', 'En revue', 'Approuvé', 'Publié'],
      author: 'Auteur', approver: 'Approbateur', none: '—',
      checks: 'Avant publication', ckOf: (a, b) => a + ' sur ' + b,
      ck: { text: 'Texte complet en EN, FR et AR', legal: 'Référence juridique avec source officielle', values: 'Toutes les valeurs sont approuvées', sep: 'Publié par une autre personne que l’auteur' },
      why: { text: 'Manque : ', legal: 'Texte officiel pas encore publié au Journal officiel', values: 'Valeur non approuvée : ', unknown: 'Valeur inconnue : ', sep: 'Vous êtes l’auteur de cette version' },
      act: { submit: 'Soumettre pour revue', save: 'Enregistrer le brouillon', withdraw: 'Retirer de la revue', publish: 'Approuver et publier', ret: 'Renvoyer à l’auteur', newDraft: 'Nouveau brouillon', unpublish: 'Dépublier' },
      notes: { waiting: 'En attente d’un approbateur.', notSubmitted: 'Pas encore soumis par l’auteur.', superadmin: 'Le super-admin attribue les rôles. Il ne rédige ni ne publie les règles.', self: 'Vous avez rédigé cette version. Un autre approbateur doit la publier.', blocked: 'Publication impossible tant que les contrôles ne sont pas remplis.', live: 'Cette version est affichée au public.' },
      history: 'Versions', forYou: 'Pour vous',
      vCols: ['Valeur', 'Actuelle', 'En vigueur depuis', 'Base légale', 'Utilisée dans'],
      vNames: { cap: 'Valeur maximale par voyage', trips: 'Voyages par mois, au plus', duty: 'Droit de douane', shelf: 'Durée de vie restante minimale', tax: 'Impôt forfaitaire spécial' },
      articlesN: { one: 'article', many: 'articles' },
      propose: 'Proposer une nouvelle version', pendingT: 'Version proposée', newVal: 'Nouvelle valeur', effective: 'En vigueur à partir du',
      impact: 'Articles qui afficheront la nouvelle valeur', figsToo: 'Et les chiffres clés de la page Micro-importateurs.',
      vck: { legal: 'Référence juridique avec source officielle', sep: 'Approuvée par une autre personne que l’auteur', date: 'Date d’effet aujourd’hui ou plus tard' },
      vact: { propose: 'Soumettre pour approbation', approve: 'Approuver et programmer', ret: 'Renvoyer à l’auteur' },
      vnotes: { current: 'Valeur en vigueur. Tout changement passe par une nouvelle version datée.', pending: 'Approbation impossible avant la publication du texte officiel.' },
      audit: 'Chaque modification est enregistrée avec l’auteur, l’approbateur et l’heure.'
    },
    en: {
      dir: 'ltr', short: 'EN', label: 'EN', langLabel: 'Language', sep: ',',
      brand: 'Maabar', opsCenter: 'Operations centre',
      groups: [
        ['Trust & Safety', ['Verification requests', 'Risk', 'Content moderation', 'Disputes']],
        ['Compliance', ['Items needing review', 'Rules pages']],
        ['Billing', ['Subscription confirmations']]
      ],
      title: 'Rules pages', newArticle: '+ New article',
      viewsL: ['Articles', 'Regulatory values'],
      all: 'All', audience: 'Audience', statusL: 'Status', topic: 'Topic', level: 'Type',
      status: { draft: 'Draft', review: 'In review', published: 'Published', superseded: 'Superseded' },
      viewAs: 'Viewing as',
      people: { 'ADM-031': ['LK', 'Lina K.'], 'ADM-007': ['KM', 'Karim M.'], 'ADM-001': ['NS', 'Nora S.'] },
      roleNames: { editor: 'Content editor · sub-admin', approver: 'Regulatory approver', superadmin: 'Superadmin' },
      roleShort: { editor: 'Editor', approver: 'Approver', superadmin: 'Superadmin' },
      placement: 'Placement', text: 'Text', fTitle: 'Title', fBody: 'Explanation', fMean: 'What this means for the user',
      insert: 'Insert a value', legal: 'Legal reference', instrument: 'Instrument', article: 'Article', source: 'Source',
      reviewedL: 'Last reviewed', preview: 'Public preview', on: 'Rules page',
      workflow: 'Publishing workflow', steps: ['Draft', 'In review', 'Approved', 'Published'],
      author: 'Author', approver: 'Approver', none: '—',
      checks: 'Before publishing', ckOf: (a, b) => a + ' of ' + b,
      ck: { text: 'Text complete in EN, FR and AR', legal: 'Legal reference with an official source', values: 'Every inserted value is approved', sep: 'Published by someone other than the author' },
      why: { text: 'Missing: ', legal: 'Official text not yet published in the Official Journal', values: 'Value not approved: ', unknown: 'Unknown value: ', sep: 'You wrote this version' },
      act: { submit: 'Submit for review', save: 'Save draft', withdraw: 'Withdraw from review', publish: 'Approve and publish', ret: 'Return to author', newDraft: 'Start a new draft', unpublish: 'Unpublish' },
      notes: { waiting: 'Waiting for an approver.', notSubmitted: 'Not submitted by the author yet.', superadmin: 'Superadmins assign roles. They do not write or publish rules.', self: 'You wrote this version. Another approver must publish it.', blocked: 'Publishing is blocked until every check passes.', live: 'This version is live on the public page.' },
      history: 'Versions', forYou: 'What this means for you',
      vCols: ['Value', 'Current', 'In force since', 'Legal basis', 'Used in'],
      vNames: { cap: 'Maximum value per trip', trips: 'Trips per month, at most', duty: 'Customs duty', shelf: 'Minimum shelf life remaining', tax: 'Special flat tax' },
      articlesN: { one: 'article', many: 'articles' },
      propose: 'Propose a new version', pendingT: 'Proposed version', newVal: 'New value', effective: 'In force from',
      impact: 'Articles that will show the new value', figsToo: 'Plus the key figures on the micro-importer page.',
      vck: { legal: 'Legal reference with an official source', sep: 'Approved by someone other than the proposer', date: 'In force from today or later' },
      vact: { propose: 'Submit for approval', approve: 'Approve and schedule', ret: 'Return to proposer' },
      vnotes: { current: 'This is the value in force. Any change goes through a new dated version.', pending: 'Cannot be approved before the official text is published.' },
      audit: 'Every change is recorded with author, approver and time.'
    }
  };

  GROUPS = [
    [{ id: 'ver', n: 14, dot: 'var(--conditional)' }, { id: 'risk', n: 6, dot: 'var(--prohibited)' }, { id: 'mod', n: 23, dot: 'var(--conditional)' }, { id: 'dis', n: 4, dot: 'var(--prohibited)' }],
    [{ id: 'rev', n: 9, dot: 'var(--conditional)' }, { id: 'rul', n: 2, dot: 'var(--ink-3)' }],
    [{ id: 'bil', n: 7, dot: 'var(--ink-3)' }]
  ];
  USERS = { editor: 'ADM-031', approver: 'ADM-007', superadmin: 'ADM-001' };
  STATUS_CHIP = { draft: 'chip-neutral', review: 'chip-brand', published: 'chip-verified', superseded: 'chip-neutral' };
  LANGS = ['en', 'fr', 'ar'];

  /* the article as currently edited: base data + local edits + status changes */
  art(i) {
    const M = window.MaabarRules, a = M.articles[i], e = this.state.edits[i] || {};
    const tx = {};
    this.LANGS.forEach(l => { tx[l] = (e.tx && e.tx[l]) || a.tx[l]; });
    return Object.assign({}, a, e.meta || {}, { tx, ref: (e.meta && e.meta.ref) || a.ref, status: this.state.st[i] || a.status });
  }
  edit(i, fn) {
    this.setState(s => {
      const M = window.MaabarRules, a = M.articles[i];
      const cur = s.edits[i] || { meta: {}, tx: {} };
      const next = { meta: Object.assign({}, cur.meta), tx: Object.assign({}, cur.tx) };
      fn(next, a);
      return { edits: Object.assign({}, s.edits, { [i]: next }) };
    });
  }
  setTx(i, lang, k, v) {
    this.edit(i, (n, a) => { const arr = (n.tx[lang] || a.tx[lang]).slice(); arr[k] = v; n.tx[lang] = arr; });
  }
  setMeta(i, k, v) { this.edit(i, n => { n.meta[k] = v; }); }

  checksFor(a, me, t) {
    const M = window.MaabarRules;
    const missing = this.LANGS.filter(l => a.tx[l].some(x => !String(x || '').trim())).map(l => l.toUpperCase());
    const used = [...new Set(this.LANGS.flatMap(l => a.tx[l].join(' ').match(/\\{(\\w+)\\}/g) || []).map(x => x.slice(1, -1)))];
    const unknown = used.filter(k => !M.values[k] && k !== 'tax');
    const pending = used.filter(k => k === 'tax');
    const ins = M.instruments[a.ref[0]];
    const out = [
      { id: 'text', ok: !missing.length, why: t.why.text + missing.join(', ') },
      { id: 'legal', ok: !!ins && !ins.pending && (a.ref[0] === 'platform' || a.ref[0] === 'l1805' || a.ref[0] === 'l0903' || !!String(a.ref[1]).trim()), why: t.why.legal },
      { id: 'values', ok: !unknown.length && !pending.length, why: unknown.length ? t.why.unknown + unknown.map(k => '{' + k + '}').join(', ') : t.why.values + pending.map(k => '{' + k + '}').join(', ') },
      { id: 'sep', ok: me !== a.by, why: t.why.sep }
    ];
    return out.map(c => ({ ...c, label: t.ck[c.id], hasWhy: !c.ok, mark: c.ok ? '✓' : '✕',
      bg: c.ok ? 'var(--allowed-bg)' : 'var(--prohibited-bg)', fg: c.ok ? 'var(--allowed-ink)' : 'var(--prohibited-ink)' }));
  }

  renderVals() {
    const s = this.state, lang = s.lang, t = this.L[lang], M = window.MaabarRules;
    const me = this.USERS[s.role];
    const person = id => (t.people[id] || ['', t.none])[1];
    const all = M.articles.map((_, i) => this.art(i));
    const audName = id => M.audiences[lang][id];
    const topicName = (aud, id) => ((M.topics[aud] || []).find(x => x[0] === id) || [0, {}])[1][lang] || id;
    const order = { review: 0, draft: 1, published: 2, superseded: 3 };

    const idx = all.map((a, i) => i)
      .filter(i => (s.fAud === 'all' || all[i].aud === s.fAud) && (s.fSt === 'all' || all[i].status === s.fSt))
      .sort((x, y) => order[all[x].status] - order[all[y].status] || (all[x].id < all[y].id ? -1 : 1));
    const sel = idx.includes(s.sel) ? s.sel : (idx[0] !== undefined ? idx[0] : s.sel);
    const a = all[sel];
    const txL = s.txLang || lang;
    const [tTitle, tBody, tMean] = a.tx[txL];
    const ro = s.role !== 'editor' || a.status !== 'draft';
    const checks = this.checksFor(a, s.role === 'approver' ? me : null, t);
    const passed = checks.filter(c => c.ok).length;
    const allOk = passed === checks.length;
    const publishedTwin = all.findIndex((x, i) => i !== sel && x.id === a.id && x.status === 'published');

    // actions and notes by role and status (separation of duty)
    let actions = [], note = '';
    const go = st => () => {
      this.setState(p => {
        const nst = Object.assign({}, p.st, { [sel]: st });
        if (st === 'published' && publishedTwin >= 0) nst[publishedTwin] = 'superseded';
        return { st: nst };
      });
      if (st === 'published') { this.setMeta(sel, 'ok', me); this.setMeta(sel, 'reviewed', new Date().toISOString().slice(0, 10)); }
    };
    if (s.role === 'superadmin') note = t.notes.superadmin;
    else if (s.role === 'editor') {
      if (a.status === 'draft') actions = [{ label: t.act.submit, cls: 'act-p', go: go('review'), off: checks.slice(0, 3).some(c => !c.ok) }, { label: t.act.save, cls: '', go: () => {}, off: false }];
      else if (a.status === 'review') { actions = [{ label: t.act.withdraw, cls: '', go: go('draft'), off: false }]; note = t.notes.waiting; }
      else if (a.status === 'published') { actions = [{ label: t.act.newDraft, cls: '', go: () => {}, off: false }]; note = t.notes.live; }
    } else {
      if (a.status === 'review') {
        actions = [{ label: t.act.publish, cls: 'act-p', go: go('published'), off: !allOk }, { label: t.act.ret, cls: '', go: go('draft'), off: false }];
        note = me === a.by ? t.notes.self : (!allOk ? t.notes.blocked : '');
      } else if (a.status === 'draft') note = t.notes.notSubmitted;
      else if (a.status === 'published') { actions = [{ label: t.act.unpublish, cls: '', go: go('draft'), off: false }]; note = t.notes.live; }
    }

    const stepAt = { draft: 0, review: 1, published: 3, superseded: 3 }[a.status];
    const tokens = Object.keys(M.values).map(k => ({ code: '{' + k + '}', value: M.valueText(M.values[k], lang), add: () => this.setTx(sel, txL, 1, (a.tx[txL][1] || '') + ' {' + k + '}') }));

    // version history for this rule id
    const twins = all.map((x, i) => ({ x, i })).filter(o => o.x.id === a.id).sort((p, q) => q.x.v - p.x.v);
    const oldest = Math.min(...twins.map(o => o.x.v));
    const history = twins.map(o => ({
      v: 'v' + o.x.v, status: t.status[o.x.status], when: o.x.status === 'published' ? M.date(o.x.reviewed, lang) : '',
      who: t.author + ' · ' + person(o.x.by) + (o.x.ok ? '  ·  ' + t.approver + ' · ' + person(o.x.ok) : '')
    }));
    for (let v = oldest - 1; v >= 1; v--) history.push({ v: 'v' + v, status: t.status.superseded, when: '', who: '' });

    // regulatory values view
    const vkeys = ['cap', 'trips', 'duty', 'shelf', 'tax'];
    const vOf = k => k === 'tax' ? M.pendingValues[0] : M.values[k];
    const usedIn = k => all.filter(x => x.status === 'published' && this.LANGS.some(l => x.tx[l].join(' ').includes('{' + k + '}')));
    const vk = vkeys.includes(s.val) ? s.val : 'cap';
    const V = vOf(vk), isPend = vk === 'tax';
    const vChecks = [
      { id: 'legal', ok: !M.instruments[V.ref[0]].pending, why: t.why.legal },
      { id: 'sep', ok: !(s.role === 'approver' && V.by === me), why: t.why.sep },
      { id: 'date', ok: true, why: '' }
    ].map(c => ({ ...c, label: t.vck[c.id], hasWhy: !c.ok, mark: c.ok ? '✓' : '✕',
      bg: c.ok ? 'var(--allowed-bg)' : 'var(--prohibited-bg)', fg: c.ok ? 'var(--allowed-ink)' : 'var(--prohibited-ink)' }));
    const vro = s.role !== 'editor' || isPend;
    let vActions = [], vNote = '';
    if (s.role === 'superadmin') vNote = t.notes.superadmin;
    else if (isPend) {
      if (s.role === 'approver') { vActions = [{ label: t.vact.approve, cls: 'act-p', off: vChecks.some(c => !c.ok) }, { label: t.vact.ret, cls: '', off: false }]; }
      vNote = t.vnotes.pending;
    } else if (s.role === 'editor') { vActions = [{ label: t.vact.propose, cls: 'act-p', off: !(s.vDraft[vk] || '').trim() }]; vNote = t.vnotes.current; }
    else vNote = t.vnotes.current;

    return {
      rootRef: this.root, t, langs: this.langsFor(lang),
      me: { id: me, initials: t.people[me][0], name: t.people[me][1], role: t.roleNames[s.role] },
      groups: this.GROUPS.map((g, gi) => ({
        label: t.groups[gi][0],
        items: g.map((x, xi) => ({ label: t.groups[gi][1][xi], on: x.id === 'rul', bg: x.id === 'rul' ? 'var(--neutral-bg)' : 'transparent', fw: x.id === 'rul' ? 600 : 400, dot: x.dot, n: this.fmt(x.n, t.sep), nFg: x.id === 'rul' ? 'var(--ink)' : 'var(--ink-2)' }))
      })),
      canCreate: s.role === 'editor',
      views: this.sw(['articles', 'values'], 'view', t.viewsL),
      isArticles: s.view === 'articles', isValues: s.view === 'values',
      roles: this.sw(['editor', 'approver', 'superadmin'], 'role', ['editor', 'approver', 'superadmin'].map(r => t.roleShort[r])),
      fAud: s.fAud, fSt: s.fSt,
      onFAud: e => this.setState({ fAud: e.target.value }), onFSt: e => this.setState({ fSt: e.target.value }),
      audOpts: [{ id: 'all', label: t.all }].concat(['shopper', 'importer', 'trader'].map(id => ({ id, label: audName(id) }))),
      stOpts: [{ id: 'all', label: t.all }].concat(['published', 'review', 'draft'].map(id => ({ id, label: t.status[id] }))),
      rows: idx.map(i => {
        const x = all[i];
        return { ref: x.id + ' · v' + x.v, title: M.fill(x.tx[lang][0], lang), sub: audName(x.aud) + ' · ' + topicName(x.aud, x.topic),
          status: t.status[x.status], chip: this.STATUS_CHIP[x.status], on: i === sel,
          bg: i === sel ? 'var(--neutral-bg)' : 'transparent', fw: i === sel ? 600 : 500,
          bar: x.status === 'review' ? 'var(--brand)' : x.status === 'draft' ? 'var(--rule-strong)' : 'transparent',
          pick: () => this.setState({ sel: i }) };
      }),
      cur: {
        heading: M.fill(a.tx[lang][0], lang), ref: a.id, version: 'v' + a.v,
        where: t.on + ' › ' + audName(a.aud) + ' › ' + topicName(a.aud, a.topic),
        status: t.status[a.status], chip: this.STATUS_CHIP[a.status],
        aud: a.aud, topic: a.topic, level: a.level, ins: a.ref[0], art: a.ref[1],
        src: M.source(a.ref, lang), reviewed: a.reviewed ? M.date(a.reviewed, lang) : t.none,
        author: person(a.by), approver: a.ok ? person(a.ok) : t.none,
        onAud: e => { const v = e.target.value; this.setMeta(sel, 'aud', v); this.setMeta(sel, 'topic', M.topics[v][0][0]); },
        onTopic: e => this.setMeta(sel, 'topic', e.target.value),
        onLevel: e => this.setMeta(sel, 'level', e.target.value),
        onIns: e => this.setMeta(sel, 'ref', [e.target.value, a.ref[1]]),
        onArt: e => this.setMeta(sel, 'ref', [a.ref[0], e.target.value])
      },
      ro,
      audList: ['shopper', 'importer', 'trader'].map(id => ({ id, label: audName(id) })),
      topicList: (M.topics[a.aud] || []).map(([id, n]) => ({ id, label: n[lang] })),
      levelList: Object.keys(M.levels[lang]).map(id => ({ id, label: M.levels[lang][id] })),
      insList: Object.keys(M.instruments).map(id => ({ id, label: M.instruments[id][lang] })),
      txTabs: this.LANGS.map(l => {
        const done = a.tx[l].every(x => String(x || '').trim());
        return { label: l.toUpperCase(), on: txL === l, bg: txL === l ? 'var(--ink)' : 'var(--surface)', fg: txL === l ? 'var(--ink-on)' : 'var(--ink-2)',
          dot: done ? 'var(--allowed)' : 'var(--prohibited)', pick: () => this.setState({ txLang: l }) };
      }),
      txDir: txL === 'ar' ? 'rtl' : 'ltr', txLang: txL,
      tx: { title: tTitle, body: tBody, mean: tMean || '', meanBd: (tMean || '').trim() ? 'var(--rule-strong)' : 'var(--prohibited)',
        onTitle: e => this.setTx(sel, txL, 0, e.target.value), onBody: e => this.setTx(sel, txL, 1, e.target.value), onMean: e => this.setTx(sel, txL, 2, e.target.value) },
      tokens,
      pvWhere: t.on + ' · ' + txL.toUpperCase(),
      pv: { chip: M.levelChip[a.level], level: M.levels[txL][a.level], title: M.fill(tTitle, txL), body: M.fill(tBody, txL), mean: M.fill(tMean || '', txL), hasMean: !!(tMean || '').trim(),
        forYou: this.L[txL].forYou, ref: M.ref(a.ref, txL), src: M.source(a.ref, txL) },
      steps: t.steps.map((label, i) => {
        const done = i < stepAt || a.status === 'published', now = i === stepAt && a.status !== 'published';
        return { label, mark: done ? '✓' : String(i + 1), fw: now ? 600 : 400,
          bg: done ? 'var(--allowed-bg)' : now ? 'var(--ink)' : 'var(--surface-3)', fg: done ? 'var(--allowed-ink)' : now ? 'var(--ink-on)' : 'var(--ink-3)' };
      }),
      checks, ckCount: t.ckOf(this.fmt(passed), this.fmt(checks.length)),
      actions, note, hasNote: !!note,
      history,

      vrows: vkeys.map(k => ({ key: vOf(k).key, name: t.vNames[k], value: M.valueText(vOf(k), lang), isPending: k === 'tax', on: k === vk,
        bg: k === vk ? 'var(--neutral-bg)' : 'transparent', fw: k === vk ? 600 : 500, pick: () => this.setState({ val: k }) })),
      vtable: vkeys.map(k => ({ name: t.vNames[k], value: M.valueText(vOf(k), lang), since: M.date(vOf(k).since, lang), basis: M.ref(vOf(k).ref, lang),
        used: this.count(usedIn(k).length, t, t.articlesN), on: k === vk, pick: () => this.setState({ val: k }) })),
      vro,
      val: {
        key: V.key, name: t.vNames[vk], basis: M.ref(V.ref, lang),
        status: isPend ? t.status.review : t.status.published, chip: isPend ? 'chip-brand' : 'chip-verified',
        formTitle: isPend ? t.pendingT : t.propose,
        draft: isPend ? String(V.n) : (s.vDraft[vk] || ''), from: isPend ? V.since : (s.vFrom[vk] || ''),
        onDraft: e => this.setState({ vDraft: Object.assign({}, s.vDraft, { [vk]: e.target.value }) }),
        onFrom: e => this.setState({ vFrom: Object.assign({}, s.vFrom, { [vk]: e.target.value }) }),
        ins: M.instruments[V.ref[0]][lang], src: M.instruments[V.ref[0]].src[lang],
        impact: (isPend ? all.filter(x => x.id === 'RUL-112') : usedIn(vk)).map(x => ({ ref: x.id, title: M.fill(x.tx[lang][0], lang), aud: audName(x.aud) })),
        figs: !isPend,
        checks: vChecks, actions: vActions, note: vNote, hasNote: !!vNote
      }
    };
  }
`;

N.build({
  name: 'Admin Rules', w: 1440, h: 1500, web: false,
  extraHead: '<script src="./rules-content.js"></script>\n',
  css: CSS,
  template: TEMPLATE,
  state: "view: 'articles', role: 'editor', sel: 26, fAud: 'all', fSt: 'all', txLang: null, edits: {}, st: {}, val: 'cap', vDraft: {}, vFrom: {}",
  logic: LOGIC
});
