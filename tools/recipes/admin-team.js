/* Admin "Team & roles" — where the superadmin creates admins and sub-admins and gives each one
   its roles. One role per function (docs/architecture/AUTHORIZATION-MATRIX.md §5):
   the superadmin grants roles but holds no deciding role; nobody edits their own roles;
   the last active superadmin cannot be removed. Non-superadmins get a read-only view. */
const N = require('../newscreen.js');

const CSS = `
.q{width:100%;display:flex;align-items:center;gap:9px;padding:9px 11px;border:0;background:transparent;color:inherit;text-align:start;cursor:pointer;border-radius:var(--r-sm);font-size:var(--t-sm)}
.q:hover{background:var(--surface-3)}
.panel{background:var(--surface);border:1px solid var(--rule);border-radius:var(--r)}
.ph{padding:10px 13px;border-bottom:1px solid var(--rule);font-size:var(--t-sm);font-weight:600;display:flex;justify-content:space-between;align-items:center;gap:10px}
.pb{padding:13px}
.fld{display:block;font-size:var(--t-xs);color:var(--ink-3);margin-bottom:4px}
.in{width:100%;height:36px;padding:0 10px;border:1px solid var(--rule-strong);border-radius:var(--r-sm);background:var(--surface);font:inherit;font-size:var(--t-sm);color:inherit}
.seg{display:inline-flex;border:1px solid var(--rule-strong);border-radius:var(--r-sm);overflow:hidden}
.seg button{height:30px;padding:0 12px;border:0;border-inline-start:1px solid var(--rule);font:inherit;font-size:var(--t-xs);font-weight:500;cursor:pointer}
.seg button:first-child{border-inline-start:0}
.act{height:38px;padding:0 16px;border-radius:var(--r-sm);font:inherit;font-size:var(--t-sm);font-weight:600;cursor:pointer;border:1px solid var(--rule-strong);background:transparent;color:inherit}
.act-p{background:var(--ink);color:var(--ink-on);border-color:var(--ink)}
.act-d{color:var(--prohibited-ink);border-color:var(--prohibited-bd)}
.act:disabled{opacity:.45;cursor:not-allowed}
.blk{padding:10px 12px;border-radius:var(--r-sm);background:var(--surface-2);border:1px solid var(--rule-faint);font-size:var(--t-sm);line-height:1.6;color:var(--ink-2)}
.tt{width:100%;border-collapse:collapse;font-size:var(--t-sm)}
.tt th{font-size:var(--t-xs);font-weight:500;color:var(--ink-3);text-align:start;padding:9px 13px;border-bottom:1px solid var(--rule);white-space:nowrap}
.tt td{padding:11px 13px;border-bottom:1px solid var(--rule-faint);vertical-align:middle}
.tt tr:last-child td{border-bottom:0}
.tt tbody tr{cursor:pointer}
.tt tbody tr:hover td{background:var(--surface-2)}
.tt tbody tr[aria-selected="true"] td{background:var(--neutral-bg)}
.who{display:flex;align-items:center;gap:10px}
.avt{flex:none;width:30px;height:30px;border-radius:50%;background:var(--surface-3);display:grid;place-items:center;font-size:11px;font-weight:600;color:var(--ink-2)}
.rl{display:flex;gap:10px;align-items:flex-start;padding:9px 0;border-bottom:1px solid var(--rule-faint);cursor:pointer}
.rl:last-child{border-bottom:0}
.rl input{flex:none;width:16px;height:16px;margin-top:2px;accent-color:var(--ink)}
.rl .n{display:block;font-size:var(--t-sm);font-weight:500}
.rl .d{display:block;font-size:var(--t-xs);color:var(--ink-3);margin-top:2px;line-height:1.5}
.rl[data-off="true"]{cursor:default;opacity:.6}
.grp{font-size:var(--t-micro);color:var(--ink-3);padding:10px 0 2px}
.hist{padding:8px 0;border-bottom:1px solid var(--rule-faint);font-size:var(--t-sm)}
.hist:last-child{border-bottom:0}
.chips{display:flex;flex-wrap:wrap;gap:5px}
.chips .chip{height:22px;font-size:var(--t-micro);padding:0 8px}
.err{font-size:var(--t-xs);color:var(--prohibited-ink)}
`;

