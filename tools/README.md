# tools/

Helpers used to build the design. None of this is application code.

## web-shell/ — convert a screen to the web platform layout

`weblib.js` rewrites one `.dc.html` screen:

- links `designs/web.css` and loads `designs/shell.js`,
- replaces the template (between `</helmet>` and `</x-dc>`) with new markup wrapped in the **app shell** (`W.appShell`, sidebar for importer/trader) or the **site shell** (`W.siteShell`, public header + footer),
- replaces the screen's `<style>` with the page CSS you pass,
- sets the artboard preview size (default 1440 × 1000),
- injects `sh: window.MaabarShell(this.state.lang, surface, active)` into `renderVals()`,
- optionally applies small `logic` find/replace edits and `extra` values,
- prints any `{{ binding }}` used in the markup that the screen logic never mentions (a quick sanity check; `true`/`false` hits are placeholder values and harmless).

```js
const W = require('./weblib.js');
W.convert({
  file: 'Saved.dc.html',          // in designs/
  surface: 'public',              // 'public' | 'importer' | 'trader'
  active: 'home',                 // nav id from shell.js
  w: 1440, h: 1200,               // artboard size
  extra: `stateLabel: ({ ar: 'الحالة', fr: 'État de l’écran', en: 'Screen state' })[this.state.lang],`,
  css: `/* page-specific CSS */`,
  markup: W.siteShell({ statebar: W.STATEBAR('views', 'stateLabel'), inner: `...page markup...` })
});
```
Run with `node tools/web-shell/<recipe>.js`.

The `w-*.js` files are the exact recipes already applied (importer, trader and public screens). **Do not re-run them on converted screens** — use them as templates for new ones.

Workflow for a screen:
1. List its bindings: `awk '/<\/helmet>/,/<\/x-dc>/' "designs/X.dc.html" | grep -o "{{[^}]*}}" | sort -u`
2. Write the web markup using only those bindings (plus `sh.*` and `langs`).
3. Run the recipe, then QA, then view it in the hub in EN / FR / AR.

## qa.js — browser check

With the preview server running and the hub open (http://localhost:4321), paste the contents of `qa.js` into the browser console (or serve it), then:

```js
await __chk(['Saved', 'Onboarding'])            // EN + AR
await __chk(['Saved'], ['en', 'fr', 'ar'])
```
Each screen reports: render errors, whether a web shell is present, horizontal overflow at 1440px, any leftover 430px phone column (`PHONE`), page height and text direction.
