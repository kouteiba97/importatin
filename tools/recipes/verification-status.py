import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from newscreen import build, app_page, statebar

CSS = '''
.tl{display:flex;flex-direction:column}
.tl .ev{display:flex;gap:12px;padding:10px 0;border-top:1px solid var(--rule-faint);font-size:var(--t-sm)}
.tl .ev:first-child{border-top:0;padding-top:0}
.tl .dot{flex:none;width:10px;height:10px;border-radius:50%;margin-top:6px;background:var(--rule-strong)}
.tl .dot[data-on="true"]{background:var(--brand)}
.tl .when{color:var(--ink-3);font-size:var(--t-xs);margin-top:2px}
.fix{padding:14px 16px;border:1px solid var(--conditional);border-radius:var(--r);background:var(--conditional-bg)}
.fix .fh{display:flex;gap:10px;align-items:center;font-weight:600;margin-bottom:6px}
.fix .fr{font-size:var(--t-sm);color:var(--ink-2)}
.fix .fr b{color:var(--ink);font-weight:600}
.open-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid var(--rule-faint);font-size:var(--t-sm)}
.open-row:first-child{border-top:0}
.open-row .mk{flex:none;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;font-size:11px;font-weight:600}
.welcome{padding:32px;border-radius:var(--r-lg);background:var(--ink);color:#fff;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:24px;align-items:center}
.welcome .k{font-size:var(--t-xs);font-weight:600;letter-spacing:.08em;text-transform:uppercase;opacity:.75;margin-bottom:8px}
[lang="ar"] .welcome .k{letter-spacing:0;text-transform:none}
.welcome h2{margin:0 0 8px;font-size:28px;font-weight:600}
.welcome p{margin:0;color:oklch(0.85 0.01 257);max-width:56ch;line-height:1.65}
.frozen{display:flex;gap:10px;padding:10px 0;border-top:1px solid var(--rule-faint);font-size:var(--t-sm);align-items:center}
.frozen:first-child{border-top:0}
'''

