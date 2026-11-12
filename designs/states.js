/* ============================================================
   MAABAR — SHARED PAGE STATES
   One pattern for the states every data screen needs besides
   "ready": loading (skeleton), empty, error, offline.
   A screen calls window.MaabarStates(this, lang, '<screen key>')
   in renderVals() as `ps`; the review-only switcher sets
   state.pst. Empty copy is per screen; the rest is shared.
   Markup: tools/add-states.js; styles: web.css (.pstate, .sk).
   ============================================================ */
(function () {
  const T = {
    en: {
      label: 'Screen state', views: ['Ready', 'Loading', 'Empty', 'Error', 'Offline'], loading: 'Loading',
      error: ['Something went wrong', 'We couldn’t load this page. Nothing was lost.', 'Try again', 'Contact support'],
      offline: ['You’re offline', 'Check your connection. What you already entered is kept on this device.', 'Retry', ''],
      empty: {
        home: ['Nothing for your area yet', 'New arrivals appear here as traders list them.', 'Browse the whole marketplace', ''],
        market: ['No products in this category yet', 'Traders add new arrivals after each trip.', 'See all categories', 'Save this search'],
        product: ['This product is no longer available', 'The trader sold out or removed the listing.', 'See similar products', 'Visit the shop'],
        seller: ['This shop has no products right now', 'Save the shop to be told when new arrivals are listed.', 'Save the shop', 'Back to the marketplace'],
        ihome: ['Plan your first trip', 'Publish a trip so traders can send you requests.', 'Create a trip', 'See what traders ask for'],
        demand: ['No demand in your categories yet', 'Add categories to see what traders are asking for.', 'Edit my categories', ''],
        trip: ['No requests on this trip yet', 'Traders see it in Discover as soon as it is published.', 'Open the demand board', ''],
        messages: ['No conversations yet', 'A conversation starts from a request or a trip.', 'Back to home', ''],
        thome: ['Start sourcing', 'Follow a trip or publish a request to receive offers.', 'Discover trips', 'Publish a request'],
        discover: ['No trips match right now', 'New trips are published every week.', 'Publish a sourcing request', 'Clear filters'],
        iprofile: ['This profile is not available', 'The importer may have paused their account.', 'Back to Discover', '']
      }
    },
    fr: {
      label: 'État de l’écran', views: ['Prêt', 'Chargement', 'Vide', 'Erreur', 'Hors ligne'], loading: 'Chargement',
      error: ['Un problème est survenu', 'Impossible de charger cette page. Rien n’a été perdu.', 'Réessayer', 'Contacter l’assistance'],
      offline: ['Vous êtes hors ligne', 'Vérifiez votre connexion. Ce que vous avez saisi est conservé sur cet appareil.', 'Réessayer', ''],
      empty: {
        home: ['Rien pour votre région pour l’instant', 'Les nouveautés apparaissent ici dès que les commerçants les publient.', 'Parcourir tout le marché', ''],
        market: ['Aucun produit dans cette catégorie pour l’instant', 'Les commerçants ajoutent des nouveautés après chaque voyage.', 'Voir toutes les catégories', 'Enregistrer cette recherche'],
        product: ['Ce produit n’est plus disponible', 'Le commerçant a tout vendu ou a retiré l’annonce.', 'Voir des produits similaires', 'Visiter la boutique'],
        seller: ['Cette boutique n’a aucun produit en ce moment', 'Enregistrez-la pour être prévenu des nouveautés.', 'Enregistrer la boutique', 'Retour au marché'],
        ihome: ['Préparez votre premier voyage', 'Publiez un voyage pour recevoir les demandes des commerçants.', 'Créer un voyage', 'Voir ce que demandent les commerçants'],
        demand: ['Aucune demande dans vos catégories pour l’instant', 'Ajoutez des catégories pour voir ce que demandent les commerçants.', 'Modifier mes catégories', ''],
        trip: ['Aucune demande sur ce voyage pour l’instant', 'Les commerçants le voient dans Découvrir dès sa publication.', 'Ouvrir le tableau de la demande', ''],
        messages: ['Aucune conversation pour l’instant', 'Une conversation commence à partir d’une demande ou d’un voyage.', 'Retour à l’accueil', ''],
        thome: ['Commencez à vous approvisionner', 'Suivez un voyage ou publiez une demande pour recevoir des offres.', 'Découvrir les voyages', 'Publier une demande'],
        discover: ['Aucun voyage ne correspond pour l’instant', 'De nouveaux voyages sont publiés chaque semaine.', 'Publier une demande', 'Effacer les filtres'],
        iprofile: ['Ce profil n’est pas disponible', 'L’importateur a peut-être suspendu son compte.', 'Retour à Découvrir', '']
      }
    },
    ar: {
      label: 'حالة الشاشة', views: ['جاهزة', 'تحميل', 'فارغة', 'خطأ', 'دون اتصال'], loading: 'جارٍ التحميل',
      error: ['حدث خطأ', 'تعذّر تحميل هذه الصفحة. لم يضِع شيء.', 'أعد المحاولة', 'اتصل بالدعم'],
      offline: ['أنت غير متصل', 'تحقّق من اتصالك. ما أدخلته محفوظ على هذا الجهاز.', 'أعد المحاولة', ''],
      empty: {
        home: ['لا شيء لمنطقتك بعد', 'يظهر الجديد هنا فور نشره من التجّار.', 'تصفّح السوق كلّه', ''],
        market: ['لا منتجات في هذه الفئة بعد', 'يضيف التجّار الجديد بعد كل رحلة.', 'كل الفئات', 'احفظ هذا البحث'],
        product: ['هذا المنتج لم يعد متوفّراً', 'نفد لدى التاجر أو سحب العرض.', 'منتجات مشابهة', 'زُر المتجر'],
        seller: ['لا منتجات في هذا المتجر حالياً', 'احفظ المتجر ليصلك تنبيه عند وصول الجديد.', 'احفظ المتجر', 'العودة إلى السوق'],
        ihome: ['خطّط لرحلتك الأولى', 'انشر رحلة لتصلك طلبات التجّار.', 'أنشئ رحلة', 'شاهد ما يطلبه التجّار'],
        demand: ['لا طلب في فئاتك بعد', 'أضف فئات لترى ما يطلبه التجّار.', 'عدّل فئاتي', ''],
        trip: ['لا طلبات على هذه الرحلة بعد', 'يراها التجّار في «اكتشف» فور نشرها.', 'افتح لوحة الطلب', ''],
        messages: ['لا محادثات بعد', 'تبدأ المحادثة من طلب أو من رحلة.', 'العودة إلى الرئيسية', ''],
        thome: ['ابدأ التوريد', 'تابع رحلة أو انشر طلباً لتصلك العروض.', 'اكتشف الرحلات', 'انشر طلباً'],
        discover: ['لا رحلات مطابقة حالياً', 'تُنشر رحلات جديدة كل أسبوع.', 'انشر طلب توريد', 'امسح التصفية'],
        iprofile: ['هذا الملف غير متاح', 'ربما أوقف المستورد حسابه مؤقتاً.', 'العودة إلى «اكتشف»', '']
      }
    }
  };
  const IDS = ['ok', 'loading', 'empty', 'error', 'offline'];
  const LOOK = {
    empty: ['var(--neutral-bg)', 'var(--ink-3)', '∅'],
    error: ['var(--prohibited-bg)', 'var(--prohibited-ink)', '!'],
    offline: ['var(--conditional-bg)', 'var(--conditional-ink)', '⇄']
  };

  window.MaabarStates = function (comp, lang, key) {
    const t = T[lang] || T.fr, cur = comp.state.pst || 'ok';
    const msg = cur === 'empty' ? (t.empty[key] || t.empty.market) : cur === 'error' ? t.error : cur === 'offline' ? t.offline : ['', '', '', ''];
    const look = LOOK[cur] || LOOK.empty;
    return {
      label: t.label,
      views: IDS.map((id, i) => ({
        id, label: t.views[i], on: cur === id,
        bg: cur === id ? 'var(--ink)' : 'var(--surface)', fg: cur === id ? 'var(--ink-on)' : 'var(--ink-2)',
        pick: () => comp.setState({ pst: id })
      })),
      ok: cur === 'ok', other: cur !== 'ok',
      loading: cur === 'loading', loadingLabel: t.loading, skel: [1, 2, 3, 4, 5, 6],
      msg: cur !== 'ok' && cur !== 'loading',
      title: msg[0], body: msg[1], cta: msg[2], alt: msg[3], hasAlt: !!msg[3],
      icBg: look[0], icFg: look[1], glyph: look[2],
      hasRef: cur === 'error', ref: 'ERR-26-7F3A'
    };
  };
})();
