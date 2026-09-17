const W = require('./weblib.js');

const inner = `
<div class="page-head">
<div class="grow">
<h1>{{ sh.current }}</h1>
<p class="sub">{{ tripCounter }}</p>
</div>
<div role="group" aria-label="{{ t.context }}" class="langsw">
<sc-for list="{{ ctx }}" as="c" hint-placeholder-count="2">
<button type="button" onClick="{{ c.pick }}" aria-pressed="{{ c.on }}" style="height:40px;padding:0 16px;font-size:var(--t-sm);background:{{ c.bg }};color:{{ c.fg }}">{{ c.label }}</button>
</sc-for>
</div>
<button type="button" class="btn btn-primary btn-lg">{{ t.openList }}</button>
</div>

<!-- ══ ROW 1 — the trip, with its three limits side by side ══ -->
<div class="split split-wide" style="margin-bottom:24px">
<section class="trip-hero">
<div style="display:flex;align-items:flex-start;gap:18px;margin-bottom:26px">
<div style="flex:1;min-width:0">
<div style="font-size:var(--t-sm);opacity:.72;margin-bottom:6px">{{ t.nextTrip }}</div>
<div style="font-size:34px;font-weight:600;line-height:1.15">{{ dest }}</div>
<div class="num" style="font-size:var(--t-body);opacity:.82;margin-top:6px"><bdi>{{ dates }}</bdi></div>
</div>
<div style="flex:none;text-align:center;background:oklch(1 0 0 / 0.12);border-radius:var(--r);padding:14px 20px">
<div class="num" style="font-size:34px;font-weight:600;line-height:1"><bdi>{{ daysLeft }}</bdi></div>
<div style="font-size:var(--t-xs);opacity:.8;margin-top:5px">{{ t.daysToGo }}</div>
</div>
</div>
<div class="hero-meters">
<sc-for list="{{ meters }}" as="m" hint-placeholder-count="3">
<div>
<div style="font-size:var(--t-sm);opacity:.75;margin-bottom:6px">{{ m.label }}</div>
<div class="num" style="font-size:20px;font-weight:600;margin-bottom:10px"><bdi>{{ m.text }}</bdi></div>
<div class="hmeter"><i style="width:{{ m.pct }}%;opacity:{{ m.op }}"></i></div>
</div>
</sc-for>
</div>
</section>

<section class="panel" style="background:var(--brand-bg);border-color:var(--brand-bd);height:100%;display:flex;flex-direction:column">
<div class="panel-b" style="flex:1;display:flex;flex-direction:column">
<div style="font-size:var(--t-xs);font-weight:600;color:var(--brand-ink);margin-bottom:10px">{{ t.nextStep }}</div>
<div style="font-size:22px;font-weight:600;line-height:1.3;margin-bottom:10px">{{ next.title }}</div>
<p style="margin:0 0 20px;font-size:var(--t-body);line-height:1.7;color:var(--ink-2);flex:1">{{ next.body }}</p>
<button type="button" class="btn btn-primary btn-lg btn-block">{{ next.cta }}</button>
</div>
</section>
</div>

<!-- ══ ROW 2 — demand on the left, what needs you on the right ══ -->
<div class="split">
<div class="stack">

<section class="panel">
<div class="panel-h"><h2>{{ t.demandTitle }}</h2><button type="button" class="link">{{ t.demandLink }}</button></div>
<div class="rows">
<sc-for list="{{ demand }}" as="d" hint-placeholder-count="3">
<div class="drow">
<span class="img ph {{ d.ph }}" style="flex:none;width:64px;height:76px;border-radius:var(--r-sm)"></span>
<div style="flex:1;min-width:0">
<div style="font-size:var(--t-h3);font-weight:600">{{ d.name }}</div>
<div class="num" style="font-size:var(--t-sm);color:var(--ink-2);margin-top:6px"><bdi>{{ d.band }}</bdi></div>
</div>
<div style="flex:none;text-align:end;min-width:150px">
<div><span class="num" style="font-size:24px;font-weight:600;color:var(--allowed-ink)"><bdi>{{ d.confirmed }}</bdi></span> <span style="font-size:var(--t-sm);color:var(--ink-2)">{{ confirmedWord }}</span></div>
<div class="num" style="font-size:var(--t-sm);color:var(--ink-3);margin-top:4px"><bdi>{{ d.interestedLine }}</bdi></div>
</div>
<button type="button" class="btn">{{ t.openList }}</button>
</div>
</sc-for>
</div>
</section>

<section class="panel">
<div class="panel-h"><h2>{{ t.recentTitle }}</h2></div>
<div class="rows">
<sc-for list="{{ recent }}" as="r" hint-placeholder-count="3">
<div style="display:flex;align-items:baseline;gap:14px;padding:14px 20px">
<span style="flex:1;min-width:0;font-size:var(--t-body);color:var(--ink-2)">{{ r.text }}</span>
<span class="num" style="flex:none;font-size:var(--t-xs);color:var(--ink-3)"><bdi>{{ r.when }}</bdi></span>
</div>
</sc-for>
</div>
</section>

</div>

<div class="stack">
<section class="panel">
<div class="panel-h"><h2>{{ t.attentionTitle }}</h2></div>
<div class="rows">
<sc-for list="{{ attention }}" as="a" hint-placeholder-count="3">
<div style="display:flex;gap:13px;padding:16px 20px">
<span aria-hidden="true" style="flex:none;width:36px;height:36px;border-radius:50%;background:{{ a.bg }};display:grid;place-items:center;color:{{ a.fg }}">{{ a.icon }}</span>
<div style="flex:1;min-width:0">
<div style="font-size:var(--t-body);font-weight:600">{{ a.title }}</div>
<div class="num" style="font-size:var(--t-xs);color:{{ a.fg }};font-weight:500;margin-top:3px"><bdi>{{ a.when }}</bdi></div>
<p style="margin:7px 0 10px;font-size:var(--t-sm);color:var(--ink-2);line-height:1.6">{{ a.body }}</p>
<button type="button" class="btn">{{ a.cta }}</button>
</div>
</div>
</sc-for>
</div>
</section>

<section class="panel">
<div class="panel-h"><h2>{{ t.riskTitle }}</h2></div>
<div class="rows">
<sc-for list="{{ risks }}" as="r" hint-placeholder-count="2">
<div style="display:flex;align-items:center;gap:12px;padding:14px 20px">
<span aria-hidden="true" style="flex:none;width:9px;height:9px;border-radius:50%;background:{{ r.dot }}"></span>
<span style="flex:1;min-width:0;font-size:var(--t-sm)">{{ r.text }}</span>
<button type="button" class="link" style="flex:none">{{ r.cta }}</button>
</div>
</sc-for>
</div>
</section>
</div>
</div>
`;

const css = `
.trip-hero{border-radius:var(--r-lg);background:linear-gradient(150deg, oklch(0.330 0.080 254), oklch(0.240 0.060 257));color:#fff;padding:28px 30px;box-shadow:var(--e2)}
.hero-meters{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px;padding-top:22px;border-top:1px solid oklch(1 0 0 / 0.16)}
.hmeter{height:8px;border-radius:4px;background:oklch(1 0 0 / 0.2);overflow:hidden}
.hmeter>i{display:block;height:100%;border-radius:4px;background:#fff}
.drow{display:flex;align-items:center;gap:16px;padding:16px 20px}
`;

W.convert({ file: 'Importer Home.dc.html', surface: 'importer', active: 'home', markup: W.appShell({ inner }), css, w: 1440, h: 1180 });