INNER = '''<div class="page-head"><div class="grow"><h1>{{ t.title }}</h1></div>
<nav class="tabs-h" style="margin:0" aria-label="{{ t.roleLabel }}"><sc-for list="{{ roles }}" as="r" hint-placeholder-count="2"><button type="button" onClick="{{ r.pick }}" aria-current="{{ r.on }}" class="tab-h">{{ r.label }}</button></sc-for></nav>
</div>

<sc-if value="{{ isApproved }}" hint-placeholder-val="{{ false }}">
<div class="stack">
<div class="status-hero">
<span class="big" style="background:var(--allowed-bg);color:var(--allowed-ink)">✓</span>
<div style="flex:1"><h1>{{ s.title }}</h1><p>{{ s.body }}</p></div>
</div>
<div class="welcome">
<div><div class="k">{{ wk }}</div><h2>{{ wTitle }}</h2><p>{{ wBody }}</p></div>
<button type="button" class="btn btn-lg" style="background:#fff;color:var(--ink);border-color:#fff">{{ s.cta }}</button>
</div>
<div class="cols cols-2">
<section class="panel"><div class="panel-h"><h2>{{ t.nowOpen }}</h2></div><div class="panel-b">
<sc-for list="{{ opens }}" as="o" hint-placeholder-count="4"><div class="open-row"><span class="mk" style="background:var(--allowed-bg);color:var(--allowed-ink)">✓</span><span>{{ o }}</span></div></sc-for>
</div></section>
<section class="panel"><div class="panel-h"><h2>{{ t.docsTitle }}</h2><span class="meta">{{ s.validity }}</span></div><div class="panel-b">
<sc-for list="{{ docs }}" as="d" hint-placeholder-count="6"><div class="open-row"><span class="doc-ic" data-s="{{ d.s }}" style="width:22px;height:22px;font-size:11px">{{ d.g }}</span><span style="flex:1">{{ d.name }}</span><span style="color:var(--ink-3);font-size:var(--t-xs)">{{ d.st }}</span></div></sc-for>
</div></section>
</div>
</div>
</sc-if>

<sc-if value="{{ isNotApproved }}" hint-placeholder-val="{{ true }}">
<div class="split">
<div class="stack">
<div class="status-hero">
<span class="big" style="background:{{ s.bg }};color:{{ s.fg }}">{{ s.glyph }}</span>
<div style="flex:1"><h1>{{ s.title }}</h1><p>{{ s.body }}</p>
<div style="display:flex;gap:10px;margin-top:18px"><button type="button" class="btn btn-primary">{{ s.cta }}</button><sc-if value="{{ s.hasAlt }}" hint-placeholder-val="{{ true }}"><button type="button" class="btn">{{ s.alt }}</button></sc-if></div></div>
</div>

<sc-if value="{{ isFix }}" hint-placeholder-val="{{ false }}">
<section class="panel"><div class="panel-h"><h2>{{ t.fixTitle }}</h2><span class="meta">{{ t.fixKeep }}</span></div><div class="panel-b stack" style="gap:12px">
<sc-for list="{{ fixes }}" as="f" hint-placeholder-count="2">
<div class="fix"><div class="fh"><span class="doc-ic" data-s="fix" style="width:24px;height:24px;font-size:12px">{{ f.n }}</span>{{ f.name }}</div><div class="fr"><b>{{ t.reason }}</b> {{ f.reason }}</div><div class="fr"><b>{{ t.todo }}</b> {{ f.fix }}</div>
<div style="margin-top:10px"><button type="button" class="btn" style="height:34px">{{ t.reshoot }}</button></div></div>
</sc-for>
</div></section>
</sc-if>

<sc-if value="{{ isExpired }}" hint-placeholder-val="{{ false }}">
<section class="panel"><div class="panel-h"><h2>{{ t.frozenTitle }}</h2></div><div class="panel-b">
<sc-for list="{{ frozen }}" as="f" hint-placeholder-count="3"><div class="frozen"><span class="mk doc-ic" data-s="{{ f.s }}" style="width:22px;height:22px;font-size:11px">{{ f.g }}</span><span style="flex:1">{{ f.label }}</span><span style="font-size:var(--t-xs);color:var(--ink-3)">{{ f.st }}</span></div></sc-for>
</div></section>
</sc-if>

<section class="panel"><div class="panel-h"><h2>{{ t.docsTitle }}</h2><span class="meta">{{ docCount }}</span></div><div class="panel-b">
<sc-for list="{{ docs }}" as="d" hint-placeholder-count="6"><div class="open-row"><span class="doc-ic" data-s="{{ d.s }}" style="width:22px;height:22px;font-size:11px">{{ d.g }}</span><span style="flex:1">{{ d.name }}</span><span style="color:var(--ink-3);font-size:var(--t-xs)">{{ d.st }}</span></div></sc-for>
</div></section>
</div>

<aside class="stack sticky">
<section class="panel"><div class="panel-h"><h2>{{ t.soFar }}</h2></div><div class="panel-b tl">
<sc-for list="{{ timeline }}" as="e" hint-placeholder-count="4"><div class="ev"><span class="dot" data-on="{{ e.on }}"></span><div><div>{{ e.label }}</div><div class="when">{{ e.when }}</div></div></div></sc-for>
</div></section>
<section class="panel"><div class="panel-h"><h2>{{ t.nowOpen }}</h2></div><div class="panel-b">
<sc-for list="{{ opens }}" as="o" hint-placeholder-count="3"><div class="open-row"><span class="mk" style="background:var(--allowed-bg);color:var(--allowed-ink)">✓</span><span>{{ o }}</span></div></sc-for>
<sc-for list="{{ locks }}" as="o" hint-placeholder-count="3"><div class="open-row" style="color:var(--ink-3)"><span class="mk" style="background:var(--surface-2)">·</span><span>{{ o }}</span></div></sc-for>
</div></section>
<div class="lock-note"><span class="lk" aria-hidden="true">●</span><span class="grow">{{ t.support }}</span><button type="button" class="link">{{ t.contact }}</button></div>
</aside>
</div>
</sc-if>'''

