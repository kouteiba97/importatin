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
<span class="av" style="width:38px;height:38px;font-size:12px;background:var(--role-trader-bg);color:var(--role-trader-ink)">{{ t.memberInitials }}</span>
<div style="flex:1"><div style="font-weight:600">{{ t.memberTitle }}</div><div style="font-size:var(--t-sm);color:var(--ink-2)">{{ t.memberSub }}</div></div>
<button type="button" class="btn">{{ t.memberBack }}</button>
</div>
</sc-if>

<section class="hero">
<div>
<div class="kicker" style="color:var(--role-importer-ink)"><i style="background:var(--role-importer-ink)"></i>{{ t.kicker }}</div>
<h1>{{ t.h1 }}</h1>
<p class="lede">{{ t.lede }}</p>
<div class="ctas">
<button type="button" class="btn btn-primary btn-lg">{{ startCta }}</button>
<sc-if value="{{ isAnon }}" hint-placeholder-val="{{ true }}"><button type="button" class="btn btn-lg">{{ t.already }}</button></sc-if>
</div>
</div>
<div class="vis" aria-hidden="true">
<div class="bar"><i></i><i></i><i></i><span style="margin-inline-start:6px">{{ t.visBar }}</span></div>
<div style="padding:16px 16px 4px"><div style="font-size:var(--t-xs);color:var(--ink-3)">{{ t.visTrip }}</div><div style="font-size:18px;font-weight:600">{{ t.visDest }}</div></div>
<sc-for list="{{ meters }}" as="m" hint-placeholder-count="3">
<div class="meter"><div class="k"><span>{{ m.k }}</span><span class="num"><bdi>{{ m.v }}</bdi></span></div><div class="tr"><i style="width:{{ m.w }}"></i></div></div>
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
<div class="panel"><div class="panel-b">
<sc-for list="{{ needs }}" as="n" hint-placeholder-count="4">
<div class="req"><span class="ic">{{ n.i }}</span><div><div class="t">{{ n.t }}</div><div class="d">{{ n.d }}</div></div></div>
</sc-for>
</div></div>
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
      kicker: 'مَعْبَر · الاستيراد', h1: 'اعرف ما يطلبه السوق قبل أن تشتري بمالك.',
      lede: 'فضاء عمل للمستورد المصغّر المقنَّن: طلب مُتحقَّق من تجّار حقيقيين، عدّادات حدّك القانوني، وسجلّ يبني سمعتك.',
      start: 'ابدأ كمستورد', become: 'أضف صفة مستورد', already: 'مستورد بالفعل؟ ادخل',
      visBar: 'مَعْبَر · الاستيراد', visTrip: 'رحلتك القادمة', visDest: 'إسطنبول · 12 – 16 أكتوبر',
      meterK: ['القيمة', 'الوزن', 'الحجم'], meterV: ['560 000 / 1 800 000 دج', '8 / 46 كغ', '0,3 / 1,2 م³'],
      doesTitle: 'ماذا يفعل لك', doesSub: 'ثلاث أدوات، لا أكثر.',
      does: [['طلب مُتحقَّق', 'ما يطلبه التجّار في فئاتك، بكميات ونطاق سعر، قبل أن تسافر.'], ['حدّك القانوني', 'القيمة والوزن والحجم في ثلاثة عدّادات. الحدّ القانوني مقفل ومحدَّث من التنظيم.'], ['سجلّ وسمعة', 'التزامات موثَّقة، مراجعات من معاملات حقيقية، دفتر مبسّط ووسم المادة 14.']],
      needTitle: 'ما تحتاجه', needSub: 'الوثائق تُرفع بعد التسجيل، على مراحل. تبقى خاصّة.',
      needs: [['بطاقة التعريف الوطنية', 'وصورة حيّة مطابقة.'], ['بطاقة المقاول الذاتي', 'ميدان الاستيراد المصغّر، سارية.'], ['الرخصة العامة', 'من وزارة التجارة الخارجية.'], ['الرقم الجبائي وCASNOS', 'تُرفعان بالصورة.']],
      howTitle: 'كيف يتمّ', howSub: 'خمس خطوات. التحقّق عادةً خلال يوم عمل.',
      how: [['سجّل بالهاتف', 'رقم ورمز تأكيد. بلا كلمة مرور.'], ['أكمل ملفك', 'اسمك كما في الوثائق، ولايتك، فئاتك.'], ['ارفع وثائقك', 'كل وثيقة على حدة، في أي وقت.'], ['المراجعة', 'يراجعها فريق الثقة. نعلمك بالقرار أو بما يحتاج تصحيحاً.'], ['فضاؤك جاهز', 'مَعْبَر · الاستيراد يفتح: الرحلات، الطلب، السجلّات.']],
      notTitle: 'ما ليست مَعْبَر', notSub: 'حتى لا يلتبس الأمر.',
      nots: ['لا صرف عملة', 'لا دفع ولا حجز أموال', 'لا شراء بالوكالة', 'لا تصريح جمركي', 'لا ضمان للمعاملات', 'لا تمنح حقّ الاستيراد'],
      bandTitle: 'جاهز؟', bandSub: 'التسجيل دقيقة. الوثائق بعد ذلك.',
      memberInitials: 'ي ب', memberTitle: 'ياسين ب. · تاجر مُتحقَّق', memberSub: 'ستُضاف صفة المستورد إلى حسابك نفسه. لا حساب جديد ولا رقم جديد.', memberBack: 'رجوع إلى التجارة'
    },
    fr: { dir: 'ltr', short: 'FR', label: 'Français',
      kicker: 'Maabar Import', h1: 'Sachez ce que le marché demande avant d’engager votre argent.',
      lede: 'L’espace de travail du micro-importateur déclaré : demande vérifiée de vrais commerçants, compteurs de votre plafond légal, et un historique qui construit votre réputation.',
      start: 'Commencer comme importateur', become: 'Ajouter le rôle importateur', already: 'Déjà importateur ? Connexion',
      visBar: 'Maabar Import', visTrip: 'Votre prochain voyage', visDest: 'Istanbul · 12 – 16 octobre',
      meterK: ['Valeur', 'Poids', 'Volume'], meterV: ['560 000 / 1 800 000 DA', '8 / 46 kg', '0,3 / 1,2 m³'],
      doesTitle: 'Ce qu’il fait pour vous', doesSub: 'Trois outils, pas plus.',
      does: [['Demande vérifiée', 'Ce que les commerçants demandent dans vos catégories, en quantités et fourchettes de prix, avant de partir.'], ['Votre plafond légal', 'Valeur, poids et volume en trois compteurs. Le plafond légal est verrouillé et mis à jour depuis la réglementation.'], ['Historique et réputation', 'Engagements documentés, avis issus de transactions réelles, registre simplifié et étiquette art. 14.']],
      needTitle: 'Ce qu’il vous faut', needSub: 'Les documents se déposent après l’inscription, par étapes. Ils restent privés.',
      needs: [['Carte d’identité nationale', 'Et une photo en direct correspondante.'], ['Carte d’auto-entrepreneur', 'Activité importation de faible valeur, en cours de validité.'], ['Autorisation générale', 'Du ministère du Commerce extérieur.'], ['Numéro fiscal et CASNOS', 'Déposés en photo.']],
      howTitle: 'Comment ça se passe', howSub: 'Cinq étapes. Vérification en général sous un jour ouvré.',
      how: [['Inscription par téléphone', 'Un numéro et un code. Pas de mot de passe.'], ['Complétez votre profil', 'Nom comme sur vos documents, wilaya, catégories.'], ['Déposez vos documents', 'Un par un, quand vous voulez.'], ['Vérification', 'L’équipe confiance examine. Vous êtes notifié de la décision ou de ce qui manque.'], ['Votre espace est prêt', 'Maabar Import s’ouvre : voyages, demande, registres.']],
      notTitle: 'Ce que Maabar n’est pas', notSub: 'Pour éviter toute confusion.',
      nots: ['Pas de change', 'Ni paiement ni séquestre', 'Pas d’achat par procuration', 'Pas de déclaration douanière', 'Pas de garantie', 'N’accorde pas le droit d’importer'],
      bandTitle: 'Prêt ?', bandSub: 'L’inscription prend une minute. Les documents viennent après.',
      memberInitials: 'YB', memberTitle: 'Yacine B. · commerçant vérifié', memberSub: 'Le rôle importateur s’ajoutera à ce même compte. Ni nouveau compte, ni nouveau numéro.', memberBack: 'Retour à Trade'
    },
    en: { dir: 'ltr', short: 'EN', label: 'English',
      kicker: 'Maabar Import', h1: 'Know what the market wants before you spend your own money.',
      lede: 'The workspace for the licensed micro-importer: verified demand from real traders, meters for your legal cap, and a record that builds your reputation.',
      start: 'Start as an importer', become: 'Add the importer role', already: 'Already an importer? Sign in',
      visBar: 'Maabar Import', visTrip: 'Your next trip', visDest: 'Istanbul · 12 – 16 October',
      meterK: ['Value', 'Weight', 'Volume'], meterV: ['560,000 / 1,800,000 DA', '8 / 46 kg', '0.3 / 1.2 m³'],
      doesTitle: 'What it does for you', doesSub: 'Three tools, no more.',
      does: [['Verified demand', 'What traders in your categories want, in quantities and price ranges, before you travel.'], ['Your legal cap', 'Value, weight and volume on three meters. The legal limit is locked and updated from the regulation.'], ['Record and reputation', 'Documented commitments, reviews from real transactions, a simplified ledger and the Article 14 label.']],
      needTitle: 'What you need', needSub: 'Documents are uploaded after sign-up, in stages. They stay private.',
      needs: [['National ID card', 'Plus a matching live photo.'], ['Auto-entrepreneur card', 'Low-value import activity, currently valid.'], ['General authorisation', 'From the Ministry of Foreign Trade.'], ['Tax number and CASNOS', 'Uploaded as photos.']],
      howTitle: 'How it works', howSub: 'Five steps. Verification usually within one working day.',
      how: [['Sign up by phone', 'A number and a code. No password.'], ['Complete your profile', 'Name as on your documents, wilaya, categories.'], ['Upload your documents', 'One at a time, whenever you like.'], ['Review', 'The trust team checks them. You’re told the decision, or what needs fixing.'], ['Your workspace is ready', 'Maabar Import opens: trips, demand, records.']],
      notTitle: 'What Maabar is not', notSub: 'So there is no confusion.',
      nots: ['No currency exchange', 'No payments or escrow', 'No buying by proxy', 'No customs declaration', 'No transaction guarantee', 'Does not grant the right to import'],
      bandTitle: 'Ready?', bandSub: 'Signing up takes a minute. Documents come after.',
      memberInitials: 'YB', memberTitle: 'Yacine B. · verified trader', memberSub: 'The importer role is added to this same account. No new account, no new number.', memberBack: 'Back to Trade'
    }
  };
  VIEWS = ['anon', 'member'];
  VIEW_LABELS = { ar: ['زائر', 'تاجر مُتحقَّق يضيف صفة'], fr: ['Visiteur', 'Commerçant vérifié ajoutant un rôle'], en: ['Visitor', 'Verified trader adding a role'] };
  ICONS = ['1', '2', '3', '4'];
  renderVals() {
    const lang = this.state.lang, t = this.L[lang];
    const member = this.state.view === 'member';
    const W = ['31%', '17%', '25%'];
    return {
      rootRef: this.root, t, langs: this.langsFor(lang),
      sh: window.MaabarShell(lang, 'public', 'forimp', { held: member ? ['trader', 'public'] : ['public'] }),
      stateLabel: ({ ar: 'الحالة', fr: 'État', en: 'State' })[lang],
      views: this.sw(this.VIEWS, 'view', this.VIEW_LABELS[lang]),
      isAnon: !member, isMember: member,
      startCta: member ? t.become : t.start,
      meters: t.meterK.map((k, i) => ({ k, v: t.meterV[i], w: W[i] })),
      does: t.does.map(([tt, d]) => ({ t: tt, d })),
      needs: t.needs.map(([tt, d], i) => ({ t: tt, d, i: this.ICONS[i] })),
      how: t.how.map(([tt, d], i) => ({ n: String(i + 1), t: tt, d })),
      nots: t.nots
    };
  }
'''

build(dict(name='For Importers', w=1440, h=1900, css=CSS, state="view: 'anon'",
           template=site_page(INNER, bar=statebar()), logic=LOGIC))
