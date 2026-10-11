import type { Config } from "@react-router/dev/config";

export default {
  // This app is entirely client-side: auth, storage, and AI all run in the
  // browser via Puter.js (window.puter), so there is no server data to render.
  // SPA mode skips SSR, drops the Node server requirement, and avoids
  // window-undefined / hydration footguns.
  ssr: false,
} satisfies Config;