const RAIL = `<aside style="flex:none;width:216px;background:var(--surface);border-inline-end:1px solid var(--rule);display:flex;flex-direction:column">
<div style="padding:13px 14px;border-bottom:1px solid var(--rule)">
<div style="display:flex;align-items:center;gap:8px">
<div style="flex:1;font-family:var(--font-display);font-weight:600;font-size:16px">{{ t.brand }}</div>
<div role="group" aria-label="{{ t.langLabel }}" style="display:flex;border:1px solid var(--rule-strong);border-radius:var(--r-sm);overflow:hidden;flex:none">
<sc-for list="{{ langs }}" as="l" hint-placeholder-count="3">
<button type="button" onClick="{{ l.pick }}" aria-pressed="{{ l.on }}" style="height:24px;padding:0 8px;border:0;background:{{ l.bg }};color:{{ l.fg }};font-size:var(--t-micro);font-weight:500;cursor:pointer">{{ l.short }}</button>
</sc-for>
</div>
</div>
<div style="font-size:var(--t-xs);color:var(--ink-3);margin-top:2px">{{ t.opsCenter }}</div>
</div>
<div style="padding:11px 8px;flex:1">
<sc-for list="{{ groups }}" as="g" hint-placeholder-count="4">
<div style="margin-bottom:13px">
<div style="font-size:var(--t-micro);color:var(--ink-3);padding:0 11px 6px">{{ g.label }}</div>
<sc-for list="{{ g.items }}" as="q" hint-placeholder-count="3">
<button type="button" aria-current="{{ q.on }}" class="q" style="background:{{ q.bg }};font-weight:{{ q.fw }}">
<span aria-hidden="true" style="flex:none;width:6px;height:6px;border-radius:50%;background:{{ q.dot }}"></span>
<span style="flex:1;min-width:0">{{ q.label }}</span>
<span class="num" style="flex:none;font-size:var(--t-xs);color:{{ q.nFg }};font-weight:600"><bdi>{{ q.n }}</bdi></span>
</button>
</sc-for>
</div>
</sc-for>
</div>
<div style="padding:11px 14px;border-top:1px solid var(--rule);display:flex;align-items:center;gap:8px">
<span aria-hidden="true" style="flex:none;width:26px;height:26px;border-radius:50%;background:var(--role-trader-bg);display:grid;place-items:center;font-size:10px;font-weight:600;color:var(--role-trader-ink)">{{ me.initials }}</span>
<div style="flex:1;min-width:0">
<div style="font-size:var(--t-xs);font-weight:500">{{ me.name }}</div>
<div style="font-size:var(--t-micro);color:var(--ink-3)">{{ me.role }}</div>
</div>
</div>
</aside>`;

const ROLEBAR = `<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--surface);border:1px dashed var(--rule-strong);border-radius:var(--r-sm)">
<span style="font-size:var(--t-xs);color:var(--ink-3)">{{ t.viewAs }}</span>
<div class="seg">
<sc-for list="{{ viewers }}" as="ro" hint-placeholder-count="2">
<button type="button" onClick="{{ ro.pick }}" aria-pressed="{{ ro.on }}" style="background:{{ ro.bg }};color:{{ ro.fg }}">{{ ro.label }}</button>
</sc-for>
</div>
<span style="flex:1"></span>
<span class="ref">{{ me.id }}</span>
</div>`;

const HEAD = `<div style="display:flex;align-items:center;gap:12px">
<div style="flex:1;min-width:0">
<h1 style="margin:0;font-size:var(--t-h1);font-weight:600">{{ t.title }}</h1>
<div class="num" style="font-size:var(--t-xs);color:var(--ink-2);margin-top:5px">{{ summary }}</div>
</div>
<sc-if value="{{ isSuper }}" hint-placeholder-val="{{ true }}"><button type="button" class="act act-p" onClick="{{ openInvite }}">{{ t.invite }}</button></sc-if>
</div>`;

const TABLE = `<div class="panel" style="overflow:hidden"><table class="tt">
<thead><tr><sc-for list="{{ t.cols }}" as="h" hint-placeholder-count="5"><th>{{ h }}</th></sc-for></tr></thead>
<tbody>
<sc-for list="{{ rows }}" as="r" hint-placeholder-count="8">
<tr onClick="{{ r.pick }}" aria-selected="{{ r.on }}">
<td><span class="who"><span class="avt" aria-hidden="true">{{ r.initials }}</span><span><span style="display:block;font-weight:500">{{ r.name }}</span><span class="ref">{{ r.id }}</span></span></span></td>
<td><span class="chips"><sc-for list="{{ r.roles }}" as="c" hint-placeholder-count="2"><span class="chip {{ c.cls }}">{{ c.label }}</span></sc-for></span></td>
<td><span class="chip {{ r.stChip }}" style="height:22px;font-size:var(--t-micro);padding:0 8px">{{ r.status }}</span></td>
<td style="color:{{ r.mfaFg }}">{{ r.mfa }}</td>
<td class="num" style="color:var(--ink-2);white-space:nowrap">{{ r.last }}</td>
</tr>
</sc-for>
</tbody>
</table></div>`;

