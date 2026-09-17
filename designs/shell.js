/* ============================================================
   MAABAR — SHARED WEB SHELL DATA
   One source for the navigation of each surface, in EN / FR / AR,
   so every screen of the web platform shows the same header or
   sidebar. Screens call window.MaabarShell(lang, surface, active)
   inside renderVals(); icons are built at call time.
   surface: 'public' | 'importer' | 'trader'
   ============================================================ */
(function () {
  const I = {
    home: 'M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z',
    trip: 'M3 15l18-7-7 18-2.5-8z',
    demand: 'M4 19V9M10 19V5M16 19v-7M22 19H2',
    disc: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15.5 8.5l-2 5-5 2 2-5z',
    req: 'M7 4h10a1 1 0 0 1 1 1v15l-6-3-6 3V5a1 1 0 0 1 1-1z',
    cmt: 'M5 12.5l4.5 4.5L19 7M4 20h16',
    shop: 'M4 8h16l-1.2 11a1 1 0 0 1-1 .9H6.2a1 1 0 0 1-1-.9zM8.5 8a3.5 3.5 0 0 1 7 0',
    msg: 'M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.3-.6L3 21l1.7-5a8.2 8.2 0 0 1-.7-3.4 8.4 8.4 0 0 1 8.5-8.5 8.4 8.4 0 0 1 8.5 8.4z',
    rec: 'M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5',
    ver: 'M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6zM9 12l2 2 4-4',
    user: 'M12 4.8a3.7 3.7 0 1 0 0 7.4 3.7 3.7 0 0 0 0-7.4zM4.8 20a7.4 7.4 0 0 1 14.4 0',
    heart: 'M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.7c0 4.9-7 9.3-7 9.3z',
    check: 'M9 12l2 2 4-4M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z'
  };

  function icon(d, size) {
    const R = window.React;
    if (!R) return null;
    return R.createElement('svg', { width: size || 19, height: size || 19, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' },
      R.createElement('path', { d }));
  }

  const T = {
    en: {
      brand: 'Maabar', navLabel: 'Main navigation', search: 'Search products, trips, importers…', alerts: 'Notifications', langLabel: 'Language',
      roles: { importer: 'Micro-importer workspace', trader: 'Trader workspace' },
      importer: [['home', 'Home'], ['trip', 'My trip'], ['demand', 'Demand board'], ['cmt', 'Commitments'], ['msg', 'Messages', 3], ['rec', 'Records & labels'], ['ver', 'Verification']],
      trader: [['home', 'Home'], ['disc', 'Discover'], ['req', 'Sourcing requests', 2], ['cmt', 'Commitments'], ['shop', 'My shop'], ['msg', 'Messages', 5], ['rec', 'Records']],
      settings: 'Account settings',
      users: { importer: ['SB', 'Sofiane B.', 'Verified micro-importer'], trader: ['YB', 'Yacine B.', 'Verified trader · Sétif'], public: ['SL', 'Soumia L.', 'Shopper'] },
      pub: [['home', 'Home'], ['market', 'Marketplace'], ['check', 'Can I import this?']],
      pubSearch: 'Search products or shops', business: 'For importers & traders', saved: 'Saved', messages: 'Messages',
      foot: ['Maabar connects micro-importers, traders and shoppers. It does not sell, hold money, or grant the right to import.', 'Terms', 'Privacy', 'Help']
    },
    fr: {
      brand: 'Maabar', navLabel: 'Navigation principale', search: 'Chercher produits, voyages, importateurs…', alerts: 'Notifications', langLabel: 'Langue',
      roles: { importer: 'Espace micro-importateur', trader: 'Espace commerçant' },
      importer: [['home', 'Accueil'], ['trip', 'Mon voyage'], ['demand', 'Tableau de la demande'], ['cmt', 'Engagements'], ['msg', 'Messages', 3], ['rec', 'Registres et étiquettes'], ['ver', 'Vérification']],
      trader: [['home', 'Accueil'], ['disc', 'Découvrir'], ['req', 'Demandes d’appro.', 2], ['cmt', 'Engagements'], ['shop', 'Ma boutique'], ['msg', 'Messages', 5], ['rec', 'Registres']],
      settings: 'Paramètres du compte',
      users: { importer: ['SB', 'Sofiane B.', 'Micro-importateur vérifié'], trader: ['YB', 'Yacine B.', 'Commerçant vérifié · Sétif'], public: ['SL', 'Soumia L.', 'Acheteuse'] },
      pub: [['home', 'Accueil'], ['market', 'Place de marché'], ['check', 'Puis-je importer ceci ?']],
      pubSearch: 'Chercher un produit ou une boutique', business: 'Importateurs et commerçants', saved: 'Enregistrés', messages: 'Messages',
      foot: ['Maabar relie micro-importateurs, commerçants et acheteurs. Elle ne vend pas, ne détient pas d’argent et n’accorde pas le droit d’importer.', 'Conditions', 'Confidentialité', 'Aide']
    },
    ar: {
      brand: 'مَعْبَر', navLabel: 'التنقّل الرئيسي', search: 'ابحث عن منتجات، رحلات، مستوردين…', alerts: 'التنبيهات', langLabel: 'اللغة',
      roles: { importer: 'فضاء المستورد المصغّر', trader: 'فضاء التاجر' },
      importer: [['home', 'الرئيسية'], ['trip', 'رحلتي'], ['demand', 'لوحة الطلب'], ['cmt', 'الالتزامات'], ['msg', 'الرسائل', 3], ['rec', 'السجلّات والوسم'], ['ver', 'التحقّق']],
      trader: [['home', 'الرئيسية'], ['disc', 'اكتشف'], ['req', 'طلبات التوريد', 2], ['cmt', 'الالتزامات'], ['shop', 'متجري'], ['msg', 'الرسائل', 5], ['rec', 'السجلّات']],
      settings: 'إعدادات الحساب',
      users: { importer: ['س ب', 'سفيان ب.', 'مستورد مصغّر مُتحقَّق'], trader: ['ي ب', 'ياسين ب.', 'تاجر مُتحقَّق · سطيف'], public: ['س ل', 'سمية ل.', 'مشترية'] },
      pub: [['home', 'الرئيسية'], ['market', 'السوق'], ['check', 'هل يمكنني استيراد هذا؟']],
      pubSearch: 'ابحث عن منتج أو متجر', business: 'للمستوردين والتجّار', saved: 'المحفوظات', messages: 'الرسائل',
      foot: ['مَعْبَر تربط المستوردين المصغّرين بالتجّار والمشترين. لا تبيع، ولا تحتفظ بأموال، ولا تمنح حقّ الاستيراد.', 'الشروط', 'الخصوصية', 'المساعدة']
    }
  };

  const ROLE_TINT = {
    importer: ['var(--role-importer-bg)', 'var(--role-importer-ink)'],
    trader: ['var(--role-trader-bg)', 'var(--role-trader-ink)'],
    public: ['var(--role-consumer-bg)', 'var(--role-consumer-ink)']
  };

  window.MaabarShell = function (lang, surface, active) {
    const t = T[lang] || T.fr;
    const [bg, fg] = ROLE_TINT[surface] || ROLE_TINT.public;
    const u = t.users[surface] || t.users.public;
    const items = surface === 'public' ? t.pub : t[surface];
    return {
      brand: t.brand, navLabel: t.navLabel, search: t.search, alerts: t.alerts, langLabel: t.langLabel,
      role: t.roles[surface] || '', roleBg: bg, roleFg: fg,
      userInitials: u[0], userName: u[1], userRole: u[2],
      current: (items.find(x => x[0] === active) || [0, ''])[1],
      settings: t.settings, business: t.business, pubSearch: t.pubSearch, saved: t.saved, messages: t.messages,
      foot: t.foot[0], terms: t.foot[1], privacy: t.foot[2], help: t.foot[3],
      nav: items.map(([id, label, badge]) => ({
        id, label, on: id === active,
        hasBadge: !!badge, badge: badge ? String(badge) : '',
        icon: icon(I[id] || I.home)
      })),
      icSearch: icon('M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.5-3.5', 17),
      icBell: icon('M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6zM10.5 19.5a2 2 0 0 0 3 0', 18),
      icHeart: icon(I.heart, 18),
      icMsg: icon(I.msg, 18),
      icSettings: icon('M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z', 17)
    };
  };
})();
