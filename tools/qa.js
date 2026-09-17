window.__chk = async (boards, langs) => {
  const w = ms => new Promise(r => setTimeout(r, ms));
  const out = {};
  const f = document.createElement('iframe');
  f.style.cssText = 'position:fixed;left:-5000px;top:0;width:1440px;height:1000px';
  document.body.appendChild(f);
  for (const b of boards) {
    const r = [];
    for (const lang of (langs || ['en', 'ar'])) {
      f.src = '/' + encodeURIComponent(b) + '.dc.html?lang=' + lang + '&t=' + Date.now();
      await Promise.race([new Promise(res => f.onload = res), w(6000)]);
      await w(900);
      try {
        const d = f.contentDocument, txt = d.body.innerText;
        const bad = /Minified React error|is not defined|Cannot read|\[object Object\]/.test(txt);
        const shell = !!d.querySelector('.app, .site-page');
        const over = [...d.querySelectorAll('body *')].filter(e => { const q = e.getBoundingClientRect(); return q.width && (q.right > 1445 || q.left < -5); }).length;
        const narrow = [...d.querySelectorAll('[style*="max-width:430px"]')].length;
        r.push(lang + ':' + (bad ? 'ERR ' : '') + (shell ? 'shell' : 'NOSHELL') + (over ? ' overflow' + over : '') + (narrow ? ' PHONE' : '') + ' h' + d.documentElement.scrollHeight + ' ' + d.querySelector('[dir]').getAttribute('dir'));
      } catch (e) { r.push(lang + ':EXC ' + e.message); }
    }
    out[b] = r.join(' | ');
  }
  f.remove();
  return out;
};
'qa ready';
