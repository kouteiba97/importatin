# CLAUDE.md — Maabar

**Read `HANDOFF.md` before doing anything.** It holds the full context, the owner's rules, the current work item and the next steps.

Non-negotiables, in short:

- **Design and documentation only.** Do not scaffold or build the application (no Next.js, package.json app, DB schema, API routes, auth) unless the owner explicitly asks.
- **Web platform / SaaS first — not a mobile app.** Design screens at 1440px with web navigation (`designs/web.css` + `designs/shell.js`). No phone columns, no bottom tab bars.
- **No explanatory or rationale text inside screens.** Rationale goes in `.md` files.
- **EN / FR / AR are equal.** Fallback locale is French. Latin logo "Maabar" everywhere.
- **`designs/tokens.css` is the only colour source. Brand blue ≠ status green/amber/red.**
- Logical CSS properties only; follow the bidi rules in `HANDOFF.md` §8.
- Regulatory values (1,800,000 DZD, 2 trips/month, 5%…) are configuration with effective dates, never constants in logic.
- Verify every change in the review hub (`node preview/server.js` → http://localhost:4321) in all three languages, then commit and push to `main`.
- The owner is not technical: report results plainly and briefly.