const DETAIL = `<sc-if value="{{ showDetail }}" hint-placeholder-val="{{ true }}">
<div style="display:flex;flex-direction:column;gap:12px">
<div class="panel"><div class="pb" style="display:flex;align-items:center;gap:12px">
<span class="avt" style="width:40px;height:40px;font-size:13px" aria-hidden="true">{{ cur.initials }}</span>
<div style="flex:1;min-width:0"><div style="font-weight:600">{{ cur.name }}</div><div style="display:flex;gap:8px;align-items:center;margin-top:3px"><span class="ref">{{ cur.id }}</span><span style="font-size:var(--t-xs);color:var(--ink-3)"><bdi>{{ cur.contact }}</bdi></span></div></div>
<span class="chip {{ cur.stChip }}">{{ cur.status }}</span>
</div></div>

<div class="panel"><div class="ph"><span>{{ t.rolesTitle }}</span><span class="num" style="font-weight:400;font-size:var(--t-xs);color:var(--ink-3)">{{ cur.roleCount }}</span></div><div class="pb" style="padding-block:4px 10px">
<sc-for list="{{ roleGroups }}" as="g" hint-placeholder-count="4">
<div class="grp">{{ g.label }}</div>
<sc-for list="{{ g.items }}" as="ro" hint-placeholder-count="2">
<label class="rl" data-off="{{ ro.off }}"><input type="checkbox" checked="{{ ro.on }}" onChange="{{ ro.toggle }}" disabled="{{ ro.off }}"><span><span class="n">{{ ro.name }}</span><span class="d">{{ ro.desc }}</span></span></label>
</sc-for>
</sc-for>
</div></div>

<div class="panel"><div class="pb" style="display:flex;flex-direction:column;gap:9px">
<sc-for list="{{ actions }}" as="a" hint-placeholder-count="2">
<button type="button" class="act {{ a.cls }}" onClick="{{ a.go }}" disabled="{{ a.off }}">{{ a.label }}</button>
</sc-for>
<sc-if value="{{ hasNote }}" hint-placeholder-val="{{ false }}"><div class="blk">{{ note }}</div></sc-if>
</div></div>

<div class="panel"><div class="ph"><span>{{ t.changes }}</span></div><div class="pb" style="padding-block:4px">
<sc-for list="{{ history }}" as="h" hint-placeholder-count="3">
<div class="hist"><div style="display:flex;gap:8px;align-items:baseline"><span style="flex:1">{{ h.what }}</span><span class="num" style="font-size:var(--t-micro);color:var(--ink-3);white-space:nowrap">{{ h.when }}</span></div><div class="ref" style="margin-top:2px">{{ h.by }}</div></div>
</sc-for>
</div></div>
</div>
</sc-if>`;

const INVITE = `<sc-if value="{{ showInvite }}" hint-placeholder-val="{{ false }}">
<div style="display:flex;flex-direction:column;gap:12px">
<div class="panel"><div class="ph"><span>{{ t.inviteTitle }}</span><button type="button" class="act" style="height:28px;padding:0 10px;font-size:var(--t-xs)" onClick="{{ closeInvite }}">{{ t.cancel }}</button></div><div class="pb" style="display:flex;flex-direction:column;gap:10px">
<label><span class="fld">{{ t.fName }}</span><input class="in" value="{{ inv.name }}" onChange="{{ inv.onName }}"></label>
<label><span class="fld">{{ t.fEmail }}</span><input class="in" dir="ltr" value="{{ inv.email }}" onChange="{{ inv.onEmail }}" placeholder="name@maabar.dz"></label>
<label><span class="fld">{{ t.fPhone }}</span><input class="in num" dir="ltr" value="{{ inv.phone }}" onChange="{{ inv.onPhone }}" placeholder="+213 5 00 00 00 00"></label>
</div></div>

<div class="panel"><div class="ph"><span>{{ t.rolesTitle }}</span><span class="num" style="font-weight:400;font-size:var(--t-xs);color:var(--ink-3)">{{ inv.roleCount }}</span></div><div class="pb" style="padding-block:4px 10px">
<sc-for list="{{ invGroups }}" as="g" hint-placeholder-count="4">
<div class="grp">{{ g.label }}</div>
<sc-for list="{{ g.items }}" as="ro" hint-placeholder-count="2">
<label class="rl"><input type="checkbox" checked="{{ ro.on }}" onChange="{{ ro.toggle }}"><span><span class="n">{{ ro.name }}</span><span class="d">{{ ro.desc }}</span></span></label>
</sc-for>
</sc-for>
</div></div>

<div class="panel"><div class="pb" style="display:flex;flex-direction:column;gap:9px">
<button type="button" class="act act-p" onClick="{{ inv.send }}" disabled="{{ inv.off }}">{{ t.sendInvite }}</button>
<sc-if value="{{ inv.hasErr }}" hint-placeholder-val="{{ false }}"><span class="err">{{ inv.err }}</span></sc-if>
<div class="blk">{{ t.inviteNote }}</div>
</div></div>
</div>
</sc-if>`;

