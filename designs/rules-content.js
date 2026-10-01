/* ============================================================
   MAABAR — RULES CONTENT (design stand-in for the CMS)
   The public Rules page and the admin Rules editor both read this
   one object, exactly as the built product will read the database:
   · values   — regulatory figures with effective date and source.
                Rule texts never contain a number; they contain a
                placeholder ({cap}, {trips}, {duty}, {shelf}) filled
                from here, so one approved value change updates every
                page in every language.
   · articles — one rule = audience + topic + level + legal reference
                + text in EN/FR/AR + version/status/reviewer.
   Only facts verified against official sources are published here
   (Decree 25-170, JO n°40 of 29 June 2025; Laws 18-05 and 09-03).
   Anything unconfirmed stays a draft and never reaches the public.
   ============================================================ */
(function () {
  const LRI = '⁦', PDI = '⁩';

  const MONTHS = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
    ar: ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  };

  const values = {
    cap:   { key: 'max_value_per_trip', n: 1800000, kind: 'money', since: '2025-06-29', ref: ['d25170', '2'] },
    trips: { key: 'max_trips_per_month', n: 2, kind: 'int', since: '2025-06-29', ref: ['d25170', '2'] },
    duty:  { key: 'customs_duty_rate', n: 5, kind: 'pct', since: '2025-06-29', ref: ['d25170', '4'] },
    shelf: { key: 'shelf_life_min_remaining', n: 50, kind: 'pct', since: '2025-06-29', ref: ['d25170', '6'] }
  };

  /* Proposed value versions waiting for approval — never shown to the public. */
  const pendingValues = [
    { key: 'flat_tax_rate', n: 0.5, kind: 'pct', since: '2026-01-01', ref: ['lf2026', ''], status: 'review', by: 'ADM-031' }
  ];

  const instruments = {
    d25170: { en: 'Executive Decree 25-170', fr: 'Décret exécutif 25-170', ar: 'المرسوم التنفيذي 25-170',
              src: { en: 'Official Journal n°40, 29 June 2025', fr: 'Journal officiel n°40, 29 juin 2025', ar: 'الجريدة الرسمية عدد 40، 29 جوان 2025' } },
    l1805:  { en: 'Law 18-05 on e-commerce', fr: 'Loi 18-05 relative au commerce électronique', ar: 'القانون 18-05 المتعلق بالتجارة الإلكترونية',
              src: { en: 'Law of 10 May 2018', fr: 'Loi du 10 mai 2018', ar: 'قانون 10 ماي 2018' } },
    l0903:  { en: 'Law 09-03 on consumer protection', fr: 'Loi 09-03 relative à la protection du consommateur', ar: 'القانون 09-03 المتعلق بحماية المستهلك',
              src: { en: 'Consumer protection and fraud repression', fr: 'Protection du consommateur et répression des fraudes', ar: 'حماية المستهلك وقمع الغش' } },
    lf2026: { en: 'Finance Law 2026', fr: 'Loi de finances 2026', ar: 'قانون المالية 2026',
              pending: true, src: { en: 'Awaiting the official text', fr: 'En attente du texte officiel', ar: 'في انتظار النص الرسمي' } },
    platform: { en: 'Maabar terms of use', fr: 'Conditions d’utilisation de Maabar', ar: 'شروط استعمال مَعْبَر',
              src: { en: 'Platform policy, not a law', fr: 'Règle de la plateforme, pas une loi', ar: 'قاعدة المنصّة وليست قانوناً' } }
  };

  const many = n => /[–,]/.test(n);
  const ART = { en: n => (many(n) ? 'Arts ' : 'Art. ') + n, fr: n => 'art. ' + n, ar: n => (many(n) ? 'المواد ' : 'المادة ') + LRI + n + PDI };

  const audiences = {
    en: { shopper: 'Shoppers', importer: 'Micro-importers', trader: 'Traders' },
    fr: { shopper: 'Acheteurs', importer: 'Micro-importateurs', trader: 'Commerçants' },
    ar: { shopper: 'المشترون', importer: 'المستوردون المصغّرون', trader: 'التجّار' }
  };

  const levels = {
    en: { prohibited: 'Not allowed', conditional: 'Condition', obligation: 'Required', limit: 'Limit', info: 'Good to know' },
    fr: { prohibited: 'Interdit', conditional: 'Sous condition', obligation: 'Obligatoire', limit: 'Plafond', info: 'Bon à savoir' },
    ar: { prohibited: 'ممنوع', conditional: 'بشرط', obligation: 'إلزامي', limit: 'حدّ', info: 'للعلم' }
  };
  const levelChip = { prohibited: 'chip-prohibited', conditional: 'chip-conditional', obligation: 'chip-neutral', limit: 'chip-brand', info: 'chip-neutral' };

  const topics = {
    shopper: [
      ['missing', { en: 'Why some products aren’t here', fr: 'Pourquoi certains produits sont absents', ar: 'لماذا بعض المنتجات غير موجودة' }],
      ['sellers', { en: 'Who sells to you', fr: 'Qui vous vend', ar: 'من يبيع لك' }],
      ['buying', { en: 'Your purchase', fr: 'Votre achat', ar: 'مشترياتك' }]
    ],
    importer: [
      ['who', { en: 'Who can import', fr: 'Qui peut importer', ar: 'من يحقّ له الاستيراد' }],
      ['limits', { en: 'Your limits', fr: 'Vos plafonds', ar: 'حدودك' }],
      ['goods', { en: 'What you may bring', fr: 'Ce que vous pouvez rapporter', ar: 'ما يمكنك جلبه' }],
      ['trip', { en: 'Before and after each trip', fr: 'Avant et après chaque voyage', ar: 'قبل كل رحلة وبعدها' }],
      ['sanctions', { en: 'What gets you struck off', fr: 'Ce qui entraîne la radiation', ar: 'ما يؤدي إلى الشطب' }]
    ],
    trader: [
      ['public', { en: 'Selling to the public', fr: 'Vendre au public', ar: 'البيع للجمهور' }],
      ['sourcing', { en: 'Buying from micro-importers', fr: 'Acheter aux micro-importateurs', ar: 'الشراء من المستوردين المصغّرين' }],
      ['duties', { en: 'Your responsibilities', fr: 'Vos responsabilités', ar: 'مسؤولياتك' }]
    ]
  };

  /* tx: [title, explanation, what this means for you] */
  const A = (id, aud, topic, level, ref, meta, tx) => Object.assign({ id, aud, topic, level, ref, tx }, meta);
  const PUB = (v, reviewed) => ({ v, status: 'published', reviewed, by: 'ADM-031', ok: 'ADM-007' });

  const articles = [
    /* ───────── SHOPPERS ───────── */
    A('RUL-001', 'shopper', 'missing', 'prohibited', ['d25170', '9'], PUB(3, '2026-09-14'), {
      en: ['Some goods can never be imported this way', 'Prohibited and sensitive goods, sensitive equipment, pharmaceutical products, goods that need a special licence, and anything that harms security, public order or morals are excluded from micro-importing.', 'You won’t find medicines or licence-restricted goods on Maabar. That is the law, not a stock problem.'],
      fr: ['Certaines marchandises ne peuvent jamais être importées ainsi', 'Les marchandises interdites et sensibles, les équipements sensibles, les produits pharmaceutiques, les biens soumis à licence spéciale et tout ce qui porte atteinte à la sécurité, à l’ordre public ou aux bonnes mœurs sont exclus de l’importation de faible valeur.', 'Vous ne trouverez pas de médicaments ni de biens soumis à licence sur Maabar. C’est la loi, pas une rupture de stock.'],
      ar: ['سلع لا يمكن استيرادها بهذه الطريقة أبداً', 'السلع المحظورة والحساسة، والتجهيزات الحساسة، والمنتجات الصيدلانية، والسلع الخاضعة لرخص خاصة، وكل ما يمسّ بالأمن والنظام العام والأخلاق، مستثناة من الاستيراد المصغّر.', 'لن تجد أدوية ولا سلعاً تحتاج رخصة خاصة على مَعْبَر. هذا حكم القانون، وليس نقصاً في المخزون.']
    }),
    A('RUL-002', 'shopper', 'missing', 'conditional', ['d25170', '6'], PUB(2, '2026-09-14'), {
      en: ['Food, cosmetics and perfume: the shelf-life rule', 'A product with an expiry date may enter only if more than {shelf} of its total shelf life remains on the import date.', 'These items reach you with plenty of time before expiry. A product can be missing when a batch did not meet the rule.'],
      fr: ['Alimentation, cosmétiques et parfums : la règle de durée de vie', 'Un produit daté ne peut entrer que s’il lui reste plus de {shelf} de sa durée de vie totale à la date d’importation.', 'Ces articles vous parviennent loin de leur date limite. Un produit peut manquer quand un lot n’a pas respecté la règle.'],
      ar: ['الأغذية والتجميل والعطور: قاعدة مدة الصلاحية', 'لا يدخل المنتج الذي له تاريخ انتهاء إلا إذا تبقّى أكثر من {shelf} من مدة صلاحيته الإجمالية عند تاريخ الاستيراد.', 'تصلك هذه المنتجات بعيدة عن تاريخ انتهائها. وقد يغيب منتج لأن دفعة منه لم تحترم القاعدة.']
    }),
    A('RUL-003', 'shopper', 'missing', 'info', ['d25170', '2'], PUB(2, '2026-09-14'), {
      en: ['Small batches, limited trips', 'Each micro-importer may bring goods worth up to {cap} per trip, and travel at most {trips} times a month.', 'Stock arrives in small, regularly renewed batches. A popular item can sell out and return with the next trip — save it to be told.'],
      fr: ['Petits lots, voyages limités', 'Chaque micro-importateur peut rapporter des marchandises jusqu’à {cap} par voyage, et voyager au plus {trips} fois par mois.', 'Le stock arrive en petits lots renouvelés. Un article populaire peut s’épuiser puis revenir au prochain voyage — enregistrez-le pour être prévenu.'],
      ar: ['دفعات صغيرة ورحلات محدودة', 'يحقّ لكل مستورد مصغّر جلب سلع بقيمة تصل إلى {cap} في كل تنقّل، وبحدّ أقصى {trips} تنقّلات في الشهر.', 'تصل البضاعة في دفعات صغيرة متجدّدة. قد ينفد منتج مطلوب ثم يعود مع الرحلة القادمة — احفظه ليصلك تنبيه.']
    }),
    A('RUL-004', 'shopper', 'sellers', 'obligation', ['l1805', ''], PUB(2, '2026-09-14'), {
      en: ['Every seller is a registered trader', 'Selling online to consumers requires registration in the commercial register.', 'Every shop on Maabar is a verified trader. Micro-importers sell to traders, never directly to you.'],
      fr: ['Chaque vendeur est un commerçant inscrit', 'Vendre en ligne aux consommateurs exige une inscription au registre de commerce.', 'Chaque boutique sur Maabar est un commerçant vérifié. Les micro-importateurs vendent aux commerçants, jamais directement à vous.'],
      ar: ['كل بائع تاجر مقيّد في السجل التجاري', 'البيع الإلكتروني للمستهلكين يشترط القيد في السجل التجاري.', 'كل متجر على مَعْبَر تاجر مُتحقَّق منه. المستوردون المصغّرون يبيعون للتجّار، ولا يبيعون لك مباشرة.']
    }),
    A('RUL-005', 'shopper', 'sellers', 'info', ['d25170', '14'], PUB(1, '2026-09-14'), {
      en: ['The label tells you where it came from', 'Imported goods must carry the importer’s name and address, the product name and its country of origin, in Arabic.', 'Check the label when you collect. If it is missing, ask the seller or report the listing.'],
      fr: ['L’étiquette vous dit d’où vient le produit', 'Les marchandises importées doivent porter le nom et l’adresse de l’importateur, la désignation du produit et son pays d’origine, en arabe.', 'Vérifiez l’étiquette à la remise. Si elle manque, interrogez le vendeur ou signalez l’annonce.'],
      ar: ['الوسم يخبرك من أين جاءت السلعة', 'يجب أن تحمل السلع المستوردة اسم المستورد وعنوانه، وتسمية السلعة، وبلد منشئها، باللغة العربية.', 'تحقّق من الوسم عند الاستلام. إن غاب، اسأل البائع أو أبلغ عن العرض.']
    }),
    A('RUL-006', 'shopper', 'buying', 'info', ['l0903', ''], PUB(1, '2026-09-14'), {
      en: ['Your rights as a consumer', 'The seller is responsible for the conformity and safety of what it sells to you.', 'If goods don’t match what was agreed, open a report — the seller’s record is affected by the decision.'],
      fr: ['Vos droits de consommateur', 'Le vendeur est responsable de la conformité et de la sécurité de ce qu’il vous vend.', 'Si la marchandise ne correspond pas à l’accord, ouvrez un signalement — la décision compte dans l’historique du vendeur.'],
      ar: ['حقوقك كمستهلك', 'البائع مسؤول عن مطابقة وسلامة ما يبيعه لك.', 'إذا لم تطابق السلعة ما اتُّفق عليه، افتح بلاغاً — والقرار يُسجَّل في سجلّ البائع.']
    }),
    A('RUL-007', 'shopper', 'buying', 'info', ['platform', ''], PUB(1, '2026-09-14'), {
      en: ['Maabar does not take your money', 'Payment and handover are agreed directly between you and the seller. Maabar does not receive, hold, guarantee or refund any amount.', 'Never send money to anyone claiming to collect it for Maabar.'],
      fr: ['Maabar ne prend pas votre argent', 'Le paiement et la remise se règlent directement entre vous et le vendeur. Maabar ne reçoit, ne conserve, ne garantit ni ne rembourse aucun montant.', 'N’envoyez jamais d’argent à quelqu’un qui prétend l’encaisser pour Maabar.'],
      ar: ['مَعْبَر لا تأخذ أموالك', 'الدفع والتسليم يُتّفق عليهما مباشرة بينك وبين البائع. مَعْبَر لا تستلم أي مبلغ ولا تحتفظ به ولا تضمنه ولا تردّه.', 'لا ترسل مالاً أبداً لمن يدّعي أنه يحصّله باسم مَعْبَر.']
    }),

    /* ───────── MICRO-IMPORTERS ───────── */
    A('RUL-101', 'importer', 'who', 'obligation', ['d25170', '5–6'], PUB(2, '2026-09-14'), {
      en: ['Who may become a micro-importer', 'You must be an Algerian national resident in Algeria, of legal working age, with no other paid activity, affiliated to CASNOS, holding a foreign-currency account at BEA, a valid auto-entrepreneur card for “micro-import”, and the general authorisation from the Ministry of Foreign Trade.', 'Upload these documents in Verification. Maabar reminds you before any of them expires.'],
      fr: ['Qui peut devenir micro-importateur', 'Il faut être de nationalité algérienne et résider en Algérie, avoir l’âge légal de travailler, n’exercer aucune autre activité rémunérée, être affilié à la CASNOS, détenir un compte devises à la BEA, une carte d’auto-entrepreneur valide pour « importation de faible valeur » et l’autorisation générale du ministère du Commerce extérieur.', 'Déposez ces documents dans Vérification. Maabar vous prévient avant toute expiration.'],
      ar: ['من يحقّ له أن يصبح مستورداً مصغّراً', 'يجب أن تكون جزائري الجنسية مقيماً في الجزائر، في سنّ العمل القانونية، دون أي نشاط مربح آخر، منتسباً إلى CASNOS، صاحب حساب بالعملة الصعبة لدى BEA، وحاملاً لبطاقة مقاول ذاتي سارية بميدان «الاستيراد المصغّر» وللرخصة العامة من وزارة التجارة الخارجية.', 'ارفع هذه الوثائق في صفحة التحقّق. مَعْبَر تنبّهك قبل انتهاء صلاحية أيّ منها.']
    }),
    A('RUL-102', 'importer', 'who', 'obligation', ['d25170', '3, 11–12'], PUB(2, '2026-09-14'), {
      en: ['Strictly personal, never transferable', 'The activity is exercised exclusively and personally. The general authorisation is issued within 5 working days, is valid one year, renewable, personal and non-transferable.', 'No one may travel or buy on your card — not family, not a partner, not a company.'],
      fr: ['Strictement personnel, jamais cessible', 'L’activité s’exerce exclusivement et personnellement. L’autorisation générale est délivrée sous 5 jours ouvrables, valable un an, renouvelable, personnelle et incessible.', 'Personne ne peut voyager ou acheter avec votre carte — ni la famille, ni un associé, ni une société.'],
      ar: ['شخصي حصراً وغير قابل للتنازل', 'يُمارَس النشاط حصرياً وشخصياً. تُمنح الرخصة العامة في أجل 5 أيام عمل، وهي صالحة سنة قابلة للتجديد، شخصية وغير قابلة للتنازل.', 'لا يحقّ لأحد أن يسافر أو يشتري ببطاقتك — لا العائلة ولا شريك ولا شركة.']
    }),
    A('RUL-103', 'importer', 'limits', 'limit', ['d25170', '2, 8'], PUB(3, '2026-09-14'), {
      en: ['Value per trip and trips per month', 'Goods may be worth up to {cap} per trip, with at most {trips} trips per month. Any amount above the limit is not allowed.', 'Maabar’s meters track value, weight and volume against these limits while you build your buying list.'],
      fr: ['Valeur par voyage et voyages par mois', 'Les marchandises peuvent valoir jusqu’à {cap} par voyage, avec au plus {trips} voyages par mois. Tout dépassement est interdit.', 'Les compteurs de Maabar suivent valeur, poids et volume face à ces plafonds pendant que vous préparez votre liste.'],
      ar: ['القيمة في كل تنقّل وعدد التنقّلات في الشهر', 'يمكن أن تصل قيمة السلع إلى {cap} في كل تنقّل، بحدّ أقصى {trips} تنقّلات في الشهر. ويُمنع أي تجاوز للحصّة.', 'عدّادات مَعْبَر تتابع القيمة والوزن والحجم مقارنة بهذه الحدود وأنت تُعدّ قائمة الشراء.']
    }),
    A('RUL-104', 'importer', 'limits', 'info', ['d25170', '4'], PUB(2, '2026-09-14'), {
      en: ['Duty, register and simple accounts', 'Micro-importers are exempt from the commercial register and from prior import licences, pay a customs duty of {duty}, and keep simplified accounts in a numbered ledger stamped by the tax office.', 'The Records tab keeps a digital ledger you can export and show to the tax office.'],
      fr: ['Droit de douane, registre et comptabilité simple', 'Les micro-importateurs sont dispensés du registre de commerce et des licences préalables d’importation, paient un droit de douane de {duty} et tiennent une comptabilité simplifiée dans un registre numéroté et paraphé par les services fiscaux.', 'L’onglet Registres tient une version numérique exportable à présenter aux impôts.'],
      ar: ['الحقوق الجمركية والسجل والمحاسبة المبسّطة', 'يُعفى المستورد المصغّر من القيد في السجل التجاري ومن رخص الاستيراد المسبقة، ويدفع حقاً جمركياً بنسبة {duty}، ويمسك محاسبة مبسّطة في دفتر مرقّم ومؤشَّر عليه من مصالح الضرائب.', 'تبويب السجلّات يحفظ دفتراً رقمياً قابلاً للتصدير لتقديمه لمصالح الضرائب.']
    }),
    A('RUL-105', 'importer', 'limits', 'obligation', ['d25170', '7'], PUB(1, '2026-09-14'), {
      en: ['Financed from your own foreign currency', 'The activity is financed from the importer’s own foreign currency.', 'Maabar never exchanges currency and never handles payment for goods.'],
      fr: ['Financé par vos propres devises', 'L’activité est financée par les propres devises de l’importateur.', 'Maabar ne fait jamais de change et ne gère jamais le paiement des marchandises.'],
      ar: ['التمويل من عملتك الصعبة الخاصة', 'يُموَّل النشاط من العملة الصعبة الخاصة بالمستورد.', 'مَعْبَر لا تصرف العملة أبداً ولا تتدخّل في دفع ثمن السلع.']
    }),
    A('RUL-106', 'importer', 'goods', 'prohibited', ['d25170', '9'], PUB(3, '2026-09-14'), {
      en: ['Excluded goods', 'Prohibited and sensitive goods, sensitive equipment, pharmaceutical products, goods subject to special licences, and goods harmful to security, public order or morals cannot be imported under this regime.', 'Use “Can I import this?” before you buy. Trip Creation warns you when an item falls in an excluded category.'],
      fr: ['Marchandises exclues', 'Les marchandises interdites et sensibles, les équipements sensibles, les produits pharmaceutiques, les biens soumis à licence spéciale et ceux portant atteinte à la sécurité, à l’ordre public ou aux bonnes mœurs ne peuvent pas être importés sous ce régime.', 'Utilisez « Puis-je importer ceci ? » avant d’acheter. La création de voyage vous alerte quand un article relève d’une catégorie exclue.'],
      ar: ['السلع المستثناة', 'لا يمكن استيراد السلع المحظورة والحساسة، والتجهيزات الحساسة، والمنتجات الصيدلانية، والسلع الخاضعة لرخص خاصة، والسلع الماسّة بالأمن والنظام العام والأخلاق، في إطار هذا النظام.', 'استعمل «هل يمكنني استيراد هذا؟» قبل الشراء. وإنشاء الرحلة ينبّهك إذا كان صنف ضمن فئة مستثناة.']
    }),
    A('RUL-107', 'importer', 'goods', 'conditional', ['d25170', '6'], PUB(2, '2026-09-14'), {
      en: ['Dated goods: more than {shelf} of shelf life left', 'Any product with an expiry date must have more than {shelf} of its total shelf life remaining on the import date.', 'Check production and expiry dates on the pack before you pay. Customs decide at entry.'],
      fr: ['Produits datés : plus de {shelf} de durée de vie restante', 'Tout produit daté doit conserver plus de {shelf} de sa durée de vie totale à la date d’importation.', 'Vérifiez les dates de fabrication et de péremption sur l’emballage avant de payer. La douane décide à l’entrée.'],
      ar: ['السلع المؤرَّخة: أكثر من {shelf} من مدة الصلاحية', 'يجب أن يتبقّى لكل منتج له تاريخ انتهاء أكثر من {shelf} من مدة صلاحيته الإجمالية عند تاريخ الاستيراد.', 'تحقّق من تاريخَي الإنتاج والانتهاء على العبوة قبل الدفع. القرار عند الدخول للجمارك.']
    }),
    A('RUL-108', 'importer', 'goods', 'info', ['d25170', '2'], PUB(1, '2026-09-14'), {
      en: ['Resold as they are', 'Goods are imported to be resold in their original state, without transformation.', 'Repackaging or assembling goods before resale takes them outside this regime.'],
      fr: ['Revendus en l’état', 'Les marchandises sont importées pour être revendues en l’état, sans transformation.', 'Reconditionner ou assembler les marchandises avant la revente les fait sortir de ce régime.'],
      ar: ['تُباع على حالتها', 'تُستورد السلع لإعادة بيعها على حالتها، دون تحويل.', 'إعادة التعبئة أو التركيب قبل البيع تُخرج السلع من هذا النظام.']
    }),
    A('RUL-109', 'importer', 'trip', 'obligation', ['d25170', '13'], PUB(2, '2026-09-14'), {
      en: ['Pre-declare every operation on anae.dz', 'Each import operation must be declared in advance on the digital platform of the Ministry of Start-ups (anae.dz), which is linked to customs.', 'Maabar reminds you before each trip. It never declares on your behalf.'],
      fr: ['Pré-déclarer chaque opération sur anae.dz', 'Chaque opération d’importation doit être déclarée à l’avance sur la plateforme numérique du ministère des Start-up (anae.dz), reliée à la douane.', 'Maabar vous le rappelle avant chaque voyage. Elle ne déclare jamais à votre place.'],
      ar: ['التصريح المسبق بكل عملية على anae.dz', 'يجب التصريح المسبق بكل عملية استيراد عبر المنصة الرقمية لوزارة اقتصاد المعرفة والمؤسسات الناشئة (anae.dz)، المربوطة بالجمارك.', 'مَعْبَر تذكّرك قبل كل رحلة، ولا تصرّح نيابةً عنك أبداً.']
    }),
    A('RUL-110', 'importer', 'trip', 'obligation', ['d25170', '14'], PUB(2, '2026-09-14'), {
      en: ['Label every unit, issue a delivery note', 'Each item must carry your name and address, the product name and the country of origin or provenance. A simplified delivery note states quantity, weight and volume.', 'The label generator in Records prints the label in Arabic and the delivery note for each sale.'],
      fr: ['Étiqueter chaque unité, émettre un bon de remise', 'Chaque article doit porter vos nom et adresse, la désignation du produit et le pays d’origine ou de provenance. Un bon de remise simplifié indique quantité, poids et volume.', 'Le générateur d’étiquettes dans Registres imprime l’étiquette en arabe et le bon de remise de chaque vente.'],
      ar: ['وسم كل وحدة وإصدار وصل تسليم', 'يجب أن تحمل كل سلعة اسمك وعنوانك، وتسمية السلعة، وبلد المنشأ أو المصدر. ويبيّن وصل تسليم مبسّط الكمية والوزن والحجم.', 'مولّد الوسم في السجلّات يطبع الملصق بالعربية ووصل التسليم لكل بيع.']
    }),
    A('RUL-111', 'importer', 'sanctions', 'prohibited', ['d25170', '15'], PUB(2, '2026-09-14'), {
      en: ['Removal from the register', 'You can be struck off for breaching consumer protection or national security rules, refusing the pre-declaration, making false declarations, using the card for another purpose, or breaching the decree.', 'Maabar also suspends trips for any account under removal.'],
      fr: ['Radiation du registre', 'La radiation peut être prononcée pour atteinte à la protection du consommateur ou à la sécurité nationale, refus de pré-déclaration, fausses déclarations, usage de la carte à d’autres fins ou violation du décret.', 'Maabar suspend aussi les voyages de tout compte en cours de radiation.'],
      ar: ['الشطب من السجل', 'يمكن أن تُشطب بسبب مخالفة قواعد حماية المستهلك أو الأمن الوطني، أو رفض التصريح المسبق، أو التصريحات الكاذبة، أو استعمال البطاقة لغير غرضها، أو مخالفة المرسوم.', 'مَعْبَر توقف أيضاً رحلات أي حساب محلّ إجراء شطب.']
    }),

    /* ───────── TRADERS ───────── */
    A('RUL-201', 'trader', 'public', 'obligation', ['l1805', ''], PUB(2, '2026-09-14'), {
      en: ['A commercial register to sell online', 'An online supplier selling to consumers must be registered in the commercial register.', 'Upload your register in Verification to unlock public listings. Until then you can still source from importers.'],
      fr: ['Un registre de commerce pour vendre en ligne', 'Un fournisseur en ligne qui vend aux consommateurs doit être inscrit au registre de commerce.', 'Déposez votre registre dans Vérification pour débloquer les annonces publiques. En attendant, vous pouvez déjà vous approvisionner.'],
      ar: ['سجل تجاري للبيع الإلكتروني', 'يجب أن يكون المورّد الإلكتروني الذي يبيع للمستهلكين مقيّداً في السجل التجاري.', 'ارفع سجلّك في صفحة التحقّق لتفتح العرض للجمهور. وإلى ذلك الحين يمكنك التوريد من المستوردين.']
    }),
    A('RUL-202', 'trader', 'public', 'prohibited', ['d25170', '9'], PUB(2, '2026-09-14'), {
      en: ['Excluded goods cannot be listed', 'Goods excluded from micro-importing — prohibited and sensitive goods, pharmaceutical products, licence-restricted goods — cannot be sold as micro-imported goods.', 'Listings in these categories are refused at moderation.'],
      fr: ['Les marchandises exclues ne peuvent pas être proposées', 'Les marchandises exclues de l’importation de faible valeur — interdites et sensibles, pharmaceutiques, soumises à licence — ne peuvent pas être vendues comme telles.', 'Les annonces dans ces catégories sont refusées à la modération.'],
      ar: ['لا يمكن عرض السلع المستثناة', 'السلع المستثناة من الاستيراد المصغّر — المحظورة والحساسة والصيدلانية والخاضعة لرخص — لا يمكن بيعها على أنها سلع مستوردة بهذا النظام.', 'العروض في هذه الفئات تُرفض عند المراجعة.']
    }),
    A('RUL-203', 'trader', 'sourcing', 'info', ['d25170', '2–3'], PUB(1, '2026-09-14'), {
      en: ['Deal with the named importer', 'Micro-imported goods are bought for resale as they are, and the importer must act personally.', 'Commitments on Maabar are with the verified importer named on the trip — never with an intermediary.'],
      fr: ['Traitez avec l’importateur nommé', 'Les marchandises importées en faible valeur sont achetées pour être revendues en l’état, et l’importateur doit agir personnellement.', 'Les engagements sur Maabar se font avec l’importateur vérifié nommé sur le voyage — jamais avec un intermédiaire.'],
      ar: ['تعامل مع المستورد المسمّى', 'تُشترى السلع المستوردة بهذا النظام لإعادة بيعها على حالتها، ويجب أن يتصرّف المستورد شخصياً.', 'الالتزامات على مَعْبَر تكون مع المستورد المُتحقَّق منه المسمّى في الرحلة — لا مع وسيط.']
    }),
    A('RUL-204', 'trader', 'sourcing', 'conditional', ['d25170', '6'], PUB(1, '2026-09-14'), {
      en: ['Dated goods keep the shelf-life rule', 'Dated goods must have had more than {shelf} of their shelf life remaining when imported.', 'Ask the importer for production and expiry dates before you commit to dated goods.'],
      fr: ['Les produits datés restent soumis à la règle', 'Les produits datés devaient conserver plus de {shelf} de leur durée de vie à l’importation.', 'Demandez à l’importateur les dates de fabrication et de péremption avant de vous engager sur des produits datés.'],
      ar: ['السلع المؤرَّخة تخضع لقاعدة الصلاحية', 'يجب أن يكون قد تبقّى للسلع المؤرَّخة أكثر من {shelf} من مدة صلاحيتها عند الاستيراد.', 'اطلب من المستورد تاريخَي الإنتاج والانتهاء قبل الالتزام بسلع مؤرَّخة.']
    }),
    A('RUL-205', 'trader', 'duties', 'obligation', ['d25170', '14'], PUB(1, '2026-09-14'), {
      en: ['Keep the import label on the goods', 'Imported goods carry the importer’s name and address, the product name and the country of origin.', 'Do not remove the label when you resell; buyers are told to check it.'],
      fr: ['Conservez l’étiquette d’importation', 'Les marchandises importées portent le nom et l’adresse de l’importateur, la désignation du produit et le pays d’origine.', 'Ne retirez pas l’étiquette à la revente ; les acheteurs sont invités à la vérifier.'],
      ar: ['احتفظ بوسم الاستيراد على السلع', 'تحمل السلع المستوردة اسم المستورد وعنوانه، وتسمية السلعة، وبلد المنشأ.', 'لا تنزع الوسم عند إعادة البيع؛ فالمشترون مدعوّون للتحقّق منه.']
    }),
    A('RUL-206', 'trader', 'duties', 'obligation', ['l0903', ''], PUB(1, '2026-09-14'), {
      en: ['You answer to the buyer for what you sell', 'As the seller, you are responsible for the conformity and safety of the goods you sell to consumers.', 'Describe goods accurately and keep purchase records — they are your evidence in a dispute.'],
      fr: ['Vous répondez de ce que vous vendez', 'En tant que vendeur, vous êtes responsable de la conformité et de la sécurité des biens vendus aux consommateurs.', 'Décrivez les produits avec exactitude et conservez vos justificatifs d’achat — ce sont vos preuves en cas de litige.'],
      ar: ['أنت مسؤول أمام المشتري عمّا تبيعه', 'بصفتك البائع، أنت مسؤول عن مطابقة وسلامة السلع التي تبيعها للمستهلكين.', 'صِف السلع بدقّة واحتفظ بوثائق الشراء — فهي دليلك عند النزاع.']
    }),
    A('RUL-207', 'trader', 'duties', 'info', ['platform', ''], PUB(1, '2026-09-14'), {
      en: ['Deposits are declared, never held', 'A deposit agreed with an importer is declared by both parties for the record. Maabar does not receive, hold, guarantee or refund it.', 'Settle payments directly with the importer and keep your own proof.'],
      fr: ['Les arrhes sont déclarées, jamais détenues', 'Les arrhes convenues avec un importateur sont déclarées par les deux parties pour mémoire. Maabar ne les reçoit, ne les conserve, ne les garantit ni ne les rembourse.', 'Réglez directement avec l’importateur et gardez vos propres preuves.'],
      ar: ['العربون يُصرَّح به ولا يُحتفظ به', 'العربون المتّفق عليه مع المستورد يصرّح به الطرفان للتوثيق. مَعْبَر لا تستلمه ولا تحتفظ به ولا تضمنه ولا تردّه.', 'سوِّ المدفوعات مباشرة مع المستورد واحتفظ بإثباتاتك.']
    }),

    /* ───────── DRAFTS (admin only — never on the public page) ───────── */
    A('RUL-112', 'importer', 'limits', 'info', ['lf2026', ''], { v: 1, status: 'review', reviewed: '', by: 'ADM-031', ok: '' }, {
      en: ['Special flat tax for micro-importers', 'A special tax regime applies to micro-importing at a rate of {tax}.', 'Your ledger in Records will apply this rate once the official text is confirmed.'],
      fr: ['Impôt forfaitaire spécial', 'Un régime fiscal spécial s’applique à l’importation de faible valeur au taux de {tax}.', 'Votre registre appliquera ce taux dès confirmation du texte officiel.'],
      ar: ['ضريبة جزافية خاصة', 'يُطبَّق على الاستيراد المصغّر نظام جبائي خاص بمعدل {tax}.', '']
    }),
    A('RUL-103', 'importer', 'limits', 'limit', ['d25170', '2, 8'], { v: 4, status: 'draft', reviewed: '', by: 'ADM-031', ok: '', draftOf: 'RUL-103' }, {
      en: ['Value per trip and trips per month', 'Goods may be worth up to {cap} per trip, with at most {trips} trips per month. Any amount above the limit is not allowed, and the excess is held by customs.', 'Maabar’s meters track value, weight and volume against these limits while you build your buying list.'],
      fr: ['Valeur par voyage et voyages par mois', 'Les marchandises peuvent valoir jusqu’à {cap} par voyage, avec au plus {trips} voyages par mois. Tout dépassement est interdit et l’excédent est retenu par la douane.', 'Les compteurs de Maabar suivent valeur, poids et volume face à ces plafonds pendant que vous préparez votre liste.'],
      ar: ['القيمة في كل تنقّل وعدد التنقّلات في الشهر', 'يمكن أن تصل قيمة السلع إلى {cap} في كل تنقّل، بحدّ أقصى {trips} تنقّلات في الشهر. ويُمنع أي تجاوز للحصّة، وتحجز الجمارك الفائض.', 'عدّادات مَعْبَر تتابع القيمة والوزن والحجم مقارنة بهذه الحدود وأنت تُعدّ قائمة الشراء.']
    })
  ];

  function fmtNum(n, lang) {
    const sep = lang === 'en' ? ',' : ' ';
    const [i, f] = String(n).split('.');
    return i.replace(/\B(?=(\d{3})+(?!\d))/g, sep) + (f ? (lang === 'fr' ? ',' : '.') + f : '');
  }
  function valueText(v, lang) {
    if (v.kind === 'money') return lang === 'ar' ? LRI + fmtNum(v.n, lang) + PDI + ' دج' : LRI + fmtNum(v.n, lang) + ' ' + ({ en: 'DZD', fr: 'DA' })[lang] + PDI;
    if (v.kind === 'pct') return LRI + fmtNum(v.n, lang) + (lang === 'fr' ? ' %' : '%') + PDI;
    return LRI + fmtNum(v.n, lang) + PDI;
  }
  function date(iso, lang) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    return lang === 'en' ? d + ' ' + MONTHS.en[m - 1] + ' ' + y : d + ' ' + MONTHS[lang][m - 1] + ' ' + y;
  }
  function fill(text, lang) {
    const all = Object.assign({}, values, { tax: pendingValues[0] });
    return String(text).replace(/\{(\w+)\}/g, (m, k) => (all[k] ? valueText(all[k], lang) : m));
  }
  function ref(r, lang) {
    const ins = instruments[r[0]];
    return ins[lang] + (r[1] ? ' · ' + ART[lang](r[1]) : '');
  }
  function source(r, lang) { return instruments[r[0]].src[lang]; }

  window.MaabarRules = { values, pendingValues, instruments, audiences, levels, levelChip, topics, articles, fill, ref, source, date, valueText, MONTHS };
})();
