import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from newscreen import build, site_page, statebar

CSS = '''
.hero{display:grid;grid-template-columns:minmax(0,1fr) 420px;gap:48px;align-items:center;padding:56px 0 48px}
.hero h1{margin:0 0 14px;font-size:40px;font-weight:600;line-height:1.2;text-wrap:balance}
.hero .lede{margin:0 0 26px;font-size:18px;line-height:1.65;color:var(--ink-2);max-width:54ch}
.hero .ctas{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.kicker{display:inline-flex;align-items:center;gap:8px;font-size:var(--t-xs);font-weight:600;letter-spacing:.06em;text-transform:uppercase;margin-bottom:14px}
[lang="ar"] .kicker{letter-spacing:0;text-transform:none}
.kicker i{width:8px;height:8px;border-radius:50%}
.vis{border:1px solid var(--rule);border-radius:var(--r-lg);background:var(--surface);box-shadow:var(--e2);overflow:hidden}
.vis .bar{display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid var(--rule-faint);background:var(--surface-2);font-size:var(--t-xs);color:var(--ink-3)}
.vis .bar i{width:9px;height:9px;border-radius:50%;background:var(--rule-strong)}
.meter{padding:14px 16px;border-top:1px solid var(--rule-faint)}
.meter .k{display:flex;justify-content:space-between;font-size:var(--t-sm);margin-bottom:7px}
.meter .tr{height:7px;border-radius:4px;background:var(--surface-2);overflow:hidden}
.meter .tr i{display:block;height:100%;background:var(--brand)}
.sec{padding:40px 0;border-top:1px solid var(--rule)}
.sec h2{margin:0 0 6px;font-size:26px;font-weight:600}
.sec .sub{margin:0 0 24px;color:var(--ink-2);font-size:var(--t-body)}
.g3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
.g4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}
.card{padding:20px;border:1px solid var(--rule);border-radius:var(--r-lg);background:var(--surface)}
.card h3{margin:0 0 6px;font-size:var(--t-h3);font-weight:600}
.card p{margin:0;font-size:var(--t-sm);color:var(--ink-2);line-height:1.6}
.stepn{width:28px;height:28px;border-radius:50%;background:var(--brand-bg);color:var(--brand-ink);display:grid;place-items:center;font-size:13px;font-weight:600;margin-bottom:12px}
.req{display:flex;gap:12px;align-items:flex-start;padding:14px 0;border-top:1px solid var(--rule-faint)}
.req:first-child{border-top:0;padding-top:0}
.req .ic{flex:none;width:32px;height:32px;border-radius:var(--r-sm);background:var(--surface-2);display:grid;place-items:center;color:var(--ink-2)}
.req .t{font-size:var(--t-body);font-weight:500}
.req .d{font-size:var(--t-sm);color:var(--ink-2);margin-top:2px}
.nots{display:flex;gap:8px;flex-wrap:wrap}
.nots span{height:32px;padding:0 12px;border:1px solid var(--rule-strong);border-radius:var(--r-pill);display:inline-flex;align-items:center;font-size:var(--t-sm);color:var(--ink-2)}
.cta-band{margin:8px 0 48px;padding:32px;border-radius:var(--r-lg);background:var(--ink);color:#fff;display:flex;align-items:center;gap:24px}
.cta-band h2{margin:0 0 6px;font-size:24px;font-weight:600}
.cta-band p{margin:0;color:oklch(0.85 0.01 257)}
.cta-band .grow{flex:1}
.becoming{display:flex;align-items:center;gap:14px;padding:16px 20px;border:1px solid var(--rule);border-radius:var(--r-lg);background:var(--surface);margin-bottom:8px}
'''

