import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from newscreen import build, statebar, LANGSW, LOGO

CSS = '''
.adm{min-height:100vh;display:flex;flex-direction:column}
.adm-top{height:60px;display:flex;align-items:center;gap:12px;padding:0 28px;border-bottom:1px solid var(--rule);background:var(--surface)}
.adm-top .ops{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3);padding-inline-start:12px;border-inline-start:1px solid var(--rule)}
[lang="ar"] .adm-top .ops{letter-spacing:0;text-transform:none}
.adm-body{flex:1;display:grid;place-items:center;padding:40px 20px}
.adm-card{width:100%;max-width:420px;background:var(--surface);border:1px solid var(--rule);border-radius:var(--r-lg);padding:30px 32px}
.adm-card h1{margin:0 0 6px;font-size:22px;font-weight:600}
.adm-card .lede{margin:0 0 22px;color:var(--ink-2);font-size:var(--t-sm);line-height:1.6}
.adm-steps{display:flex;gap:6px;margin-bottom:22px}
.adm-steps i{flex:1;height:3px;border-radius:2px;background:var(--rule)}
.adm-steps i[data-on="true"]{background:var(--ink)}
.otp-row{display:flex;gap:8px;margin:6px 0 20px}
.otp{width:46px;height:52px}
.err{display:flex;gap:10px;padding:12px 14px;border:1px solid var(--prohibited);border-radius:var(--r-sm);background:var(--prohibited-bg);color:var(--prohibited-ink);font-size:var(--t-sm);margin-bottom:16px}
.fine{font-size:var(--t-xs);color:var(--ink-3);line-height:1.6;margin-top:16px}
.rolebox{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid var(--rule);border-radius:var(--r);background:var(--surface-2);font-size:var(--t-sm);margin-top:18px}
.rolebox .chip{margin-inline-start:auto}
.adm-foot{padding:16px 28px;border-top:1px solid var(--rule);font-size:var(--t-xs);color:var(--ink-3);display:flex;justify-content:space-between}
'''