LOGIC = r'''
  L = {
    ar: { dir: 'rtl', short: 'ع', label: 'العربية',
      title: 'حالة التحقّق', roleLabel: 'الدور', roles: ['مستورد', 'تاجر'],
      nowOpen: 'متاح الآن', docsTitle: 'الوثائق', soFar: 'ما حدث حتى الآن', support: 'سؤال عن ملفك؟', contact: 'راسل الدعم',
      fixTitle: 'ما يحتاج تصحيحاً', fixKeep: 'مكانك في الطابور محفوظ', reason: 'السبب:', todo: 'المطلوب:', reshoot: 'صوّرها من جديد',
      frozenTitle: 'ما تأثّر بانتهاء الرخصة', wk: 'فضاؤك جاهز',
      welcome: { importer: ['أهلاً بك في مَعْبَر · الاستيراد', 'الرحلات، الطلب المُتحقَّق، السجلّات والوسم. كلّها مفتوحة الآن.'], trader: ['أهلاً بك في مَعْبَر · التجارة', 'الاكتشاف، طلبات التوريد، ومتجرك العام. كلّها مفتوحة الآن.'] },
      states: {
        pending: ['وصلتنا وثائقك', 'قيد المراجعة. عادةً خلال يوم عمل. سيصلك إشعار بالقرار.', 'إلى ما هو متاح الآن', 'إلى السوق', '◷'],
        review: ['قيد المراجعة', 'فريق الثقة يراجع وثائقك الآن.', 'إلى ما هو متاح الآن', 'إلى السوق', '◷'],
        fix: ['التحقّق يحتاج انتباهك', 'وثيقتان تحتاجان تصحيحاً. صحّحهما وتكمل من حيث توقّفت — حسابك لم يُرفض.', 'صحّح الوثائق', 'لاحقاً', '!'],
        approved: { importer: ['صرت مستورداً مُتحقَّقاً', 'رخصتك سارية حتى جوان 2027. سننبّهك قبل شهر من انتهائها.', 'افتح مَعْبَر · الاستيراد', 'سارية حتى جوان 2027'], trader: ['صرت تاجراً مُتحقَّقاً', 'سجلّك التجاري مُتحقَّق منه. متجرك العام يمكن أن يُفتح الآن.', 'افتح مَعْبَر · التجارة', 'سجل تجاري مُتحقَّق'] },
        expired: ['انتهت صلاحية رخصتك العامة', 'انتهت في 30 جوان 2026. ارفع الرخصة الجديدة ليعود كل شيء كما كان.', 'ارفع الرخصة الجديدة', '', '!'],
        rejected: ['لم تتمّ الموافقة هذه المرّة', 'الاسم على الرخصة لا يطابق بطاقة التعريف. لك أن تعيد التقديم بعد التصحيح.', 'أعد التقديم', 'راسل الدعم', '×']
      },
      docs: { importer: ['بطاقة التعريف الوطنية', 'صورة حيّة', 'بطاقة المقاول الذاتي', 'الرخصة العامة', 'الرقم الجبائي', 'الانتساب إلى CASNOS'], trader: ['بطاقة التعريف الوطنية', 'صورة حيّة', 'السجل التجاري', 'الرقم الجبائي', 'عنوان النشاط'] },
      dst: { ok: 'مقبولة', review: 'قيد المراجعة', fix: 'تحتاج تصحيحاً', exp: 'منتهية', todo: 'لم تُرفع' }, countOf: (a, b) => a + ' من ' + b + ' مقبولة',
      fixes: [['بطاقة التعريف الوطنية', 'الزاوية السفلية خارج الصورة، وتاريخ الانتهاء غير ظاهر.', 'صوّر من فوق الوثيقة مباشرة.'], ['الرخصة العامة', 'انعكاس ضوء على الختم.', 'أطفئ الفلاش.']],
      frozen: [['نشر رحلة جديدة', 'موقوف', 'exp'], ['استقبال طلبات جديدة', 'موقوف', 'exp'], ['إتمام الالتزامات الجارية', 'متاح', 'ok']],
      opens: { importer: ['مراسلة التجّار', 'تصفّح السوق', 'ملخّص لوحة الطلب'], trader: ['اكتشاف الرحلات', 'مراسلة المستوردين', 'تصفّح السوق'] },
      locks: { importer: ['نشر رحلة', 'استقبال الطلبات', 'السجلّات والوسم'], trader: ['طلب توريد', 'المتجر العام', 'الالتزامات'] },
      opensApproved: { importer: ['نشر رحلة واستقبال الطلبات', 'لوحة الطلب كاملة', 'عدّادات القيمة والوزن والحجم', 'الدفتر المبسّط ووسم المادة 14'], trader: ['عرض منتجات للجمهور', 'ملف متجر عام', 'طلبات التوريد', 'اكتشاف المستوردين'] },
      tl: { pending: [['أرسلت وثائقك', 'اليوم 14:20', true], ['في طابور المراجعة', 'اليوم 14:20', true], ['القرار', 'خلال يوم عمل', false]], review: [['أرسلت وثائقك', 'أمس 14:20', true], ['بدأت المراجعة', 'اليوم 09:05', true], ['القرار', 'قريباً', false]], fix: [['أرسلت وثائقك', 'أمس', true], ['طُلب تصحيح وثيقتين', 'اليوم 09:40', true], ['إعادة الإرسال', 'بانتظارك', false]], expired: [['رخصتك انتهت', '30 جوان 2026', true], ['نُبّهت قبل 34 يوماً', '27 ماي', true], ['الرخصة الجديدة', 'بانتظارك', false]], rejected: [['أرسلت وثائقك', 'قبل يومين', true], ['القرار: غير مقبول', 'اليوم', true], ['إعادة التقديم', 'متاحة', false]] }
    },
    fr: { dir: 'ltr', short: 'FR', label: 'Français',
      title: 'État de la vérification', roleLabel: 'Rôle', roles: ['Importateur', 'Commerçant'],
      nowOpen: 'Disponible maintenant', docsTitle: 'Documents', soFar: 'Jusqu’ici', support: 'Une question sur votre dossier ?', contact: 'Écrire au support',
      fixTitle: 'À corriger', fixKeep: 'Votre place dans la file est conservée', reason: 'Motif :', todo: 'À faire :', reshoot: 'Reprendre la photo',
      frozenTitle: 'Effets de l’expiration', wk: 'Votre espace est prêt',
      welcome: { importer: ['Bienvenue dans Maabar Import', 'Voyages, demande vérifiée, registres et étiquettes. Tout est ouvert.'], trader: ['Bienvenue dans Maabar Trade', 'Découverte, demandes d’approvisionnement et votre boutique publique. Tout est ouvert.'] },
      states: {
        pending: ['Documents reçus', 'En cours d’examen. En général sous un jour ouvré. Vous serez notifié de la décision.', 'Voir ce qui est disponible', 'Vers la place de marché', '◷'],
        review: ['En cours d’examen', 'L’équipe confiance examine vos documents.', 'Voir ce qui est disponible', 'Vers la place de marché', '◷'],
        fix: ['Vérification à corriger', 'Deux documents sont à corriger. Corrigez-les et reprenez où vous en étiez — votre compte n’est pas refusé.', 'Corriger les documents', 'Plus tard', '!'],
        approved: { importer: ['Vous êtes importateur vérifié', 'Autorisation valide jusqu’en juin 2027. Nous vous prévenons un mois avant.', 'Ouvrir Maabar Import', 'Valide jusqu’en juin 2027'], trader: ['Vous êtes commerçant vérifié', 'Registre du commerce vérifié. Votre boutique publique peut ouvrir.', 'Ouvrir Maabar Trade', 'Registre vérifié'] },
        expired: ['Votre autorisation générale a expiré', 'Expirée le 30 juin 2026. Déposez la nouvelle autorisation pour tout rétablir.', 'Déposer la nouvelle autorisation', '', '!'],
        rejected: ['Non approuvé cette fois', 'Le nom sur l’autorisation ne correspond pas à la carte d’identité. Vous pouvez soumettre à nouveau après correction.', 'Soumettre à nouveau', 'Écrire au support', '×']
      },
      docs: { importer: ['Carte d’identité nationale', 'Photo en direct', 'Carte d’auto-entrepreneur', 'Autorisation générale', 'Numéro fiscal', 'Affiliation CASNOS'], trader: ['Carte d’identité nationale', 'Photo en direct', 'Registre du commerce', 'Numéro fiscal', 'Adresse de l’activité'] },
      dst: { ok: 'Acceptée', review: 'En examen', fix: 'À corriger', exp: 'Expirée', todo: 'Non déposée' }, countOf: (a, b) => a + ' sur ' + b + ' acceptés',
      fixes: [['Carte d’identité nationale', 'Coin inférieur hors cadre, date d’expiration invisible.', 'Photographiez directement du dessus.'], ['Autorisation générale', 'Reflet sur le cachet.', 'Éteignez le flash.']],
      frozen: [['Publier un nouveau voyage', 'Suspendu', 'exp'], ['Recevoir de nouvelles demandes', 'Suspendu', 'exp'], ['Terminer les engagements en cours', 'Disponible', 'ok']],
      opens: { importer: ['Écrire aux commerçants', 'Parcourir la place', 'Résumé du tableau de la demande'], trader: ['Découvrir les voyages', 'Écrire aux importateurs', 'Parcourir la place'] },
      locks: { importer: ['Publier un voyage', 'Recevoir des demandes', 'Registres et étiquettes'], trader: ['Demande d’approvisionnement', 'Boutique publique', 'Engagements'] },
      opensApproved: { importer: ['Publier un voyage et recevoir des demandes', 'Tableau de la demande complet', 'Compteurs valeur, poids, volume', 'Registre simplifié et étiquette art. 14'], trader: ['Vendre au public', 'Fiche boutique publique', 'Demandes d’approvisionnement', 'Découverte des importateurs'] },
      tl: { pending: [['Documents envoyés', 'Aujourd’hui 14:20', true], ['Dans la file d’examen', 'Aujourd’hui 14:20', true], ['Décision', 'Sous un jour ouvré', false]], review: [['Documents envoyés', 'Hier 14:20', true], ['Examen commencé', 'Aujourd’hui 09:05', true], ['Décision', 'Bientôt', false]], fix: [['Documents envoyés', 'Hier', true], ['Correction de deux documents demandée', 'Aujourd’hui 09:40', true], ['Nouvel envoi', 'À vous', false]], expired: [['Autorisation expirée', '30 juin 2026', true], ['Prévenu 34 jours avant', '27 mai', true], ['Nouvelle autorisation', 'À vous', false]], rejected: [['Documents envoyés', 'Il y a 2 jours', true], ['Décision : non approuvé', 'Aujourd’hui', true], ['Nouvelle soumission', 'Possible', false]] }
    },
    en: { dir: 'ltr', short: 'EN', label: 'English',
      title: 'Verification status', roleLabel: 'Role', roles: ['Importer', 'Trader'],
      nowOpen: 'Open now', docsTitle: 'Documents', soFar: 'So far', support: 'A question about your file?', contact: 'Contact support',
      fixTitle: 'Needs correction', fixKeep: 'Your place in the queue is kept', reason: 'Reason:', todo: 'To do:', reshoot: 'Photograph again',
      frozenTitle: 'What the expiry affects', wk: 'Your workspace is ready',
      welcome: { importer: ['Welcome to Maabar Import', 'Trips, verified demand, records and labels. All open now.'], trader: ['Welcome to Maabar Trade', 'Discovery, sourcing requests and your public shop. All open now.'] },
      states: {
        pending: ['We’ve received your documents', 'Under review. Usually within one working day. You’ll be notified of the decision.', 'See what’s open now', 'To the marketplace', '◷'],
        review: ['Under review', 'The trust team is reviewing your documents.', 'See what’s open now', 'To the marketplace', '◷'],
        fix: ['Verification needs attention', 'Two documents need correction. Fix them and continue where you left off — your account is not rejected.', 'Correct documents', 'Later', '!'],
        approved: { importer: ['You’re a verified importer', 'Authorisation valid until June 2027. We’ll remind you a month before.', 'Open Maabar Import', 'Valid until June 2027'], trader: ['You’re a verified trader', 'Commercial register verified. Your public shop can open now.', 'Open Maabar Trade', 'Register verified'] },
        expired: ['Your general authorisation has expired', 'Expired on 30 June 2026. Upload the new authorisation to restore everything.', 'Upload the new authorisation', '', '!'],
        rejected: ['Not approved this time', 'The name on the authorisation doesn’t match the ID card. You can resubmit after correcting it.', 'Resubmit', 'Contact support', '×']
      },
      docs: { importer: ['National ID card', 'Live photo', 'Auto-entrepreneur card', 'General authorisation', 'Tax number', 'CASNOS affiliation'], trader: ['National ID card', 'Live photo', 'Commercial register', 'Tax number', 'Business address'] },
      dst: { ok: 'Accepted', review: 'Under review', fix: 'Needs correction', exp: 'Expired', todo: 'Not uploaded' }, countOf: (a, b) => a + ' of ' + b + ' accepted',
      fixes: [['National ID card', 'Bottom corner cut off, expiry date not visible.', 'Photograph from directly above.'], ['General authorisation', 'Glare on the stamp.', 'Turn off the flash.']],
      frozen: [['Publish a new trip', 'Paused', 'exp'], ['Receive new requests', 'Paused', 'exp'], ['Complete existing commitments', 'Open', 'ok']],
      opens: { importer: ['Message traders', 'Browse the marketplace', 'Demand board summary'], trader: ['Discover trips', 'Message importers', 'Browse the marketplace'] },
      locks: { importer: ['Publish a trip', 'Receive requests', 'Records and labels'], trader: ['Sourcing requests', 'Public shop', 'Commitments'] },
      opensApproved: { importer: ['Publish trips and receive requests', 'The full demand board', 'Value, weight and volume meters', 'Simplified ledger and Article 14 label'], trader: ['List products to the public', 'Public shop profile', 'Sourcing requests', 'Importer discovery'] },
      tl: { pending: [['Documents sent', 'Today 14:20', true], ['In the review queue', 'Today 14:20', true], ['Decision', 'Within one working day', false]], review: [['Documents sent', 'Yesterday 14:20', true], ['Review started', 'Today 09:05', true], ['Decision', 'Soon', false]], fix: [['Documents sent', 'Yesterday', true], ['Correction of two documents requested', 'Today 09:40', true], ['Resubmission', 'Waiting on you', false]], expired: [['Authorisation expired', '30 June 2026', true], ['Notified 34 days before', '27 May', true], ['New authorisation', 'Waiting on you', false]], rejected: [['Documents sent', '2 days ago', true], ['Decision: not approved', 'Today', true], ['Resubmission', 'Available', false]] }
    }
  };
  VIEWS = ['pending', 'review', 'fix', 'approved', 'expired', 'rejected'];
  VIEW_LABELS = { ar: ['أُرسل', 'قيد المراجعة', 'يحتاج تصحيحاً', 'تمّت الموافقة', 'رخصة منتهية', 'غير مقبول'], fr: ['Envoyé', 'En examen', 'À corriger', 'Approuvé', 'Expiré', 'Refusé'], en: ['Submitted', 'Under review', 'Needs correction', 'Approved', 'Expired', 'Rejected'] };
  renderVals() {
    const lang = this.state.lang, t = this.L[lang], v = this.state.view, role = this.state.role;
    const roleKey = role === 'importer' ? 'importer' : 'trader';
    const DOC_STATES = { pending: 'review', review: 'review', fix: ['fix', 'ok', 'ok', 'fix', 'ok', 'ok'], approved: 'ok', expired: ['ok', 'ok', 'ok', 'exp', 'ok', 'ok'], rejected: ['ok', 'ok', 'ok', 'fix', 'ok', 'ok'] }[v];
    const GL = { ok: '✓', review: '◷', fix: '!', exp: '!', todo: '·' };
    const docs = t.docs[roleKey].map((name, i) => { const s = Array.isArray(DOC_STATES) ? DOC_STATES[i] || 'ok' : DOC_STATES; return { name, s, g: GL[s], st: t.dst[s] }; });
    const st = t.states[v];
    const isApproved = v === 'approved';
    const s = isApproved ? { title: st[roleKey][0], body: st[roleKey][1], cta: st[roleKey][2], validity: st[roleKey][3] }
      : { title: st[0], body: st[1], cta: st[2], alt: st[3], hasAlt: !!st[3], glyph: st[4],
          bg: v === 'fix' || v === 'expired' ? 'var(--conditional-bg)' : v === 'rejected' ? 'var(--prohibited-bg)' : 'var(--neutral-bg)',
          fg: v === 'fix' || v === 'expired' ? 'var(--conditional-ink)' : v === 'rejected' ? 'var(--prohibited-ink)' : 'var(--ink-2)' };
    const roleLabel = { ar: { pending: 'التحقّق قيد المراجعة', fix: 'يحتاج تصحيحاً', approved: roleKey === 'importer' ? 'مستورد مُتحقَّق' : 'تاجر مُتحقَّق', expired: 'الرخصة منتهية' }, fr: { pending: 'Vérification en cours', fix: 'À corriger', approved: roleKey === 'importer' ? 'Importateur vérifié' : 'Commerçant vérifié', expired: 'Autorisation expirée' }, en: { pending: 'Verification pending', fix: 'Needs correction', approved: roleKey === 'importer' ? 'Verified importer' : 'Verified trader', expired: 'Authorisation expired' } }[lang];
    const ur = roleLabel[v] || roleLabel.pending;
    return {
      rootRef: this.root, t, langs: this.langsFor(lang),
      sh: window.MaabarShell(lang, roleKey, 'ver', { userRole: ur, held: [roleKey, 'public'] }),
      stateLabel: ({ ar: 'الحالة', fr: 'État', en: 'State' })[lang], views: this.sw(this.VIEWS, 'view', this.VIEW_LABELS[lang]),
      roles: ['importer', 'trader'].map((id, i) => ({ label: t.roles[i], on: role === id, pick: () => this.setState({ role: id }) })),
      isApproved, isNotApproved: !isApproved, isFix: v === 'fix', isExpired: v === 'expired', s,
      wk: t.wk, wTitle: t.welcome[roleKey][0], wBody: t.welcome[roleKey][1],
      docs, docCount: t.countOf(docs.filter(d => d.s === 'ok').length, docs.length),
      fixes: t.fixes.map(([name, reason, fix], i) => ({ n: String(i + 1), name, reason, fix })),
      frozen: t.frozen.map(([label, stl, ss]) => ({ label, st: stl, s: ss, g: GL[ss] })),
      opens: isApproved ? t.opensApproved[roleKey] : t.opens[roleKey], locks: t.locks[roleKey],
      timeline: (t.tl[v] || t.tl.pending).map(([label, when, on]) => ({ label, when, on }))
    };
  }
'''
build(dict(name='Verification Status', w=1440, h=1000, css=CSS, state="view: 'fix', role: 'importer'", template=app_page(INNER, bar=statebar()), logic=LOGIC))
