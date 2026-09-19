import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from newscreen import build, site_page, statebar

CSS = '''
.wrapc{max-width:560px;margin:0 auto;padding:48px 0 64px}
.wrapc h1{margin:0 0 6px;font-size:28px;font-weight:600}
.wrapc .lede{margin:0 0 26px;color:var(--ink-2)}
.xp-card .st{font-size:var(--t-xs);margin-top:4px;display:inline-flex;align-items:center;gap:6px}
.xp-card .st i{width:7px;height:7px;border-radius:50%}
.sub-h{font-size:var(--t-xs);font-weight:600;color:var(--ink-3);letter-spacing:.06em;text-transform:uppercase;margin:26px 0 10px}
[lang="ar"] .sub-h{letter-spacing:0;text-transform:none}
.setup{padding:18px 20px;border:1px solid var(--rule);border-radius:var(--r-lg);background:var(--surface)}
'''

INNER = '''<div class="container"><div class="wrapc">
<h1>{{ greeting }}</h1>
<p class="lede">{{ t.lede }}</p>

<div class="xp">
<sc-for list="{{ cards }}" as="c" hint-placeholder-count="3">
<button type="button" class="xp-card">
<span class="ic" style="background:{{ c.bg }};color:{{ c.fg }}">{{ c.icon }}</span>
<span class="t"><span class="n">{{ c.name }}</span><span class="s">{{ c.sub }}</span><span class="st" style="color:{{ c.stFg }}"><i style="background:{{ c.stDot }}"></i>{{ c.st }}</span></span>
<span class="go">{{ c.go }}</span>
</button>
</sc-for>
</div>

<sc-if value="{{ hasSetup }}" hint-placeholder-val="{{ false }}">
<div class="sub-h">{{ t.setupH }}</div>
<div class="setup">
<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px"><span class="doc-ic" data-s="todo">3</span><div style="flex:1"><div style="font-weight:600">{{ setup.title }}</div><div style="font-size:var(--t-sm);color:var(--ink-2)">{{ setup.sub }}</div></div></div>
<div class="steps">
<sc-for list="{{ setup.steps }}" as="s" hint-placeholder-count="4"><div class="step" data-s="{{ s.s }}"><span class="n">{{ s.n }}</span><span>{{ s.label }}</span></div></sc-for>
</div>
<button type="button" class="btn btn-primary btn-block" style="margin-top:14px">{{ setup.cta }}</button>
</div>
</sc-if>

<sc-if value="{{ hasBecome }}" hint-placeholder-val="{{ true }}">
<div class="sub-h">{{ t.moreH }}</div>
<div class="xp">
<sc-for list="{{ become }}" as="b" hint-placeholder-count="2">
<button type="button" class="xp-card" data-kind="become">
<span class="ic">+</span>
<span class="t"><span class="n">{{ b.label }}</span><span class="s">{{ b.sub }}</span></span>
<span class="go">{{ t.learn }}</span>
</button>
</sc-for>
</div>
</sc-if>

<p style="font-size:var(--t-xs);color:var(--ink-3);margin-top:26px;line-height:1.6">{{ t.fine }}</p>
</div></div>'''