INNER = '''<div class="container">

<sc-if value="{{ isMember }}" hint-placeholder-val="{{ false }}">
<div class="becoming">
<span class="av" style="width:38px;height:38px;font-size:12px;background:var(--role-importer-bg);color:var(--role-importer-ink)">{{ t.memberInitials }}</span>
<div style="flex:1"><div style="font-weight:600">{{ t.memberTitle }}</div><div style="font-size:var(--t-sm);color:var(--ink-2)">{{ t.memberSub }}</div></div>
<button type="button" class="btn">{{ t.memberBack }}</button>
</div>
</sc-if>

<section class="hero">
<div>
<div class="kicker" style="color:var(--role-trader-ink)"><i style="background:var(--role-trader-ink)"></i>{{ t.kicker }}</div>
<h1>{{ t.h1 }}</h1>
<p class="lede">{{ t.lede }}</p>
<div class="ctas">
<button type="button" class="btn btn-primary btn-lg">{{ startCta }}</button>
<sc-if value="{{ isAnon }}" hint-placeholder-val="{{ true }}"><button type="button" class="btn btn-lg">{{ t.already }}</button></sc-if>
</div>
</div>
<div class="vis" aria-hidden="true">
<div class="bar"><i></i><i></i><i></i><span style="margin-inline-start:6px">{{ t.visBar }}</span></div>
<div style="padding:16px 16px 6px"><div style="font-size:var(--t-xs);color:var(--ink-3)">{{ t.visTitle }}</div></div>
<sc-for list="{{ trips }}" as="m" hint-placeholder-count="3">
<div class="meter" style="display:flex;align-items:center;gap:12px"><span class="av" style="width:34px;height:34px;font-size:11px;background:var(--role-importer-bg);color:var(--role-trader-ink)">{{ m.i }}</span><div style="flex:1;min-width:0"><div style="font-size:var(--t-sm);font-weight:600">{{ m.k }}</div><div style="font-size:var(--t-xs);color:var(--ink-3)">{{ m.v }}</div></div><span class="chip chip-verified">{{ m.s }}</span></div>
</sc-for>
</div>
</section>

<section class="sec">
<h2>{{ t.doesTitle }}</h2>
<p class="sub">{{ t.doesSub }}</p>
<div class="g3">
<sc-for list="{{ does }}" as="d" hint-placeholder-count="3">
<div class="card"><h3>{{ d.t }}</h3><p>{{ d.d }}</p></div>
</sc-for>
</div>
</section>

<section class="sec">
<div class="cols cols-2" style="gap:40px">
<div>
<h2>{{ t.needTitle }}</h2>
<p class="sub">{{ t.needSub }}</p>
<div class="stack" style="gap:14px">
<sc-for list="{{ groups }}" as="g" hint-placeholder-count="2">
<div class="doc-group">
<div class="doc-group-h"><span class="doc-ic" data-s="review">{{ g.n }}</span><h3>{{ g.title }}</h3><span style="font-size:var(--t-xs);color:var(--ink-3)">{{ g.sub }}</span></div>
<sc-for list="{{ g.items }}" as="n" hint-placeholder-count="3">
<div class="doc-row"><div class="dn">{{ n.t }}<div class="sub">{{ n.d }}</div></div></div>
</sc-for>
</div>
</sc-for>
</div>
</div>
<div>
<h2>{{ t.howTitle }}</h2>
<p class="sub">{{ t.howSub }}</p>
<div class="stack" style="gap:10px">
<sc-for list="{{ how }}" as="h" hint-placeholder-count="5">
<div class="card" style="display:flex;gap:14px;align-items:flex-start;padding:14px 18px"><span class="stepn" style="margin:0;flex:none">{{ h.n }}</span><div><h3 style="font-size:var(--t-body)">{{ h.t }}</h3><p>{{ h.d }}</p></div></div>
</sc-for>
</div>
</div>
</div>
</section>

<section class="sec">
<h2>{{ t.notTitle }}</h2>
<p class="sub">{{ t.notSub }}</p>
<div class="nots"><sc-for list="{{ nots }}" as="x" hint-placeholder-count="6"><span>{{ x }}</span></sc-for></div>
</section>

<div class="cta-band">
<div class="grow"><h2>{{ t.bandTitle }}</h2><p>{{ t.bandSub }}</p></div>
<button type="button" class="btn btn-lg" style="background:#fff;color:var(--ink);border-color:#fff">{{ startCta }}</button>
</div>

</div>'''

