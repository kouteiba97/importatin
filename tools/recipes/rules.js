/* Public "Rules" page — one template, three audiences (?aud=shopper|importer|trader).
   Every rule, figure, date and reference comes from designs/rules-content.js,
   the stand-in for the content the admin team publishes from "Admin Rules". */
const N = require('../newscreen.js');

const CSS = `
.rhero{padding:34px 0 0}
.rhero h1{margin:0 0 8px;font-size:38px;font-weight:600;line-height:1.2}
.rhero p{margin:0;color:var(--ink-2);font-size:18px;line-height:1.6;max-width:62ch}
.aud{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:26px 0 30px}
.aud button{display:flex;gap:14px;align-items:center;padding:16px 18px;border:1px solid var(--rule);border-radius:var(--r-lg);background:var(--surface);text-align:start;cursor:pointer;color:inherit;font:inherit}
.aud button:hover{border-color:var(--rule-strong)}
.aud button[aria-pressed="true"]{border-color:var(--ink);box-shadow:inset 0 0 0 1px var(--ink)}
.aud .ic{flex:none;width:44px;height:44px;border-radius:50%;display:grid;place-items:center}
.aud .t{display:block;font-weight:600;font-size:17px}
.aud .s{display:block;font-size:var(--t-sm);color:var(--ink-3);margin-top:3px}
.figs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:26px}
.fig{padding:16px 18px;background:var(--surface);border:1px solid var(--rule);border-radius:var(--r-lg)}
.fig .v{font-family:var(--font-display);font-size:26px;font-weight:600;line-height:1.2}
.fig .k{font-size:var(--t-sm);color:var(--ink-2);margin-top:5px}
.fig .r{font-size:var(--t-xs);color:var(--ink-3);margin-top:10px}
.toc{display:flex;flex-direction:column;gap:2px}
.toc button{display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;border:0;border-radius:var(--r-sm);background:transparent;color:var(--ink-2);text-align:start;cursor:pointer;font:inherit;font-size:var(--t-sm)}
.toc button:hover{background:var(--surface-2);color:var(--ink)}
.toc .n{margin-inline-start:auto;font-size:var(--t-xs);color:var(--ink-3)}
.topic{margin-bottom:30px;scroll-margin-top:96px}
.topic h2{margin:0 0 14px;font-size:22px;font-weight:600}
.rule{background:var(--surface);border:1px solid var(--rule);border-radius:var(--r-lg);padding:20px 22px;margin-bottom:12px}
.rule h3{margin:12px 0 6px;font-size:18px;font-weight:600;line-height:1.4}
.rule p{margin:0;line-height:1.75;color:var(--ink-2)}
.mean{margin-top:14px;padding:12px 14px;border-radius:var(--r);background:var(--surface-2);font-size:var(--t-sm);line-height:1.65}
.mean b{display:block;font-weight:600;margin-bottom:2px;color:var(--ink)}
.rfoot{display:flex;flex-wrap:wrap;align-items:center;gap:6px 18px;margin-top:14px;padding-top:12px;border-top:1px solid var(--rule-faint);font-size:var(--t-xs);color:var(--ink-3)}
.rfoot .law{color:var(--ink-2);font-weight:500}
.rfoot a{color:var(--brand-ink);font-weight:500}
.side h3{margin:0 0 10px;font-size:var(--t-xs);font-weight:600;color:var(--ink-3);text-transform:uppercase;letter-spacing:.06em}
[lang="ar"] .side h3{text-transform:none;letter-spacing:0}
`;

