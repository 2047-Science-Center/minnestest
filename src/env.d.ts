/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Sätts vid bygget för Node-hosten → appen använder wss://<host><path> som relä. */
  readonly VITE_RELAY_PATH?: string
  /** Sätts av GitHub Pages-workflowen (t.ex. '/minnestest/'). */
  readonly VITE_BASE?: string
  /** Override av /assess-gatewayns bas-URL (annars localhost:8787). */
  readonly VITE_ASSESS_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