LOGIC = r'''
  L = {
    ar: { dir: 'rtl', short: 'ع', label: 'العربية',
      kicker: 'مَعْبَر · التجارة', h1: 'جد من يجلب لك ما تحتاج، ووثّق الاتفاق.',
      lede: 'فضاء عمل التاجر المقيَّد في السجل التجاري: رحلات ومستوردون مُتحقَّقون، طلبات توريد بنطاق سعر، ومتجر عام يحمل سجلّك.',
      start: 'ابدأ كتاجر', become: 'أضف صفة تاجر', already: 'تاجر بالفعل؟ ادخل',
      visBar: 'مَعْبَر · التجارة', visTitle: 'رحلات قادمة في فئاتك',
      tripK: ['إسطنبول · 12 – 16 أكتوبر', 'دبي · 19 – 23 أكتوبر', 'غازي عنتاب · 2 – 7 نوفمبر'], tripV: ['كريمة ح. · 84 معاملة', 'سفيان ب. · 12 معاملة', 'ن. مرابط · 46 معاملة'], tripS: ['سعة متاحة', 'سعة محدودة', 'سعة متاحة'], tripI: ['ك ح', 'س ب', 'ن م'],
      doesTitle: 'ماذا يفعل لك', doesSub: 'ثلاث أدوات، لا أكثر.',
      does: [['اكتشاف', 'من يسافر، إلى أين، ومتى — بسجلّ كل مستورد قبل أن تراسله.'], ['طلب توريد', 'مواصفة، كمية، نطاق سعر. المستوردون يعرضون، وأنت تختار بالسجلّ لا بالسعر وحده.'], ['متجرك العام', 'منتجاتك في السوق أمام المشترين، مع سجلّك التجاري المُتحقَّق منه.']],
      needTitle: 'ما تحتاجه', needSub: 'مجموعتان منفصلتان: هويتك أنت، وهوية نشاطك التجاري.',
      groups: [['هوية شخصية', 'من أنت', [['بطاقة التعريف الوطنية', 'وصورة حيّة مطابقة.']]], ['هوية تجارية', 'ما هو نشاطك', [['السجل التجاري', 'مستخرج ساري. هو ما يفتح متجرك العام.'], ['الرقم الجبائي', 'يُرفع بالصورة.'], ['عنوان النشاط', 'يظهر في ملف متجرك.']]]],
      howTitle: 'كيف يتمّ', howSub: 'خمس خطوات. البحث والمراسلة متاحان قبل انتهاء التحقّق.',
      how: [['سجّل بالهاتف', 'رقم ورمز تأكيد. بلا كلمة مرور.'], ['عرّفنا بنشاطك', 'اسم النشاط، عنوانه، ما تبيعه.'], ['ارفع وثائقك', 'هويتك ثم سجلّك التجاري، كل وثيقة على حدة.'], ['المراجعة', 'فريق الثقة يراجع. نعلمك بالقرار أو بما يحتاج تصحيحاً.'], ['فضاؤك جاهز', 'مَعْبَر · التجارة يفتح: الاكتشاف، الطلبات، المتجر.']],
      notTitle: 'ما ليست مَعْبَر', notSub: 'حتى لا يلتبس الأمر.',
      nots: ['لا دفع ولا حجز أموال', 'لا ضمان للمعاملات', 'لا بيع بالوكالة', 'لا شحن', 'لا تصريح جمركي', 'لا تُلغي شرط السجل التجاري'],
      bandTitle: 'جاهز؟', bandSub: 'التسجيل دقيقة. السجل التجاري فقط لعرض منتجاتك.',
      memberInitials: 'ك ح', memberTitle: 'كريمة ح. · مستوردة مُتحقَّقة', memberSub: 'ستُضاف صفة التاجر إلى حسابك نفسه. لا حساب جديد ولا رقم جديد.', memberBack: 'رجوع إلى الاستيراد'
    },
    fr: { dir: 'ltr', short: 'FR', label: 'Français',
      kicker: 'Maabar Trade', h1: 'Trouvez qui vous rapporte ce qu’il vous faut, et documentez l’accord.',
      lede: 'L’espace de travail du commerçant inscrit au registre : voyages et importateurs vérifiés, demandes d’approvisionnement avec fourchette de prix, et une boutique publique qui porte votre historique.',
      start: 'Commencer comme commerçant', become: 'Ajouter le rôle commerçant', already: 'Déjà commerçant ? Connexion',
      visBar: 'Maabar Trade', visTitle: 'Voyages à venir dans vos catégories',
      tripK: ['Istanbul · 12 – 16 octobre', 'Dubaï · 19 – 23 octobre', 'Gaziantep · 2 – 7 novembre'], tripV: ['Karima H. · 84 transactions', 'Sofiane B. · 12 transactions', 'N. Merabet · 46 transactions'], tripS: ['Capacité disponible', 'Capacité limitée', 'Capacité disponible'], tripI: ['KH', 'SB', 'NM'],
      doesTitle: 'Ce qu’il fait pour vous', doesSub: 'Trois outils, pas plus.',
      does: [['Découverte', 'Qui voyage, où et quand — avec l’historique de chaque importateur avant de lui écrire.'], ['Demande d’approvisionnement', 'Spécification, quantité, fourchette. Les importateurs proposent ; vous choisissez à l’historique, pas au prix seul.'], ['Votre boutique publique', 'Vos produits sur la place de marché, avec votre registre du commerce vérifié.']],
      needTitle: 'Ce qu’il vous faut', needSub: 'Deux groupes distincts : votre identité, et celle de votre activité.',
      groups: [['Identité personnelle', 'qui vous êtes', [['Carte d’identité nationale', 'Et une photo en direct correspondante.']]], ['Identité commerciale', 'ce qu’est votre activité', [['Registre du commerce', 'Extrait en cours de validité. C’est lui qui ouvre votre boutique publique.'], ['Numéro fiscal', 'Déposé en photo.'], ['Adresse de l’activité', 'Figure sur votre fiche boutique.']]]],
      howTitle: 'Comment ça se passe', howSub: 'Cinq étapes. Recherche et messages disponibles avant la fin de la vérification.',
      how: [['Inscription par téléphone', 'Un numéro et un code. Pas de mot de passe.'], ['Présentez votre activité', 'Nom, adresse, ce que vous vendez.'], ['Déposez vos documents', 'Votre identité puis votre registre, un par un.'], ['Vérification', 'L’équipe confiance examine. Vous êtes notifié de la décision ou de ce qui manque.'], ['Votre espace est prêt', 'Maabar Trade s’ouvre : découverte, demandes, boutique.']],
      notTitle: 'Ce que Maabar n’est pas', notSub: 'Pour éviter toute confusion.',
      nots: ['Ni paiement ni séquestre', 'Pas de garantie', 'Pas de vente par procuration', 'Pas de livraison', 'Pas de déclaration douanière', 'Ne dispense pas du registre du commerce'],
      bandTitle: 'Prêt ?', bandSub: 'L’inscription prend une minute. Le registre seulement pour exposer vos produits.',
      memberInitials: 'KH', memberTitle: 'Karima H. · importatrice vérifiée', memberSub: 'Le rôle commerçant s’ajoutera à ce même compte. Ni nouveau compte, ni nouveau numéro.', memberBack: 'Retour à Import'
    },
    en: { dir: 'ltr', short: 'EN', label: 'English',
      kicker: 'Maabar Trade', h1: 'Find who can bring what you need, and document the deal.',
      lede: 'The workspace for the registered trader: verified trips and importers, sourcing requests with a price range, and a public shop that carries your record.',
      start: 'Start as a trader', become: 'Add the trader role', already: 'Already a trader? Sign in',
      visBar: 'Maabar Trade', visTitle: 'Upcoming trips in your categories',
      tripK: ['Istanbul · 12 – 16 October', 'Dubai · 19 – 23 October', 'Gaziantep · 2 – 7 November'], tripV: ['Karima H. · 84 transactions', 'Sofiane B. · 12 transactions', 'N. Merabet · 46 transactions'], tripS: ['Capacity available', 'Limited capacity', 'Capacity available'], tripI: ['KH', 'SB', 'NM'],
      doesTitle: 'What it does for you', doesSub: 'Three tools, no more.',
      does: [['Discovery', 'Who travels, where and when — with every importer’s record before you write.'], ['Sourcing requests', 'Specification, quantity, price range. Importers offer; you choose by record, not price alone.'], ['Your public shop', 'Your products on the marketplace, backed by your verified commercial register.']],
      needTitle: 'What you need', needSub: 'Two separate groups: who you are, and what your business is.',
      groups: [['Personal identity', 'who you are', [['National ID card', 'Plus a matching live photo.']]], ['Business identity', 'what your business is', [['Commercial register', 'A valid extract. This is what opens your public shop.'], ['Tax number', 'Uploaded as a photo.'], ['Business address', 'Shown on your shop profile.']]]],
      howTitle: 'How it works', howSub: 'Five steps. Search and messaging open before verification ends.',
      how: [['Sign up by phone', 'A number and a code. No password.'], ['Tell us about your business', 'Name, address, what you sell.'], ['Upload your documents', 'Your identity, then your register, one at a time.'], ['Review', 'The trust team checks them. You’re told the decision, or what needs fixing.'], ['Your workspace is ready', 'Maabar Trade opens: discovery, requests, shop.']],
      notTitle: 'What Maabar is not', notSub: 'So there is no confusion.',
      nots: ['No payments or escrow', 'No transaction guarantee', 'No selling by proxy', 'No shipping', 'No customs declaration', 'Does not waive the commercial register'],
      bandTitle: 'Ready?', bandSub: 'Signing up takes a minute. The register only to show your products.',
      memberInitials: 'KH', memberTitle: 'Karima H. · verified importer', memberSub: 'The trader role is added to this same account. No new account, no new number.', memberBack: 'Back to Import'
    }
  };
  VIEWS = ['anon', 'member'];
  VIEW_LABELS = { ar: ['زائر', 'مستوردة مُتحقَّقة تضيف صفة'], fr: ['Visiteur', 'Importatrice vérifiée ajoutant un rôle'], en: ['Visitor', 'Verified importer adding a role'] };
  renderVals() {
    const lang = this.state.lang, t = this.L[lang];
    const member = this.state.view === 'member';
    return {
      rootRef: this.root, t, langs: this.langsFor(lang),
      sh: window.MaabarShell(lang, 'public', 'fortrader', { held: member ? ['importer', 'public'] : ['public'] }),
      stateLabel: ({ ar: 'الحالة', fr: 'État', en: 'State' })[lang],
      views: this.sw(this.VIEWS, 'view', this.VIEW_LABELS[lang]),
      isAnon: !member, isMember: member,
      startCta: member ? t.become : t.start,
      trips: t.tripK.map((k, i) => ({ k, v: t.tripV[i], s: t.tripS[i], i: t.tripI[i] })),
      does: t.does.map(([tt, d]) => ({ t: tt, d })),
      groups: t.groups.map(([title, sub, items], i) => ({ n: String(i + 1), title, sub, items: items.map(([tt, d]) => ({ t: tt, d })) })),
      how: t.how.map(([tt, d], i) => ({ n: String(i + 1), t: tt, d })),
      nots: t.nots
    };
  }
'''

build(dict(name='For Traders', w=1440, h=1900, css=CSS, state="view: 'anon'",
           template=site_page(INNER, bar=statebar()), logic=LOGIC))