const TEMPLATE = `<div ref="{{ rootRef }}" dir="rtl" lang="ar" class="tier-admin" style="min-height:100vh">
<div style="display:flex;min-height:100vh">
${RAIL}
<main style="flex:1;min-width:0;padding:14px;display:flex;flex-direction:column;gap:12px;overflow:auto">
${ROLEBAR}
${HEAD}
<sc-if value="{{ isSuper }}" hint-placeholder-val="{{ true }}">
<div style="display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:12px;align-items:start">
${TABLE}
<div>
${DETAIL}
${INVITE}
</div>
</div>
</sc-if>
<sc-if value="{{ isOther }}" hint-placeholder-val="{{ false }}">
<div style="display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:12px;align-items:start">
<div class="panel"><div class="pb" style="padding:40px 28px;text-align:center">
<div style="font-size:var(--t-h3);font-weight:600;margin-bottom:6px">{{ t.noAccessT }}</div>
<div style="color:var(--ink-2);font-size:var(--t-sm);margin-bottom:16px">{{ t.noAccessB }}</div>
<button type="button" class="act">{{ t.askAccess }}</button>
</div></div>
<div class="panel"><div class="ph"><span>{{ t.yourRoles }}</span></div><div class="pb" style="padding-block:4px 10px">
<sc-for list="{{ myRoles }}" as="ro" hint-placeholder-count="1">
<div class="rl" style="cursor:default"><span><span class="n">{{ ro.name }}</span><span class="d">{{ ro.desc }}</span></span></div>
</sc-for>
</div></div>
</div>
</sc-if>
<div style="font-size:var(--t-micro);color:var(--ink-3)">{{ t.audit }}</div>
</main>
</div>
</div>`;