const INNER = `<div class="container">

<section class="rhero">
<h1>{{ t.title }}</h1>
<p>{{ t.sub }}</p>
</section>

<div class="aud" role="group" aria-label="{{ t.audLabel }}">
<sc-for list="{{ auds }}" as="a" hint-placeholder-count="3">
<button type="button" onClick="{{ a.pick }}" aria-pressed="{{ a.on }}">
<span class="ic" style="background:{{ a.bg }};color:{{ a.fg }}">{{ a.icon }}</span>
<span><span class="t">{{ a.label }}</span><span class="s">{{ a.sub }}</span></span>
</button>
</sc-for>
</div>

<sc-if value="{{ hasFigs }}" hint-placeholder-val="{{ true }}">
<div class="figs">
<sc-for list="{{ figs }}" as="f" hint-placeholder-count="4">
<div class="fig"><div class="v num">{{ f.v }}</div><div class="k">{{ f.k }}</div><div class="r">{{ f.r }}</div></div>
</sc-for>
</div>
</sc-if>

<div class="split split-l" style="grid-template-columns:270px minmax(0,1fr)">
<aside class="stack sticky side">
<section class="panel"><div class="panel-b">
<h3>{{ t.toc }}</h3>
<nav class="toc" aria-label="{{ t.toc }}">
<sc-for list="{{ topics }}" as="tp" hint-placeholder-count="5">
<button type="button" onClick="{{ tp.go }}">{{ tp.name }}<span class="n num">{{ tp.count }}</span></button>
</sc-for>
</nav>
</div></section>
<section class="panel"><div class="panel-b">
<div style="font-weight:600;margin-bottom:10px">{{ t.checkQ }}</div>
<button type="button" class="btn btn-dark btn-block">{{ t.checkCta }}</button>
</div></section>
<div class="note"><span class="i">i</span><span>{{ t.disclaimer }}</span></div>
<div style="font-size:var(--t-xs);color:var(--ink-3);padding-inline:4px">{{ updated }}</div>
<button type="button" class="btn" style="justify-content:flex-start">{{ t.report }}</button>
</aside>

<div>
<sc-for list="{{ topics }}" as="tp" hint-placeholder-count="3">
<section class="topic" id="{{ tp.anchor }}">
<h2>{{ tp.name }}</h2>
<sc-for list="{{ tp.items }}" as="r" hint-placeholder-count="2">
<article class="rule">
<span class="chip {{ r.chip }}">{{ r.level }}</span>
<h3>{{ r.title }}</h3>
<p>{{ r.body }}</p>
<sc-if value="{{ r.hasMean }}" hint-placeholder-val="{{ true }}"><div class="mean"><b>{{ t.forYou }}</b>{{ r.mean }}</div></sc-if>
<div class="rfoot">
<span class="law">{{ r.ref }}</span>
<span>{{ r.src }}</span>
<span>{{ r.reviewed }}</span>
<sc-if value="{{ r.hasLink }}" hint-placeholder-val="{{ true }}"><a href="#">{{ t.official }}</a></sc-if>
</div>
</article>
</sc-for>
</section>
</sc-for>
</div>
</div>

</div>`;