TEMPLATE = f'''<div ref="{{{{ rootRef }}}}" dir="rtl" lang="ar" class="tier-admin web">
<div class="adm">
<header class="adm-top">
<span style="display:flex;align-items:center;gap:10px;color:var(--brand)">{LOGO}<span class="wordmark">{{{{ t.brand }}}}</span></span>
<span class="ops">{{{{ t.ops }}}}</span>
<span style="flex:1"></span>
{LANGSW}
</header>
{statebar()}<main class="adm-body">
<div class="adm-card">
<div class="adm-steps"><sc-for list="{{{{ bars }}}}" as="b" hint-placeholder-count="3"><i data-on="{{{{ b }}}}"></i></sc-for></div>

<sc-if value="{{{{ isId }}}}" hint-placeholder-val="{{{{ true }}}}">
<h1>{{{{ t.idTitle }}}}</h1><p class="lede">{{{{ t.idLede }}}}</p>
<label class="fld" for="ai">{{{{ t.idLabel }}}}</label><input id="ai" class="inp" placeholder="{{{{ t.idPh }}}}">
<button type="button" onClick="{{{{ next }}}}" class="btn btn-dark btn-lg btn-block" style="margin-top:18px">{{{{ t.cont }}}}</button>
<p class="fine">{{{{ t.idFine }}}}</p>
</sc-if>

<sc-if value="{{{{ isOtp }}}}" hint-placeholder-val="{{{{ false }}}}">
<h1>{{{{ t.otpTitle }}}}</h1><p class="lede">{{{{ t.otpLede }}}} <span class="num" dir="ltr"><bdi>+213 6•• •• •• 41</bdi></span></p>
<div class="otp-row" dir="ltr"><sc-for list="{{{{ cells }}}}" as="c" hint-placeholder-count="6"><input class="otp num" inputMode="numeric" maxLength="1" value="{{{{ c }}}}"></sc-for></div>
<button type="button" onClick="{{{{ next }}}}" class="btn btn-dark btn-lg btn-block">{{{{ t.cont }}}}</button>
</sc-if>

<sc-if value="{{{{ isMfa }}}}" hint-placeholder-val="{{{{ false }}}}">
<h1>{{{{ t.mfaTitle }}}}</h1><p class="lede">{{{{ t.mfaLede }}}}</p>
<sc-if value="{{{{ isMfaWrong }}}}" hint-placeholder-val="{{{{ false }}}}"><div class="err" role="alert"><span>!</span><span>{{{{ t.mfaWrong }}}}</span></div></sc-if>
<div class="otp-row" dir="ltr"><sc-for list="{{{{ cells }}}}" as="c" hint-placeholder-count="6"><input class="otp num" inputMode="numeric" maxLength="1" value="{{{{ c }}}}"></sc-for></div>
<button type="button" onClick="{{{{ next }}}}" class="btn btn-dark btn-lg btn-block">{{{{ t.openConsole }}}}</button>
<p class="fine">{{{{ t.mfaFine }}}}</p>
</sc-if>

<sc-if value="{{{{ isDenied }}}}" hint-placeholder-val="{{{{ false }}}}">
<h1>{{{{ t.deniedTitle }}}}</h1><p class="lede">{{{{ t.deniedLede }}}}</p>
<button type="button" onClick="{{{{ reset }}}}" class="btn btn-lg btn-block">{{{{ t.back }}}}</button>
</sc-if>

<sc-if value="{{{{ isReady }}}}" hint-placeholder-val="{{{{ false }}}}">
<h1>{{{{ t.readyTitle }}}}</h1><p class="lede">{{{{ t.readyLede }}}}</p>
<div class="rolebox"><span class="av" style="width:34px;height:34px;font-size:12px;background:var(--surface);border:1px solid var(--rule)">AB</span><div><div style="font-weight:600">Amine B.</div><div style="font-size:var(--t-xs);color:var(--ink-3)">{{{{ t.readyRole }}}}</div></div><span class="chip chip-verified">{{{{ t.mfaOk }}}}</span></div>
<button type="button" class="btn btn-dark btn-lg btn-block" style="margin-top:18px">{{{{ t.openConsole }}}}</button>
<p class="fine">{{{{ t.readyFine }}}}</p>
</sc-if>

</div>
</main>
<footer class="adm-foot"><span>{{{{ t.footL }}}}</span><span>{{{{ t.footR }}}}</span></footer>
</div>
</div>
'''

