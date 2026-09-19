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
</div>
<div class="panel-f foot-actions"><button type="button" class="btn">{{ t.later }}</button><button type="button" onClick="{{ next }}" class="btn btn-primary">{{ t.toBiz }}</button></div>
</section>
</sc-if>

<sc-if value="{{ isBiz }}" hint-placeholder-val="{{ false }}">
<section class="panel">
<div class="panel-h"><h2>{{ t.bizTitle }}</h2><span class="meta">{{ stepOf }}</span></div>
<div class="panel-b form">
<div class="row">
<div><label class="fld" for="bn">{{ t.bizName }}</label><input id="bn" class="inp" value="{{ t.bizNameV }}"><div style="font-size:var(--t-xs);color:var(--ink-3);margin-top:6px">{{ t.bizNameHint }}</div></div>
<div><label class="fld" for="bk">{{ t.bizKind }}</label><select id="bk" class="inp"><option>{{ t.bk1 }}</option><option>{{ t.bk2 }}</option></select></div>
</div>
<div><label class="fld" for="ba">{{ t.bizAddr }}</label><input id="ba" class="inp" value="{{ t.bizAddrV }}"><div style="font-size:var(--t-xs);color:var(--ink-3);margin-top:6px">{{ t.bizAddrHint }}</div></div>
<div><span class="fld">{{ t.catsLabel }}</span><div class="chips"><sc-for list="{{ cats }}" as="c" hint-placeholder-count="7"><button type="button" class="chipb" aria-pressed="{{ c.on }}">{{ c.label }}</button></sc-for></div></div>
<div class="note"><span class="i">i</span><span>{{ t.rcNote }}</span></div>
</div>
<div class="panel-f foot-actions"><button type="button" onClick="{{ back }}" class="btn">{{ t.back }}</button><button type="button" onClick="{{ next }}" class="btn btn-primary">{{ t.toDocs }}</button></div>
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
<div class="rev"><sc-for list="{{ reviewInfo }}" as="r" hint-placeholder-count="2"><span class="k">{{ r.k }}</span><span>{{ r.v }}</span></sc-for></div></div>
<div><div style="font-size:var(--t-xs);font-weight:600;color:var(--ink-3);margin-bottom:10px">{{ t.bizTitle }}</div>
<div class="rev"><sc-for list="{{ reviewBiz }}" as="r" hint-placeholder-count="4"><span class="k">{{ r.k }}</span><span>{{ r.v }}</span></sc-for></div></div>
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
      title: 'إعداد التاجر', sub: 'حساب واحد. صفة التاجر تُضاف إليه بعد المراجعة.', saved: 'محفوظ تلقائياً', stepOf: (i, n) => 'الخطوة ' + i + ' من ' + n,
      steps: ['الحساب', 'أنت', 'نشاطك التجاري', 'الوثائق', 'المراجعة'], lockNote: 'المتجر العام وطلبات التوريد تُفتح بعد الموافقة. الاكتشاف والمراسلة متاحان الآن.',
      role: 'إعداد التاجر', userRole: 'في طور الإعداد',
      infoTitle: 'أنت', fullName: 'الاسم واللقب', fullNameV: 'نادية رحماني', fullNameHint: 'كما في بطاقة التعريف الوطنية.', wilaya: 'الولاية', wl1: 'قسنطينة', wl2: 'الجزائر', wl3: 'وهران',
      bizTitle: 'نشاطك التجاري', bizName: 'اسم النشاط', bizNameV: 'بوتيك نادية', bizNameHint: 'كما في السجل التجاري. يظهر في متجرك العام.', bizKind: 'الشكل القانوني', bk1: 'شخص طبيعي', bk2: 'شركة',
      bizAddr: 'عنوان النشاط', bizAddrV: 'شارع العربي بن مهيدي 14، قسنطينة', bizAddrHint: 'يظهر في ملف متجرك.',
      catsLabel: 'ما تبيعه', cats: ['ألبسة نسائية', 'ألبسة رجالية', 'حقائب', 'أحذية', 'تجميل وعطور', 'ساعات', 'منزل'],
      rcNote: 'السجل التجاري هو ما يفتح متجرك العام. صفة المستورد المصغّر وحدها لا تكفي.',
      later: 'احفظ وأكمل لاحقاً', toBiz: 'متابعة إلى نشاطك', toDocs: 'متابعة إلى الوثائق', back: 'رجوع', toReview: 'متابعة إلى المراجعة',
      docsTitle: 'الوثائق', docsSub: 'مجموعتان: هويتك أنت، وهوية نشاطك. تبقى خاصّة.',
      groups: [['هوية شخصية', [['بطاقة التعريف الوطنية', 'صورة الوجهين'], ['صورة حيّة', 'من الكاميرا مباشرة']]], ['هوية تجارية', [['السجل التجاري', 'مستخرج ساري'], ['الرقم الجبائي', 'صورة'], ['إثبات عنوان النشاط', 'فاتورة أو عقد']]]],
      docCta: { todo: 'ارفع', ok: 'استبدل' }, docOk: 'مرفوعة', docTodo: 'لم تُرفع', countOf: (a, b) => a + ' من ' + b,
      reviewTitle: 'راجع قبل الإرسال', reviewInfo: [['الاسم', 'نادية رحماني'], ['الولاية', 'قسنطينة']], reviewBiz: [['النشاط', 'بوتيك نادية · شخص طبيعي'], ['العنوان', 'شارع العربي بن مهيدي 14، قسنطينة'], ['الفئات', 'ألبسة نسائية · حقائب · عطور']],
      reviewNote: 'المراجعة عادةً خلال يوم عمل. نعلمك بالقرار أو بما يحتاج تصحيحاً.', edit: 'عدّل', submit: 'أرسل للمراجعة',
      sentTitle: 'وصلتنا وثائقك', sentBody: 'قيد المراجعة. حتى ذلك الحين تقدر تكتشف الرحلات وتراسل المستوردين.', sentCta: 'تابع حالة التحقّق', sentAlt: 'اكتشف الرحلات'
    },
    fr: { dir: 'ltr', short: 'FR', label: 'Français',
      title: 'Installation commerçant', sub: 'Un seul compte. Le rôle commerçant s’y ajoute après examen.', saved: 'Enregistré automatiquement', stepOf: (i, n) => 'Étape ' + i + ' sur ' + n,
      steps: ['Compte', 'Vous', 'Votre activité', 'Documents', 'Vérification'], lockNote: 'Boutique publique et demandes s’ouvrent après approbation. Découverte et messages sont disponibles.',
      role: 'Installation commerçant', userRole: 'Installation en cours',
      infoTitle: 'Vous', fullName: 'Nom et prénom', fullNameV: 'Nadia Rahmani', fullNameHint: 'Comme sur la carte d’identité nationale.', wilaya: 'Wilaya', wl1: 'Constantine', wl2: 'Alger', wl3: 'Oran',
      bizTitle: 'Votre activité', bizName: 'Nom de l’activité', bizNameV: 'Boutique Nadia', bizNameHint: 'Comme sur le registre du commerce. Figure sur votre boutique publique.', bizKind: 'Forme juridique', bk1: 'Personne physique', bk2: 'Société',
      bizAddr: 'Adresse de l’activité', bizAddrV: '14 rue Larbi Ben M’hidi, Constantine', bizAddrHint: 'Figure sur votre fiche boutique.',
      catsLabel: 'Ce que vous vendez', cats: ['Vêtements femme', 'Vêtements homme', 'Sacs', 'Chaussures', 'Beauté et parfums', 'Montres', 'Maison'],
      rcNote: 'Le registre du commerce est ce qui ouvre votre boutique publique. Le statut de micro-importateur seul ne suffit pas.',
      later: 'Enregistrer et finir plus tard', toBiz: 'Continuer vers votre activité', toDocs: 'Continuer vers les documents', back: 'Retour', toReview: 'Continuer vers la vérification',
      docsTitle: 'Documents', docsSub: 'Deux groupes : votre identité, et celle de votre activité. Ils restent privés.',
      groups: [['Identité personnelle', [['Carte d’identité nationale', 'Recto-verso'], ['Photo en direct', 'Depuis la caméra']]], ['Identité commerciale', [['Registre du commerce', 'Extrait en cours de validité'], ['Numéro fiscal', 'Photo'], ['Justificatif d’adresse', 'Facture ou bail']]]],
      docCta: { todo: 'Déposer', ok: 'Remplacer' }, docOk: 'Déposé', docTodo: 'Non déposé', countOf: (a, b) => a + ' sur ' + b,
      reviewTitle: 'Vérifiez avant d’envoyer', reviewInfo: [['Nom', 'Nadia Rahmani'], ['Wilaya', 'Constantine']], reviewBiz: [['Activité', 'Boutique Nadia · personne physique'], ['Adresse', '14 rue Larbi Ben M’hidi, Constantine'], ['Catégories', 'Vêtements femme · Sacs · Parfums']],
      reviewNote: 'Examen en général sous un jour ouvré. Vous êtes notifié de la décision ou de ce qui manque.', edit: 'Modifier', submit: 'Envoyer pour examen',
      sentTitle: 'Documents reçus', sentBody: 'En cours d’examen. En attendant, vous pouvez découvrir les voyages et écrire aux importateurs.', sentCta: 'Suivre la vérification', sentAlt: 'Découvrir les voyages'
    },
    en: { dir: 'ltr', short: 'EN', label: 'English',
      title: 'Trader setup', sub: 'One account. The trader role is added to it after review.', saved: 'Saved automatically', stepOf: (i, n) => 'Step ' + i + ' of ' + n,
      steps: ['Account', 'You', 'Your business', 'Documents', 'Review'], lockNote: 'Public shop and sourcing requests open after approval. Discovery and messaging are open now.',
      role: 'Trader setup', userRole: 'Setting up',
      infoTitle: 'You', fullName: 'Full name', fullNameV: 'Nadia Rahmani', fullNameHint: 'As on the national ID card.', wilaya: 'Wilaya', wl1: 'Constantine', wl2: 'Algiers', wl3: 'Oran',
      bizTitle: 'Your business', bizName: 'Business name', bizNameV: 'Boutique Nadia', bizNameHint: 'As on the commercial register. Shown on your public shop.', bizKind: 'Legal form', bk1: 'Sole trader', bk2: 'Company',
      bizAddr: 'Business address', bizAddrV: '14 Larbi Ben M’hidi Street, Constantine', bizAddrHint: 'Shown on your shop profile.',
      catsLabel: 'What you sell', cats: ['Women’s clothing', 'Men’s clothing', 'Bags', 'Shoes', 'Beauty & perfume', 'Watches', 'Home'],
      rcNote: 'The commercial register is what opens your public shop. Micro-importer status alone is not enough.',
      later: 'Save and finish later', toBiz: 'Continue to your business', toDocs: 'Continue to documents', back: 'Back', toReview: 'Continue to review',
      docsTitle: 'Documents', docsSub: 'Two groups: who you are, and what your business is. They stay private.',
      groups: [['Personal identity', [['National ID card', 'Both sides'], ['Live photo', 'From the camera']]], ['Business identity', [['Commercial register', 'Valid extract'], ['Tax number', 'Photo'], ['Proof of business address', 'Bill or lease']]]],
      docCta: { todo: 'Upload', ok: 'Replace' }, docOk: 'Uploaded', docTodo: 'Not uploaded', countOf: (a, b) => a + ' of ' + b,
      reviewTitle: 'Review before you submit', reviewInfo: [['Name', 'Nadia Rahmani'], ['Wilaya', 'Constantine']], reviewBiz: [['Business', 'Boutique Nadia · sole trader'], ['Address', '14 Larbi Ben M’hidi Street, Constantine'], ['Categories', 'Women’s clothing · Bags · Perfume']],
      reviewNote: 'Review usually within one working day. You’re told the decision, or what needs fixing.', edit: 'Edit', submit: 'Submit for review',
      sentTitle: 'We’ve received your documents', sentBody: 'Under review. Meanwhile you can discover trips and message importers.', sentCta: 'Follow verification', sentAlt: 'Discover trips'
    }
  };
  VIEWS = ['info', 'biz', 'docs', 'docsdone', 'review', 'sent'];
  VIEW_LABELS = { ar: ['أنت', 'نشاطك', 'الوثائق', 'الوثائق مكتملة', 'المراجعة', 'أُرسل'], fr: ['Vous', 'Activité', 'Documents', 'Documents complets', 'Vérification', 'Envoyé'], en: ['You', 'Business', 'Documents', 'Documents complete', 'Review', 'Sent'] };
  renderVals() {
    const lang = this.state.lang, t = this.L[lang], v = this.state.view;
    const idx = { info: 1, biz: 2, docs: 3, docsdone: 3, review: 4, sent: 4 }[v];
    const done = v === 'docsdone' || v === 'review' || v === 'sent';
    const order = ['info', 'biz', 'docs', 'review', 'sent'];
    const cur = v === 'docsdone' ? 'docs' : v;
    const groups = t.groups.map(([title, items], gi) => {
      const rows = items.map(([name, sub], i) => { const ok = done || gi === 0; return { name, sub: ok ? t.docOk + ' · ' + sub : sub, s: ok ? 'ok' : 'todo', g: ok ? '✓' : String(i + 1), cta: ok ? t.docCta.ok : t.docCta.todo }; });
      return { n: String(gi + 1), title, items: rows, count: t.countOf(rows.filter(r => r.s === 'ok').length, rows.length) };
    });
    return {
      rootRef: this.root, t, langs: this.langsFor(lang),
      sh: window.MaabarShell(lang, 'trader', 'ver', { role: t.role, userRole: t.userRole, userName: t.fullNameV, userInitials: lang === 'ar' ? 'ن ر' : 'NR', held: ['trader', 'public'] }),
      stateLabel: ({ ar: 'الحالة', fr: 'État', en: 'State' })[lang], views: this.sw(this.VIEWS, 'view', this.VIEW_LABELS[lang]),
      steps: t.steps.map((label, i) => ({ label, n: String(i + 1), s: i < idx ? 'done' : i === idx ? 'now' : 'todo' })),
      stepOf: t.stepOf(idx + 1, 5),
      isInfo: v === 'info', isBiz: v === 'biz', isDocs: v === 'docs' || v === 'docsdone', isReview: v === 'review', isSent: v === 'sent',
      cats: t.cats.map((label, i) => ({ label, on: [0, 2, 4].includes(i) })),
      groups, docsIncomplete: !done,
      reviewInfo: t.reviewInfo.map(([k, val]) => ({ k, v: val })), reviewBiz: t.reviewBiz.map(([k, val]) => ({ k, v: val })),
      next: () => this.setState({ view: order[Math.min(order.indexOf(cur) + 1, 4)] }),
      back: () => this.setState({ view: order[Math.max(order.indexOf(cur) - 1, 0)] })
    };
  }
'''
build(dict(name='Trader Setup', w=1440, h=1100, css=CSS, state="view: 'biz'", template=app_page(INNER, bar=statebar()), logic=LOGIC))