const LOGIC = `
  static audInit() { const a = Component.param('aud'); return ['shopper', 'importer', 'trader'].includes(a) ? a : 'shopper'; }

  L = {
    ar: {
      dir: 'rtl', short: 'ع', label: 'ع',
      title: 'القوانين والقواعد',
      sub: 'ما يسمح به القانون الجزائري على مَعْبَر، مشروحاً حسب وضعك.',
      audLabel: 'اختر وضعك',
      audSub: { shopper: 'لماذا بعض المنتجات غير موجودة', importer: 'شروطك وحدودك وواجباتك', trader: 'البيع والتوريد والمسؤوليات' },
      figs: { cap: 'أقصى قيمة في كل تنقّل', trips: 'أقصى عدد تنقّلات في الشهر', duty: 'الحقوق الجمركية', shelf: 'أدنى مدة صلاحية متبقّية' },
      since: 'منذ',
      toc: 'في هذه الصفحة',
      checkQ: 'لست متأكداً من منتج؟', checkCta: 'هل يمكنني استيراد هذا؟',
      disclaimer: 'معلومة استرشادية وليست استشارة قانونية. القرار عند الدخول للجمارك.',
      updated: 'آخر تحديث', report: 'أبلغ عن قاعدة غير محدَّثة',
      forYou: 'ما يعنيه لك', reviewed: 'رُوجعت في', official: 'النص الرسمي'
    },
    fr: {
      dir: 'ltr', short: 'FR', label: 'FR',
      title: 'Règles et lois',
      sub: 'Ce que la loi algérienne permet sur Maabar, expliqué selon votre situation.',
      audLabel: 'Choisissez votre situation',
      audSub: { shopper: 'Pourquoi certains produits sont absents', importer: 'Vos conditions, plafonds et obligations', trader: 'Vente, approvisionnement et responsabilités' },
      figs: { cap: 'Valeur maximale par voyage', trips: 'Voyages par mois, au plus', duty: 'Droit de douane', shelf: 'Durée de vie restante minimale' },
      since: 'depuis le',
      toc: 'Sur cette page',
      checkQ: 'Un doute sur un produit ?', checkCta: 'Puis-je importer ceci ?',
      disclaimer: 'Information indicative, pas un avis juridique. La douane décide à l’entrée.',
      updated: 'Dernière mise à jour :', report: 'Signaler une règle obsolète',
      forYou: 'Pour vous', reviewed: 'Vérifié le', official: 'Texte officiel'
    },
    en: {
      dir: 'ltr', short: 'EN', label: 'EN',
      title: 'Rules and laws',
      sub: 'What Algerian law allows on Maabar, explained for your situation.',
      audLabel: 'Choose your situation',
      audSub: { shopper: 'Why some products aren’t here', importer: 'Your conditions, limits and duties', trader: 'Selling, sourcing and responsibilities' },
      figs: { cap: 'Maximum value per trip', trips: 'Trips per month, at most', duty: 'Customs duty', shelf: 'Minimum shelf life remaining' },
      since: 'since',
      toc: 'On this page',
      checkQ: 'Not sure about a product?', checkCta: 'Can I import this?',
      disclaimer: 'Guidance, not legal advice. Customs decide at entry.',
      updated: 'Last updated', report: 'Report an outdated rule',
      forYou: 'What this means for you', reviewed: 'Reviewed', official: 'Official text'
    }
  };

  AUD_TINT = {
    shopper: ['var(--role-consumer-bg)', 'var(--role-consumer-ink)', 'M4 8h16l-1.2 11a1 1 0 0 1-1 .9H6.2a1 1 0 0 1-1-.9zM8.5 8a3.5 3.5 0 0 1 7 0'],
    importer: ['var(--role-importer-bg)', 'var(--role-importer-ink)', 'M3 15l18-7-7 18-2.5-8z'],
    trader: ['var(--role-trader-bg)', 'var(--role-trader-ink)', 'M4 10V8l2-4h12l2 4v2M4 10h16v10H4zM10 20v-5h4v5']
  };

  icon(d) {
    return React.createElement('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d }));
  }

  card(a, lang, t) {
    const M = window.MaabarRules, [title, body, mean] = a.tx[lang];
    return {
      id: a.id, title: M.fill(title, lang), body: M.fill(body, lang), mean: M.fill(mean || '', lang), hasMean: !!mean,
      level: M.levels[lang][a.level], chip: M.levelChip[a.level],
      ref: M.ref(a.ref, lang), src: M.source(a.ref, lang),
      reviewed: t.reviewed + ' ' + M.date(a.reviewed, lang),
      hasLink: a.ref[0] !== 'platform'
    };
  }

  renderVals() {
    const s = this.state, lang = s.lang, t = this.L[lang], M = window.MaabarRules;
    const live = M.articles.filter(a => a.status === 'published');
    const pub = live.filter(a => a.aud === s.aud);
    const topics = M.topics[s.aud].map(([id, names]) => {
      const items = pub.filter(a => a.topic === id);
      return {
        id, anchor: 'tp-' + id, name: names[lang], count: this.fmt(items.length),
        go: () => { const el = document.getElementById('tp-' + id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
        items: items.map(a => this.card(a, lang, t))
      };
    }).filter(tp => tp.items.length);
    const last = pub.map(a => a.reviewed).sort().pop();
    const figKeys = ['cap', 'trips', 'duty', 'shelf'];
    return {
      rootRef: this.root, t, langs: this.langsFor(lang),
      sh: window.MaabarShell(lang, 'public', 'rules'),
      auds: ['shopper', 'importer', 'trader'].map(id => ({
        id, label: M.audiences[lang][id], sub: t.audSub[id], on: s.aud === id,
        bg: this.AUD_TINT[id][0], fg: this.AUD_TINT[id][1], icon: this.icon(this.AUD_TINT[id][2]),
        pick: () => this.setState({ aud: id })
      })),
      hasFigs: s.aud === 'importer',
      figs: figKeys.map(k => {
        const v = M.values[k];
        return { v: M.valueText(v, lang), k: t.figs[k], r: M.ref(v.ref, lang) + ' · ' + t.since + ' ' + M.date(v.since, lang) };
      }),
      topics,
      updated: t.updated + ' ' + M.date(last, lang)
    };
  }
`;

N.build({
  name: 'Rules', w: 1440, h: 2200,
  extraHead: '<script src="./rules-content.js"></script>\n',
  css: CSS,
  template: N.sitePage(INNER, { tier: 'tier-public', signedIn: true, search: true }),
  state: 'aud: Component.audInit()',
  logic: LOGIC
});