LOGIC = r'''
  L = {
    ar: { dir: 'rtl', short: 'ع', label: 'العربية', brand: 'Maabar', ops: 'مركز العمليات',
      idTitle: 'دخول الموظّفين', idLede: 'الحسابات تُمنح داخلياً. لا تسجيل هنا.', idLabel: 'المعرّف', idPh: 'amine.b', cont: 'متابعة', idFine: 'وصول مقيّد. كل دخول يُسجَّل.',
      otpTitle: 'رمز الهاتف', otpLede: 'أرسلنا رمزاً إلى',
      mfaTitle: 'التحقّق بخطوتين', mfaLede: 'أدخل الرمز من تطبيق المصادقة.', mfaWrong: 'الرمز غير صحيح. بقيت محاولتان قبل قفل الحساب.', mfaFine: 'لا يمكن تجاوز هذه الخطوة. فقدت جهازك؟ راسل المشرف الأعلى.', openConsole: 'افتح المركز',
      deniedTitle: 'لا وصول', deniedLede: 'هذا المعرّف لا يملك دوراً في مركز العمليات. الأدوار يمنحها المشرف الأعلى فقط.', back: 'رجوع',
      readyTitle: 'مرحباً، أمين', readyLede: 'جلسة قصيرة. تنتهي بعد 30 دقيقة من عدم النشاط.', readyRole: 'الثقة والأمان · التحقّق', mfaOk: 'خطوتان ✓', readyFine: 'تفتح على طابور التحقّق.',
      footL: 'مَعْبَر · نظام داخلي', footR: 'غير مرتبط بالموقع العام'
    },
    fr: { dir: 'ltr', short: 'FR', label: 'Français', brand: 'Maabar', ops: 'Centre des opérations',
      idTitle: 'Accès équipe', idLede: 'Les comptes sont accordés en interne. Aucune inscription ici.', idLabel: 'Identifiant', idPh: 'amine.b', cont: 'Continuer', idFine: 'Accès restreint. Chaque connexion est journalisée.',
      otpTitle: 'Code téléphone', otpLede: 'Code envoyé au',
      mfaTitle: 'Deuxième facteur', mfaLede: 'Entrez le code de votre application d’authentification.', mfaWrong: 'Code incorrect. Deux essais avant verrouillage.', mfaFine: 'Cette étape ne peut pas être contournée. Appareil perdu ? Contactez un super administrateur.', openConsole: 'Ouvrir la console',
      deniedTitle: 'Pas d’accès', deniedLede: 'Cet identifiant n’a aucun rôle dans le centre des opérations. Seul un super administrateur accorde des rôles.', back: 'Retour',
      readyTitle: 'Bonjour, Amine', readyLede: 'Session courte : expire après 30 minutes d’inactivité.', readyRole: 'Confiance et sécurité · vérification', mfaOk: 'MFA ✓', readyFine: 'S’ouvre sur la file de vérification.',
      footL: 'Maabar · système interne', footR: 'Sans lien avec le site public'
    },
    en: { dir: 'ltr', short: 'EN', label: 'English', brand: 'Maabar', ops: 'Operations centre',
      idTitle: 'Staff access', idLede: 'Accounts are granted internally. There is no sign-up here.', idLabel: 'Identifier', idPh: 'amine.b', cont: 'Continue', idFine: 'Restricted access. Every sign-in is logged.',
      otpTitle: 'Phone code', otpLede: 'Code sent to',
      mfaTitle: 'Second factor', mfaLede: 'Enter the code from your authenticator app.', mfaWrong: 'Wrong code. Two attempts before lock-out.', mfaFine: 'This step cannot be skipped. Lost your device? Contact a super admin.', openConsole: 'Open the console',
      deniedTitle: 'No access', deniedLede: 'This identifier holds no role in the operations centre. Only a super admin grants roles.', back: 'Back',
      readyTitle: 'Hello, Amine', readyLede: 'Short session: expires after 30 minutes of inactivity.', readyRole: 'Trust & safety · verification', mfaOk: 'MFA ✓', readyFine: 'Opens on the verification queue.',
      footL: 'Maabar · internal system', footR: 'Not linked to the public site'
    }
  };
  VIEWS = ['id', 'otp', 'mfa', 'mfawrong', 'denied', 'ready'];
  VIEW_LABELS = { ar: ['المعرّف', 'رمز الهاتف', 'خطوتان', 'رمز خاطئ', 'لا وصول', 'جاهز'], fr: ['Identifiant', 'Code', 'MFA', 'MFA faux', 'Pas d’accès', 'Prêt'], en: ['Identifier', 'Phone code', 'MFA', 'MFA wrong', 'No access', 'Ready'] };
  renderVals() {
    const lang = this.state.lang, t = this.L[lang], v = this.state.view;
    const idx = { id: 0, otp: 1, mfa: 2, mfawrong: 2, denied: 0, ready: 3 }[v];
    const order = ['id', 'otp', 'mfa', 'ready'];
    return {
      rootRef: this.root, t, langs: this.langsFor(lang), sh: window.MaabarShell(lang, 'public', ''),
      stateLabel: ({ ar: 'الحالة', fr: 'État', en: 'State' })[lang], views: this.sw(this.VIEWS, 'view', this.VIEW_LABELS[lang]),
      bars: [0, 1, 2].map(i => i <= idx - (v === 'ready' ? 1 : 0)),
      isId: v === 'id', isOtp: v === 'otp', isMfa: v === 'mfa' || v === 'mfawrong', isMfaWrong: v === 'mfawrong', isDenied: v === 'denied', isReady: v === 'ready',
      cells: v === 'mfawrong' ? ['8', '2', '1', '9', '0', '3'] : ['', '', '', '', '', ''],
      next: () => this.setState({ view: order[Math.min(order.indexOf(v === 'mfawrong' ? 'mfa' : v) + 1, 3)] }),
      reset: () => this.setState({ view: 'id' })
    };
  }
'''
build(dict(name='Admin Sign In', w=1440, h=760, css=CSS, state="view: 'mfa'", template=TEMPLATE, logic=LOGIC))