const LOGIC = `
  count(n, t, f) {
    if (t.dir === 'rtl') {
      const m = n % 100;
      if (n === 1) return f.one;
      if (n === 2) return f.two;
      if (m >= 3 && m <= 10) return this.fmt(n, t.sep) + ' ' + f.few;
      return this.fmt(n, t.sep) + ' ' + f.many;
    }
    return this.fmt(n, t.sep) + ' ' + (n === 1 ? f.one : f.many);
  }

  L = {
    ar: {
      dir: 'rtl', short: 'ع', label: 'ع', langLabel: 'اللغة', sep: ' ',
      brand: 'مَعْبَر', opsCenter: 'مركز العمليات',
      groups: [
        ['الثقة والسلامة', ['طلبات التحقّق', 'مخاطرة', 'إشراف المحتوى', 'نزاعات']],
        ['الامتثال', ['أصناف تحتاج مراجعة', 'صفحات القوانين']],
        ['الفوترة', ['تأكيد اشتراكات']],
        ['الإدارة', ['الفريق والأدوار']]
      ],
      title: 'الفريق والأدوار', invite: '+ دعوة مشرف',
      admins: { one: 'مشرف واحد', two: 'مشرفان', few: 'مشرفين', many: 'مشرفاً' },
      sumActive: 'نشِط', sumInvited: 'دعوة معلّقة', sumSusp: 'موقوف',
      viewAs: 'العرض بصفة', viewers: ['مشرف عام', 'مشرف آخر'],
      cols: ['المشرف', 'الأدوار', 'الحالة', 'التحقّق بخطوتين', 'آخر نشاط'],
      status: { active: 'نشِط', invited: 'مدعوّ', suspended: 'موقوف' },
      mfaOn: 'مفعّل', mfaOff: 'غير مفعّل بعد',
      rolesTitle: 'الأدوار', roleCount: (n) => n + ' محدَّدة',
      roleGroups: ['الثقة والسلامة', 'الامتثال والقوانين', 'الفوترة', 'الإدارة'],
      roles: {
        trust_safety: ['التحقّق والمخاطر', 'يراجع وثائق التحقّق وإشارات المخاطر.'],
        moderation: ['إشراف المحتوى', 'يراجع العروض والصور والبلاغات. لا يرى وثائق الهوية.'],
        disputes: ['النزاعات', 'يبتّ في النزاعات بناءً على ملف الأدلّة.'],
        compliance: ['مراجعة الأصناف', 'يصنّف السلع: مسموحة، بشرط، ممنوعة.'],
        rules_editor: ['محرّر القوانين · مشرف فرعي', 'يكتب مواد صفحات القوانين ويرسلها للمراجعة. لا ينشر.'],
        regulatory: ['مُصادِق تنظيمي', 'يصادق على القوانين والقيم وينشرها. لا يصادق على ما كتبه.'],
        billing: ['الفوترة', 'يؤكّد مدفوعات الاشتراك فقط.'],
        superadmin: ['مشرف عام', 'يدعو المشرفين ويمنح الأدوار. لا يبتّ في الملفات ولا ينشر القوانين.']
      },
      act: { save: 'احفظ الأدوار', suspend: 'أوقف الحساب', reinstate: 'أعِد تفعيل الحساب', resend: 'أعِد إرسال الدعوة', revoke: 'ألغِ الدعوة' },
      notes: { self: 'لا يمكنك تغيير أدوارك. اطلب ذلك من مشرف عام آخر.', lastSuper: 'هذا آخر مشرف عام نشِط. عيّن مشرفاً عاماً آخر أولاً.', none: 'اختر دوراً واحداً على الأقل.', exclusive: 'المشرف العام لا يجمع أدواراً أخرى.', saved: 'تم الحفظ. سيُبلَّغ المشرف بالتغيير.' },
      changes: 'آخر التغييرات',
      hist: { granted: 'مُنح دور: ', removed: 'سُحب دور: ', invited: 'أُرسلت الدعوة', suspended: 'أُوقف الحساب', joined: 'فعّل الحساب والتحقّق بخطوتين' },
      inviteTitle: 'دعوة مشرف', cancel: 'إلغاء', fName: 'الاسم الكامل', fEmail: 'البريد المهني', fPhone: 'الهاتف (للرمز)',
      sendInvite: 'أرسل الدعوة', inviteNote: 'الدعوة صالحة 48 ساعة. التحقّق بخطوتين إلزامي عند أول دخول.',
      invErr: { name: 'أدخل الاسم.', email: 'أدخل بريداً مهنياً صحيحاً.', role: 'اختر دوراً واحداً على الأقل.' },
      noAccessT: 'إدارة الفريق للمشرف العام فقط', noAccessB: 'يمكنك رؤية أدوارك.', askAccess: 'اطلب تغيير أدوارك', yourRoles: 'أدوارك',
      audit: 'كل دعوة وكل تغيير في الأدوار يُسجَّل باسم صاحبه وتوقيته.',
      dates: ['اليوم 09:12', 'أمس', '9 نوفمبر', '3 نوفمبر', '28 أكتوبر', '—'],
      people: { 'ADM-001': ['ن س', 'نورة س.'], 'ADM-002': ['س ت', 'سمير ت.'], 'ADM-007': ['ك م', 'كريم م.'], 'ADM-012': ['أ ب', 'أمين ب.'], 'ADM-018': ['ي د', 'ياسمين د.'], 'ADM-024': ['ف ح', 'فريد ح.'], 'ADM-031': ['ل ك', 'لينا ك.'], 'ADM-036': ['ر ع', 'رانيا ع.'] }
    },
    fr: {
      dir: 'ltr', short: 'FR', label: 'FR', langLabel: 'Langue', sep: ' ',
      brand: 'Maabar', opsCenter: 'Centre des opérations',
      groups: [
        ['Confiance et sécurité', ['Demandes de vérification', 'Risque', 'Modération', 'Litiges']],
        ['Conformité', ['Articles à examiner', 'Pages des règles']],
        ['Facturation', ['Confirmation d’abonnements']],
        ['Administration', ['Équipe et rôles']]
      ],
      title: 'Équipe et rôles', invite: '+ Inviter un admin',
      admins: { one: 'admin', many: 'admins' },
      sumActive: 'actifs', sumInvited: 'invitation en attente', sumSusp: 'suspendu',
      viewAs: 'Voir en tant que', viewers: ['Super-admin', 'Autre admin'],
      cols: ['Admin', 'Rôles', 'Statut', 'Double authentification', 'Dernière activité'],
      status: { active: 'Actif', invited: 'Invité', suspended: 'Suspendu' },
      mfaOn: 'Activée', mfaOff: 'Pas encore activée',
      rolesTitle: 'Rôles', roleCount: (n) => n + ' sélectionné(s)',
      roleGroups: ['Confiance et sécurité', 'Conformité et règles', 'Facturation', 'Administration'],
      roles: {
        trust_safety: ['Vérification et risque', 'Examine les documents de vérification et les signaux de risque.'],
        moderation: ['Modération', 'Examine annonces, images et signalements. Ne voit pas les pièces d’identité.'],
        disputes: ['Litiges', 'Tranche les litiges sur la base du dossier de preuves.'],
        compliance: ['Examen des articles', 'Classe les marchandises : autorisée, sous condition, interdite.'],
        rules_editor: ['Rédacteur des règles · sous-admin', 'Rédige les articles des pages Règles et les soumet. Ne publie pas.'],
        regulatory: ['Approbateur réglementaire', 'Approuve et publie règles et valeurs. Jamais ses propres textes.'],
        billing: ['Facturation', 'Confirme uniquement les paiements d’abonnement.'],
        superadmin: ['Super-admin', 'Invite les admins et attribue les rôles. Ne décide d’aucun dossier, ne publie aucune règle.']
      },
      act: { save: 'Enregistrer les rôles', suspend: 'Suspendre le compte', reinstate: 'Réactiver le compte', resend: 'Renvoyer l’invitation', revoke: 'Annuler l’invitation' },
      notes: { self: 'Vous ne pouvez pas modifier vos propres rôles. Demandez à un autre super-admin.', lastSuper: 'C’est le dernier super-admin actif. Nommez-en un autre d’abord.', none: 'Choisissez au moins un rôle.', exclusive: 'Le super-admin ne cumule aucun autre rôle.', saved: 'Enregistré. L’admin est informé du changement.' },
      changes: 'Derniers changements',
      hist: { granted: 'Rôle attribué : ', removed: 'Rôle retiré : ', invited: 'Invitation envoyée', suspended: 'Compte suspendu', joined: 'Compte et double authentification activés' },
      inviteTitle: 'Inviter un admin', cancel: 'Annuler', fName: 'Nom complet', fEmail: 'E-mail professionnel', fPhone: 'Téléphone (pour le code)',
      sendInvite: 'Envoyer l’invitation', inviteNote: 'Invitation valable 48 h. Double authentification obligatoire à la première connexion.',
      invErr: { name: 'Saisissez le nom.', email: 'Saisissez un e-mail professionnel valide.', role: 'Choisissez au moins un rôle.' },
      noAccessT: 'La gestion de l’équipe est réservée au super-admin', noAccessB: 'Vous pouvez consulter vos rôles.', askAccess: 'Demander un changement de rôles', yourRoles: 'Vos rôles',
      audit: 'Chaque invitation et chaque changement de rôle est enregistré avec son auteur et l’heure.',
      dates: ['Aujourd’hui 09:12', 'Hier', '9 novembre', '3 novembre', '28 octobre', '—'],
      people: { 'ADM-001': ['NS', 'Nora S.'], 'ADM-002': ['ST', 'Samir T.'], 'ADM-007': ['KM', 'Karim M.'], 'ADM-012': ['AB', 'Amine B.'], 'ADM-018': ['YD', 'Yasmine D.'], 'ADM-024': ['FH', 'Farid H.'], 'ADM-031': ['LK', 'Lina K.'], 'ADM-036': ['RO', 'Rania O.'] }
    },
    en: {
      dir: 'ltr', short: 'EN', label: 'EN', langLabel: 'Language', sep: ',',
      brand: 'Maabar', opsCenter: 'Operations centre',
      groups: [
        ['Trust & Safety', ['Verification requests', 'Risk', 'Content moderation', 'Disputes']],
        ['Compliance', ['Items needing review', 'Rules pages']],
        ['Billing', ['Subscription confirmations']],
        ['Administration', ['Team & roles']]
      ],
      title: 'Team & roles', invite: '+ Invite admin',
      admins: { one: 'admin', many: 'admins' },
      sumActive: 'active', sumInvited: 'invitation pending', sumSusp: 'suspended',
      viewAs: 'Viewing as', viewers: ['Superadmin', 'Another admin'],
      cols: ['Admin', 'Roles', 'Status', 'Two-step sign-in', 'Last active'],
      status: { active: 'Active', invited: 'Invited', suspended: 'Suspended' },
      mfaOn: 'On', mfaOff: 'Not set up yet',
      rolesTitle: 'Roles', roleCount: (n) => n + ' selected',
      roleGroups: ['Trust & Safety', 'Compliance & rules', 'Billing', 'Administration'],
      roles: {
        trust_safety: ['Verification & risk', 'Reviews verification documents and risk signals.'],
        moderation: ['Content moderation', 'Reviews listings, images and reports. Cannot see identity documents.'],
        disputes: ['Disputes', 'Decides disputes from the evidence file.'],
        compliance: ['Item review', 'Classifies goods: allowed, conditional, prohibited.'],
        rules_editor: ['Rules editor · sub-admin', 'Writes Rules-page articles and submits them. Cannot publish.'],
        regulatory: ['Regulatory approver', 'Approves and publishes rules and values. Never their own drafts.'],
        billing: ['Billing', 'Confirms subscription payments only.'],
        superadmin: ['Superadmin', 'Invites admins and assigns roles. Decides no cases and publishes no rules.']
      },
      act: { save: 'Save roles', suspend: 'Suspend account', reinstate: 'Reinstate account', resend: 'Resend invitation', revoke: 'Cancel invitation' },
      notes: { self: 'You can’t change your own roles. Ask another superadmin.', lastSuper: 'This is the last active superadmin. Appoint another one first.', none: 'Choose at least one role.', exclusive: 'A superadmin holds no other role.', saved: 'Saved. The admin is told about the change.' },
      changes: 'Recent changes',
      hist: { granted: 'Role granted: ', removed: 'Role removed: ', invited: 'Invitation sent', suspended: 'Account suspended', joined: 'Account and two-step sign-in activated' },
      inviteTitle: 'Invite an admin', cancel: 'Cancel', fName: 'Full name', fEmail: 'Work email', fPhone: 'Phone (for the code)',
      sendInvite: 'Send invitation', inviteNote: 'The invitation is valid for 48 hours. Two-step sign-in is required at first sign-in.',
      invErr: { name: 'Enter the name.', email: 'Enter a valid work email.', role: 'Choose at least one role.' },
      noAccessT: 'Only superadmins manage the team', noAccessB: 'You can see your own roles.', askAccess: 'Ask for a role change', yourRoles: 'Your roles',
      audit: 'Every invitation and role change is recorded with who did it and when.',
      dates: ['Today 09:12', 'Yesterday', '9 November', '3 November', '28 October', '—'],
      people: { 'ADM-001': ['NS', 'Nora S.'], 'ADM-002': ['ST', 'Samir T.'], 'ADM-007': ['KM', 'Karim M.'], 'ADM-012': ['AB', 'Amine B.'], 'ADM-018': ['YD', 'Yasmine D.'], 'ADM-024': ['FH', 'Farid H.'], 'ADM-031': ['LK', 'Lina K.'], 'ADM-036': ['RO', 'Rania O.'] }
    }
  };

  GROUPS = [
    [{ id: 'ver', n: 14, dot: 'var(--conditional)' }, { id: 'risk', n: 6, dot: 'var(--prohibited)' }, { id: 'mod', n: 23, dot: 'var(--conditional)' }, { id: 'dis', n: 4, dot: 'var(--prohibited)' }],
    [{ id: 'rev', n: 9, dot: 'var(--conditional)' }, { id: 'rul', n: 2, dot: 'var(--ink-3)' }],
    [{ id: 'bil', n: 7, dot: 'var(--ink-3)' }],
    [{ id: 'team', n: 8, dot: 'var(--ink-3)' }]
  ];
  ROLE_GROUPS = [['trust_safety', 'moderation', 'disputes'], ['compliance', 'rules_editor', 'regulatory'], ['billing'], ['superadmin']];
  /* id, roles, status, mfa, last-active index into t.dates, contact, history [kind, role?, date index, by] */
  TEAM = [
    { id: 'ADM-001', roles: ['superadmin'], status: 'active', mfa: true, last: 0, contact: 'nora.s@maabar.dz', hist: [['joined', null, 4, 'ADM-001']] },
    { id: 'ADM-002', roles: ['superadmin'], status: 'active', mfa: true, last: 1, contact: 'samir.t@maabar.dz', hist: [['granted', 'superadmin', 4, 'ADM-001']] },
    { id: 'ADM-007', roles: ['regulatory', 'compliance'], status: 'active', mfa: true, last: 0, contact: 'karim.m@maabar.dz', hist: [['granted', 'regulatory', 3, 'ADM-001'], ['granted', 'compliance', 4, 'ADM-001']] },
    { id: 'ADM-012', roles: ['trust_safety'], status: 'active', mfa: true, last: 0, contact: 'amine.b@maabar.dz', hist: [['granted', 'trust_safety', 4, 'ADM-002']] },
    { id: 'ADM-018', roles: ['moderation', 'disputes'], status: 'active', mfa: true, last: 1, contact: 'yasmine.d@maabar.dz', hist: [['granted', 'disputes', 2, 'ADM-001'], ['granted', 'moderation', 4, 'ADM-001']] },
    { id: 'ADM-031', roles: ['rules_editor'], status: 'active', mfa: true, last: 0, contact: 'lina.k@maabar.dz', hist: [['joined', null, 3, 'ADM-031'], ['granted', 'rules_editor', 3, 'ADM-001']] },
    { id: 'ADM-024', roles: ['billing'], status: 'suspended', mfa: true, last: 3, contact: 'farid.h@maabar.dz', hist: [['suspended', null, 2, 'ADM-002'], ['granted', 'billing', 4, 'ADM-001']] },
    { id: 'ADM-036', roles: ['rules_editor'], status: 'invited', mfa: false, last: 5, contact: 'rania.o@maabar.dz', hist: [['invited', null, 1, 'ADM-001']] }
  ];
  ROLE_CHIP = { superadmin: 'chip-brand' };
  ST_CHIP = { active: 'chip-verified', invited: 'chip-brand', suspended: 'chip-conditional' };

  /* superadmin is exclusive: it never combines with a deciding role */
  toggled(list, id) {
    if (list.includes(id)) return list.filter(x => x !== id);
    if (id === 'superadmin') return ['superadmin'];
    return list.filter(x => x !== 'superadmin').concat(id);
  }

  renderVals() {
    const s = this.state, lang = s.lang, t = this.L[lang];
    const meId = s.viewer === 'super' ? 'ADM-001' : 'ADM-012';
    const team = this.TEAM.map(a => Object.assign({}, a, { status: s.status[a.id] || a.status }));
    const saved = id => s.roles[id] || this.TEAM.find(a => a.id === id).roles;
    const cur = team.find(a => a.id === s.sel) || team[0];
    const draft = s.draft[cur.id] || saved(cur.id);
    const same = (a, b) => a.length === b.length && a.every(x => b.includes(x));
    const dirty = !same(draft, saved(cur.id));
    const isSelf = cur.id === meId;
    const activeSupers = team.filter(a => a.status === 'active' && saved(a.id).includes('superadmin'));
    const isLastSuper = saved(cur.id).includes('superadmin') && cur.status === 'active' && activeSupers.length === 1;
    const person = id => (t.people[id] || ['', id])[1];
    const roleName = r => t.roles[r][0];

    let note = '';
    if (isSelf) note = t.notes.self;
    else if (isLastSuper) note = t.notes.lastSuper;
    else if (!draft.length) note = t.notes.none;
    else if (s.flash === cur.id && !dirty) note = t.notes.saved;

    const setStatus = st => () => this.setState(p => ({ status: Object.assign({}, p.status, { [cur.id]: st }), flash: null }));
    const actions = [];
    if (cur.status === 'invited') {
      actions.push({ label: t.act.resend, cls: 'act-p', go: () => {}, off: false }, { label: t.act.revoke, cls: 'act-d', go: () => {}, off: false });
    } else {
      actions.push({ label: t.act.save, cls: 'act-p', off: isSelf || !dirty || !draft.length || (isLastSuper && !draft.includes('superadmin')),
        go: () => this.setState(p => ({ roles: Object.assign({}, p.roles, { [cur.id]: draft }), flash: cur.id })) });
      if (cur.status === 'active') actions.push({ label: t.act.suspend, cls: 'act-d', go: setStatus('suspended'), off: isSelf || isLastSuper });
      else actions.push({ label: t.act.reinstate, cls: '', go: setStatus('active'), off: false });
    }

    const groupsFor = (list, onToggle, lock) => this.ROLE_GROUPS.map((g, gi) => ({
      label: t.roleGroups[gi],
      items: g.map(id => ({ id, name: t.roles[id][0], desc: t.roles[id][1], on: list.includes(id), off: !!lock, toggle: () => onToggle(id) }))
    }));

    const inv = s.inv;
    const invErr = !inv.name.trim() ? t.invErr.name : !/^[^@\\s]+@[^@\\s]+\\.[a-z]{2,}$/i.test(inv.email.trim()) ? t.invErr.email : !inv.roles.length ? t.invErr.role : '';
    const setInv = patch => this.setState(p => ({ inv: Object.assign({}, p.inv, patch) }));

    const nAct = team.filter(a => a.status === 'active').length, nInv = team.filter(a => a.status === 'invited').length, nSus = team.filter(a => a.status === 'suspended').length;

    return {
      rootRef: this.root, t, langs: this.langsFor(lang),
      me: { id: meId, initials: t.people[meId][0], name: t.people[meId][1], role: saved(meId).map(roleName).join(' · ') },
      groups: this.GROUPS.map((g, gi) => ({
        label: t.groups[gi][0],
        items: g.map((x, xi) => ({ label: t.groups[gi][1][xi], on: x.id === 'team', bg: x.id === 'team' ? 'var(--neutral-bg)' : 'transparent', fw: x.id === 'team' ? 600 : 400, dot: x.dot, n: this.fmt(x.n, t.sep), nFg: x.id === 'team' ? 'var(--ink)' : 'var(--ink-2)' }))
      })),
      viewers: this.sw(['super', 'other'], 'viewer', t.viewers),
      isSuper: s.viewer === 'super', isOther: s.viewer !== 'super',
      summary: this.count(team.length, t, t.admins) + ' · ' + this.fmt(nAct) + ' ' + t.sumActive + ' · ' + this.fmt(nInv) + ' ' + t.sumInvited + ' · ' + this.fmt(nSus) + ' ' + t.sumSusp,
      openInvite: () => this.setState({ panel: 'invite' }), closeInvite: () => this.setState({ panel: 'detail' }),
      showDetail: s.panel === 'detail', showInvite: s.panel === 'invite',
      rows: team.map(a => ({
        id: a.id, initials: t.people[a.id][0], name: t.people[a.id][1],
        roles: saved(a.id).map(r => ({ label: roleName(r), cls: this.ROLE_CHIP[r] || 'chip-neutral' })),
        status: t.status[a.status], stChip: this.ST_CHIP[a.status],
        mfa: a.mfa ? t.mfaOn : t.mfaOff, mfaFg: a.mfa ? 'var(--ink-2)' : 'var(--conditional-ink)',
        last: this.iso(t.dates[a.last]), on: a.id === cur.id && s.panel === 'detail',
        pick: () => this.setState({ sel: a.id, panel: 'detail', flash: null })
      })),
      cur: { id: cur.id, initials: t.people[cur.id][0], name: t.people[cur.id][1], contact: cur.contact, status: t.status[cur.status], stChip: this.ST_CHIP[cur.status], roleCount: t.roleCount(this.fmt(draft.length)) },
      roleGroups: groupsFor(draft, id => this.setState(p => ({ draft: Object.assign({}, p.draft, { [cur.id]: this.toggled(draft, id) }), flash: null })), isSelf || cur.status === 'invited'),
      actions, note, hasNote: !!note,
      history: cur.hist.map(([kind, role, d, by]) => ({ what: t.hist[kind] + (role ? roleName(role) : ''), when: this.iso(t.dates[d]), by: by + ' · ' + person(by) })),
      inv: {
        name: inv.name, email: inv.email, phone: inv.phone, roleCount: t.roleCount(this.fmt(inv.roles.length)),
        onName: e => setInv({ name: e.target.value, tried: false }), onEmail: e => setInv({ email: e.target.value, tried: false }), onPhone: e => setInv({ phone: e.target.value }),
        off: false, err: invErr, hasErr: inv.tried && !!invErr,
        send: () => invErr ? setInv({ tried: true }) : this.setState({ panel: 'detail', inv: { name: '', email: '', phone: '', roles: [], tried: false } })
      },
      invGroups: groupsFor(inv.roles, id => setInv({ roles: this.toggled(inv.roles, id), tried: false })),
      myRoles: saved(meId).map(r => ({ name: t.roles[r][0], desc: t.roles[r][1] }))
    };
  }
`;

N.build({
  name: 'Admin Team', w: 1440, h: 1100, web: false,
  css: CSS,
  template: TEMPLATE,
  state: "viewer: 'super', sel: 'ADM-031', panel: 'detail', roles: {}, draft: {}, status: {}, flash: null, inv: { name: '', email: '', phone: '', roles: [], tried: false }",
  logic: LOGIC
});
