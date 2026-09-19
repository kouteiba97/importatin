import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from newscreen import build, app_page, statebar

CSS = '''
.setup-grid{display:grid;grid-template-columns:280px minmax(0,1fr);gap:24px;align-items:start}
.form{display:grid;gap:18px;max-width:640px}
.form .row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.chips{display:flex;gap:8px;flex-wrap:wrap}
.chipb{height:36px;padding:0 14px;border:1px solid var(--rule-strong);border-radius:var(--r-pill);background:var(--surface);font-size:var(--t-sm);cursor:pointer;color:inherit}
.chipb[aria-pressed="true"]{background:var(--ink);color:var(--ink-on);border-color:var(--ink)}
.rev{display:grid;grid-template-columns:180px minmax(0,1fr);gap:10px 16px;font-size:var(--t-sm)}
.rev .k{color:var(--ink-3)}
.foot-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:8px}
.savebar{display:flex;align-items:center;gap:10px;font-size:var(--t-xs);color:var(--ink-3)}
.savebar i{width:7px;height:7px;border-radius:50%;background:var(--allowed)}
'''

INNER = '''<div class="page-head"><div class="grow"><h1>{{ t.title }}</h1><p class="sub">{{ t.sub }}</p></div><div class="savebar"><i></i>{{ t.saved }}</div></div>

<div class="setup-grid">
<aside class="stack sticky">
<section class="panel"><div class="panel-b">
<div class="steps">
<sc-for list="{{ steps }}" as="s" hint-placeholder-count="4"><div class="step" data-s="{{ s.s }}"><span class="n">{{ s.n }}</span><span>{{ s.label }}</span></div></sc-for>
</div>
</div></section>
<div class="lock-note"><span class="lk" aria-hidden="true">●</span><span class="grow">{{ t.lockNote }}</span></div>
</aside>

<div class="stack">

<sc-if value="{{ isInfo }}" hint-placeholder-val="{{ true }}">
<section class="panel">
<div class="panel-h"><h2>{{ t.infoTitle }}</h2><span class="meta">{{ stepOf }}</span></div>
<div class="panel-b form">
<div class="row">
<div><label class="fld" for="fn">{{ t.fullName }}</label><input id="fn" class="inp" value="{{ t.fullNameV }}"><div style="font-size:var(--t-xs);color:var(--ink-3);margin-top:6px">{{ t.fullNameHint }}</div></div>
<div><label class="fld" for="wl">{{ t.wilaya }}</label><select id="wl" class="inp"><option>{{ t.wl1 }}</option><option>{{ t.wl2 }}</option><option>{{ t.wl3 }}</option></select></div>
</div>
<div><span class="fld">{{ t.catsLabel }}</span><div class="chips"><sc-for list="{{ cats }}" as="c" hint-placeholder-count="7"><button type="button" class="chipb" aria-pressed="{{ c.on }}">{{ c.label }}</button></sc-for></div></div>
<div><span class="fld">{{ t.destsLabel }}</span><div class="chips"><sc-for list="{{ dests }}" as="d" hint-placeholder-count="6"><button type="button" class="chipb" aria-pressed="{{ d.on }}">{{ d.label }}</button></sc-for></div><div style="font-size:var(--t-xs);color:var(--ink-3);margin-top:8px">{{ t.destsHint }}</div></div>
</div>
<div class="panel-f foot-actions"><button type="button" class="btn">{{ t.later }}</button><button type="button" onClick="{{ next }}" class="btn btn-primary">{{ t.toDocs }}</button></div>
</section>
</sc-if>

<sc-if value="{{ isDocs }}" hint-placeholder-val="{{ false }}">
<section class="panel">
<div class="panel-h"><h2>{{ t.docsTitle }}</h2><span class="meta">{{ stepOf }}</span></div>
<div class="panel-b stack" style="gap:14px">
<p style="margin:0;color:var(--ink-2);font-size:var(--t-sm)">{{ t.docsSub }}</p>
<sc-for list="{{ groups }}" as="g" hint-placeholder-count="2">
<div class="doc-group">
<div class="doc-group-h"><span class="doc-ic" data-s="review">{{ g.n }}</span><h3>{{ g.title }}</h3><span style="font-size:var(--t-xs);color:var(--ink-3)">{{ g.count }}</span></div>
<sc-for list="{{ g.items }}" as="d" hint-placeholder-count="4">
<div class="doc-row"><span class="doc-ic" data-s="{{ d.s }}">{{ d.g }}</span><div class="dn">{{ d.name }}<div class="sub">{{ d.sub }}</div></div><button type="button" class="btn" style="height:34px">{{ d.cta }}</button></div>
</sc-for>
</div>
</sc-for>
</div>
<div class="panel-f foot-actions"><button type="button" onClick="{{ back }}" class="btn">{{ t.back }}</button><button type="button" onClick="{{ next }}" class="btn btn-primary" disabled="{{ docsIncomplete }}">{{ t.toReview }}</button></div>
</section>
</sc-if>

<sc-if value="{{ isReview }}" hint-placeholder-val="{{ false }}">
<section class="panel">
<div class="panel-h"><h2>{{ t.reviewTitle }}</h2><span class="meta">{{ stepOf }}</span></div>
<div class="panel-b stack" style="gap:22px">
<div><div style="font-size:var(--t-xs);font-weight:600;color:var(--ink-3);margin-bottom:10px">{{ t.infoTitle }}</div>
<div class="rev"><sc-for list="{{ reviewInfo }}" as="r" hint-placeholder-count="4"><span class="k">{{ r.k }}</span><span>{{ r.v }}</span></sc-for></div></div>
<sc-for list="{{ groups }}" as="g" hint-placeholder-count="2">
<div><div style="font-size:var(--t-xs);font-weight:600;color:var(--ink-3);margin-bottom:10px">{{ g.title }}</div>
<div class="rev"><sc-for list="{{ g.items }}" as="d" hint-placeholder-count="4"><span class="k">{{ d.name }}</span><span style="display:flex;align-items:center;gap:8px"><span class="doc-ic" data-s="ok" style="width:20px;height:20px;font-size:11px">✓</span>{{ d.sub }}</span></sc-for></div></div>
</sc-for>
<div class="note"><span class="i">i</span><span>{{ t.reviewNote }}</span></div>
</div>
<div class="panel-f foot-actions"><button type="button" onClick="{{ back }}" class="btn">{{ t.edit }}</button><button type="button" onClick="{{ next }}" class="btn btn-primary btn-lg">{{ t.submit }}</button></div>
</section>
</sc-if>

<sc-if value="{{ isSent }}" hint-placeholder-val="{{ false }}">
<div class="status-hero">
<span class="big" style="background:var(--allowed-bg);color:var(--allowed-ink)">✓</span>
<div style="flex:1"><h1>{{ t.sentTitle }}</h1><p>{{ t.sentBody }}</p>
<div style="display:flex;gap:10px;margin-top:18px"><button type="button" class="btn btn-primary">{{ t.sentCta }}</button><button type="button" class="btn">{{ t.sentAlt }}</button></div></div>
</div>
</sc-if>

</div>
</div>'''