LOGIC = r'''
  L = {
    ar: { dir: 'rtl', short: 'ع', label: 'العربية',
      greet: n => 'مساء الخير، ' + n, lede: 'إلى أين تريد أن تذهب؟',
      go: 'افتح', current: 'الفضاء الحالي', learn: 'اعرف أكثر',
      st: { ok: 'مُتحقَّق', pending: 'التحقّق قيد المراجعة', fix: 'التحقّق يحتاج انتباهك', expired: 'الرخصة منتهية — جدّد', none: '' },
      subs: { importer: 'رحلاتك، الطلب، السجلّات', trader: 'الاكتشاف، الطلبات، متجرك', public: 'تصفّح واشترِ كمشترٍ' },
      setupH: 'إعداد غير مكتمل', moreH: 'فضاءات أخرى',
      setup: { title: 'إعداد المستورد', sub: 'توقّفت عند الوثائق. أكمل من حيث توقّفت.', steps: ['الحساب', 'الملف', 'الوثائق', 'المراجعة'], cta: 'أكمل إعداد المستورد' },
      become: { importer: ['كن مستورداً', 'تُضاف إلى حسابك نفسه'], trader: ['كن تاجراً', 'تُضاف إلى حسابك نفسه'] },
      fine: 'حساب واحد، رقم واحد.'
    },
    fr: { dir: 'ltr', short: 'FR', label: 'Français',
      greet: n => 'Bonsoir, ' + n, lede: 'Où voulez-vous aller ?',
      go: 'Ouvrir', current: 'Espace actuel', learn: 'En savoir plus',
      st: { ok: 'Vérifié', pending: 'Vérification en cours', fix: 'Vérification à corriger', expired: 'Autorisation expirée — renouveler', none: '' },
      subs: { importer: 'Vos voyages, la demande, vos registres', trader: 'Découverte, demandes, votre boutique', public: 'Parcourir et acheter comme acheteur' },
      setupH: 'Installation incomplète', moreH: 'Autres espaces',
      setup: { title: 'Installation importateur', sub: 'Vous vous êtes arrêté aux documents. Reprenez où vous en étiez.', steps: ['Compte', 'Profil', 'Documents', 'Vérification'], cta: 'Continuer l’installation importateur' },
      become: { importer: ['Devenir importateur', 'S’ajoute à ce même compte'], trader: ['Devenir commerçant', 'S’ajoute à ce même compte'] },
      fine: 'Un compte, un numéro.'
    },
    en: { dir: 'ltr', short: 'EN', label: 'English',
      greet: n => 'Good evening, ' + n, lede: 'Where do you want to go?',
      go: 'Open', current: 'Current workspace', learn: 'Learn more',
      st: { ok: 'Verified', pending: 'Verification under review', fix: 'Verification needs attention', expired: 'Authorisation expired — renew', none: '' },
      subs: { importer: 'Your trips, demand, records', trader: 'Discovery, requests, your shop', public: 'Browse and buy as a shopper' },
      setupH: 'Incomplete setup', moreH: 'Other experiences',
      setup: { title: 'Importer setup', sub: 'You stopped at documents. Pick up where you left off.', steps: ['Account', 'Profile', 'Documents', 'Review'], cta: 'Continue importer setup' },
      become: { importer: ['Become an importer', 'Added to this same account'], trader: ['Become a trader', 'Added to this same account'] },
      fine: 'One account, one number.'
    }
  };
  VIEWS = ['both', 'one', 'setup', 'pending', 'expired'];
  VIEW_LABELS = { ar: ['مستورد + تاجر', 'تاجر فقط', 'إعداد غير مكتمل', 'تحقّق قيد المراجعة', 'رخصة منتهية'], fr: ['Importateur + commerçant', 'Commerçant seul', 'Installation incomplète', 'Vérification en cours', 'Autorisation expirée'], en: ['Importer + trader', 'Trader only', 'Incomplete setup', 'Verification pending', 'Expired authorisation'] };
  NAMES = { ar: 'أحمد', fr: 'Ahmed', en: 'Ahmed' };
  renderVals() {
    const lang = this.state.lang, t = this.L[lang], v = this.state.view;
    const held = { both: ['importer', 'trader'], one: ['trader'], setup: ['trader', 'importer'], pending: ['importer'], expired: ['importer'] }[v];
    const state = { both: { importer: 'ok', trader: 'ok' }, one: { trader: 'ok' }, setup: { trader: 'ok', importer: 'setup' }, pending: { importer: 'pending' }, expired: { importer: 'expired' } }[v];
    const sh = window.MaabarShell(lang, 'public', '', { held: held.concat(['public']) });
    const DOT = { ok: 'var(--allowed)', pending: 'var(--ink-3)', fix: 'var(--conditional)', expired: 'var(--prohibited)', none: 'transparent' };
    const INK = { ok: 'var(--allowed-ink)', pending: 'var(--ink-2)', fix: 'var(--conditional-ink)', expired: 'var(--prohibited-ink)', none: 'var(--ink-3)' };
    const cards = sh.experiences.filter(x => state[x.id] !== 'setup').map(x => {
      const s = x.id === 'public' ? 'none' : state[x.id];
      return { name: x.name, sub: t.subs[x.id], icon: x.icon, bg: x.bg, fg: x.fg, st: t.st[s], stDot: DOT[s], stFg: INK[s], go: t.go + ' →' };
    });
    const become = sh.become.filter(b => state[b.id] !== 'setup').map(b => ({ label: t.become[b.id][0], sub: t.become[b.id][1] }));
    const steps = t.setup.steps.map((label, i) => ({ label, n: String(i + 1), s: i < 2 ? 'done' : i === 2 ? 'now' : 'todo' }));
    return {
      rootRef: this.root, t, langs: this.langsFor(lang), sh,
      stateLabel: ({ ar: 'الحالة', fr: 'État', en: 'State' })[lang], views: this.sw(this.VIEWS, 'view', this.VIEW_LABELS[lang]),
      greeting: t.greet(this.NAMES[lang]), cards,
      hasSetup: v === 'setup', setup: { ...t.setup, steps },
      hasBecome: become.length > 0, become
    };
  }
'''
build(dict(name='Choose Experience', w=1440, h=900, css=CSS, state="view: 'both'", template=site_page(INNER, signed_in=True, bar=statebar()), logic=LOGIC))
