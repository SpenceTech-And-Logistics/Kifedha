# Kifedha Limited: company website

React 19 + Vite 7 + three.js (3D hero), plain CSS. Built by SpenceTec and Logistics Limited.

- Text: `src/content.js` (from the company profile deck). Images: `public/images/`.
- 3D hero scene: `src/Scene3D.jsx` (loaded on demand; falls back to a static "24h" if WebGL is unavailable; respects reduced-motion).
- Optional contact form: set `contact.formspree` in `src/content.js` (Formspree form id). Blank hides it.

```bash
npm install
npm run dev
npm run build        # outputs dist/
npx wrangler deploy  # Cloudflare Workers, SPA fallback in wrangler.jsonc
```