LOGIC = r'''
  L = {
    ar: { dir: 'rtl', short: 'ع', label: 'العربية',
      title: 'إعداد المستورد', sub: 'حساب واحد. صفة المستورد تُضاف إليه بعد المراجعة.', saved: 'محفوظ تلقائياً', stepOf: (i, n) => 'الخطوة ' + i + ' من ' + n,
      steps: ['الحساب', 'معلومات المستورد', 'الوثائق', 'المراجعة'], lockNote: 'الرحلات والطلب والسجلّات تُفتح بعد الموافقة.',
      role: 'إعداد المستورد', userRole: 'في طور الإعداد',
      infoTitle: 'معلومات المستورد', fullName: 'الاسم واللقب', fullNameV: 'سفيان بن عمارة', fullNameHint: 'كما في بطاقة المقاول الذاتي.', wilaya: 'الولاية', wl1: 'الجزائر', wl2: 'سطيف', wl3: 'وهران',
      catsLabel: 'ما تشتريه عادةً', cats: ['ألبسة نسائية', 'ألبسة رجالية', 'حقائب', 'أحذية', 'تجميل وعطور', 'ساعات', 'منزل'],
      destsLabel: 'وجهاتك المعتادة', dests: ['إسطنبول', 'دبي', 'قوانغتشو', 'غازي عنتاب', 'باريس', 'أخرى'], destsHint: 'أي وجهة في العالم. هذه للاقتراحات فقط.',
      later: 'احفظ وأكمل لاحقاً', toDocs: 'متابعة إلى الوثائق', back: 'رجوع', toReview: 'متابعة إلى المراجعة',
      docsTitle: 'الوثائق', docsSub: 'كل وثيقة على حدة. تبقى خاصّة ولا يراها أي مستخدم.',
      groups: [['هوية شخصية', [['بطاقة التعريف الوطنية', 'صورة الوجهين'], ['صورة حيّة', 'من الكاميرا مباشرة']]], ['أهلية الاستيراد', [['بطاقة المقاول الذاتي', 'ميدان الاستيراد المصغّر'], ['الرخصة العامة', 'وزارة التجارة الخارجية'], ['الرقم الجبائي', 'صورة'], ['الانتساب إلى CASNOS', 'صورة']]]],
      docCta: { todo: 'ارفع', ok: 'استبدل' }, docOk: 'مرفوعة', docTodo: 'لم تُرفع', countOf: (a, b) => a + ' من ' + b,
      reviewTitle: 'راجع قبل الإرسال', reviewInfo: [['الاسم', 'سفيان بن عمارة'], ['الولاية', 'الجزائر'], ['الفئات', 'ألبسة نسائية · حقائب · تجميل'], ['الوجهات', 'إسطنبول · دبي']],
      reviewNote: 'المراجعة عادةً خلال يوم عمل. نعلمك بالقرار أو بما يحتاج تصحيحاً.', edit: 'عدّل', submit: 'أرسل للمراجعة',
      sentTitle: 'وصلتنا وثائقك', sentBody: 'قيد المراجعة. سيصلك إشعار بالقرار. حتى ذلك الحين تقدر تراسل التجّار وتتصفّح السوق.', sentCta: 'تابع حالة التحقّق', sentAlt: 'إلى السوق'
    },
    fr: { dir: 'ltr', short: 'FR', label: 'Français',
      title: 'Installation importateur', sub: 'Un seul compte. Le rôle importateur s’y ajoute après examen.', saved: 'Enregistré automatiquement', stepOf: (i, n) => 'Étape ' + i + ' sur ' + n,
      steps: ['Compte', 'Informations importateur', 'Documents', 'Vérification'], lockNote: 'Voyages, demande et registres s’ouvrent après approbation.',
      role: 'Installation importateur', userRole: 'Installation en cours',
      infoTitle: 'Informations importateur', fullName: 'Nom et prénom', fullNameV: 'Sofiane Benamara', fullNameHint: 'Comme sur la carte d’auto-entrepreneur.', wilaya: 'Wilaya', wl1: 'Alger', wl2: 'Sétif', wl3: 'Oran',
      catsLabel: 'Ce que vous achetez habituellement', cats: ['Vêtements femme', 'Vêtements homme', 'Sacs', 'Chaussures', 'Beauté et parfums', 'Montres', 'Maison'],
      destsLabel: 'Vos destinations habituelles', dests: ['Istanbul', 'Dubaï', 'Guangzhou', 'Gaziantep', 'Paris', 'Autre'], destsHint: 'N’importe où dans le monde. Sert uniquement aux suggestions.',
      later: 'Enregistrer et finir plus tard', toDocs: 'Continuer vers les documents', back: 'Retour', toReview: 'Continuer vers la vérification',
      docsTitle: 'Documents', docsSub: 'Un par un. Ils restent privés et aucun utilisateur ne les voit.',
      groups: [['Identité personnelle', [['Carte d’identité nationale', 'Photo recto-verso'], ['Photo en direct', 'Depuis la caméra']]], ['Éligibilité importateur', [['Carte d’auto-entrepreneur', 'Activité importation de faible valeur'], ['Autorisation générale', 'Ministère du Commerce extérieur'], ['Numéro fiscal', 'Photo'], ['Affiliation CASNOS', 'Photo']]]],
      docCta: { todo: 'Déposer', ok: 'Remplacer' }, docOk: 'Déposé', docTodo: 'Non déposé', countOf: (a, b) => a + ' sur ' + b,
      reviewTitle: 'Vérifiez avant d’envoyer', reviewInfo: [['Nom', 'Sofiane Benamara'], ['Wilaya', 'Alger'], ['Catégories', 'Vêtements femme · Sacs · Beauté'], ['Destinations', 'Istanbul · Dubaï']],
      reviewNote: 'Examen en général sous un jour ouvré. Vous êtes notifié de la décision ou de ce qui manque.', edit: 'Modifier', submit: 'Envoyer pour examen',
      sentTitle: 'Documents reçus', sentBody: 'En cours d’examen. Vous recevrez la décision par notification. En attendant, vous pouvez écrire aux commerçants et parcourir la place.', sentCta: 'Suivre la vérification', sentAlt: 'Vers la place de marché'
    },
    en: { dir: 'ltr', short: 'EN', label: 'English',
      title: 'Importer setup', sub: 'One account. The importer role is added to it after review.', saved: 'Saved automatically', stepOf: (i, n) => 'Step ' + i + ' of ' + n,
      steps: ['Account', 'Importer information', 'Documents', 'Review'], lockNote: 'Trips, demand and records open after approval.',
      role: 'Importer setup', userRole: 'Setting up',
      infoTitle: 'Importer information', fullName: 'Full name', fullNameV: 'Sofiane Benamara', fullNameHint: 'As on the auto-entrepreneur card.', wilaya: 'Wilaya', wl1: 'Algiers', wl2: 'Sétif', wl3: 'Oran',
      catsLabel: 'What you usually buy', cats: ['Women’s clothing', 'Men’s clothing', 'Bags', 'Shoes', 'Beauty & perfume', 'Watches', 'Home'],
      destsLabel: 'Your usual destinations', dests: ['Istanbul', 'Dubai', 'Guangzhou', 'Gaziantep', 'Paris', 'Other'], destsHint: 'Anywhere in the world. Used for suggestions only.',
      later: 'Save and finish later', toDocs: 'Continue to documents', back: 'Back', toReview: 'Continue to review',
      docsTitle: 'Documents', docsSub: 'One at a time. They stay private and no user ever sees them.',
      groups: [['Personal identity', [['National ID card', 'Both sides'], ['Live photo', 'From the camera']]], ['Importer eligibility', [['Auto-entrepreneur card', 'Low-value import activity'], ['General authorisation', 'Ministry of Foreign Trade'], ['Tax number', 'Photo'], ['CASNOS affiliation', 'Photo']]]],
      docCta: { todo: 'Upload', ok: 'Replace' }, docOk: 'Uploaded', docTodo: 'Not uploaded', countOf: (a, b) => a + ' of ' + b,
      reviewTitle: 'Review before you submit', reviewInfo: [['Name', 'Sofiane Benamara'], ['Wilaya', 'Algiers'], ['Categories', 'Women’s clothing · Bags · Beauty'], ['Destinations', 'Istanbul · Dubai']],
      reviewNote: 'Review usually within one working day. You’re told the decision, or what needs fixing.', edit: 'Edit', submit: 'Submit for review',
      sentTitle: 'We’ve received your documents', sentBody: 'Under review. You’ll be notified of the decision. Meanwhile you can message traders and browse the marketplace.', sentCta: 'Follow verification', sentAlt: 'To the marketplace'
    }
  };
  VIEWS = ['info', 'docs', 'docsdone', 'review', 'sent'];
  VIEW_LABELS = { ar: ['المعلومات', 'الوثائق', 'الوثائق مكتملة', 'المراجعة', 'أُرسل'], fr: ['Informations', 'Documents', 'Documents complets', 'Vérification', 'Envoyé'], en: ['Information', 'Documents', 'Documents complete', 'Review', 'Sent'] };
  renderVals() {
    const lang = this.state.lang, t = this.L[lang], v = this.state.view;
    const idx = { info: 1, docs: 2, docsdone: 2, review: 3, sent: 3 }[v];
    const done = v === 'docsdone' || v === 'review' || v === 'sent';
    const order = ['info', 'docs', 'review', 'sent'];
    const cur = v === 'docsdone' ? 'docs' : v;
    const groups = t.groups.map(([title, items], gi) => {
      const rows = items.map(([name, sub], i) => { const ok = done || (gi === 0) || i < 1; return { name, sub: ok ? t.docOk + ' · ' + sub : sub, s: ok ? 'ok' : 'todo', g: ok ? '✓' : String(i + 1), cta: ok ? t.docCta.ok : t.docCta.todo }; });
      return { n: String(gi + 1), title, items: rows, count: t.countOf(rows.filter(r => r.s === 'ok').length, rows.length) };
    });
    return {
      rootRef: this.root, t, langs: this.langsFor(lang),
      sh: window.MaabarShell(lang, 'importer', 'ver', { role: t.role, userRole: t.userRole, held: ['importer', 'public'] }),
      stateLabel: ({ ar: 'الحالة', fr: 'État', en: 'State' })[lang], views: this.sw(this.VIEWS, 'view', this.VIEW_LABELS[lang]),
      steps: t.steps.map((label, i) => ({ label, n: String(i + 1), s: i < idx ? 'done' : i === idx ? 'now' : 'todo' })),
      stepOf: t.stepOf(idx + 1, 4),
      isInfo: v === 'info', isDocs: v === 'docs' || v === 'docsdone', isReview: v === 'review', isSent: v === 'sent',
      cats: t.cats.map((label, i) => ({ label, on: [0, 2, 4].includes(i) })), dests: t.dests.map((label, i) => ({ label, on: i < 2 })),
      groups, docsIncomplete: !done,
      reviewInfo: t.reviewInfo.map(([k, val]) => ({ k, v: val })),
      next: () => this.setState({ view: order[Math.min(order.indexOf(cur) + 1, 3)] }),
      back: () => this.setState({ view: order[Math.max(order.indexOf(cur) - 1, 0)] })
    };
  }
'''
build(dict(name='Importer Setup', w=1440, h=1100, css=CSS, state="view: 'docs'", template=app_page(INNER, bar=statebar()), logic=LOGIC))
