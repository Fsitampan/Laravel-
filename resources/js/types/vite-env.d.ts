/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  // tambah env variable lain di sini kalau ada
}

interface ImportMeta {
  readonly env: ImportMetaEnv
  glob: (pattern: string) => Record<string, unknown>
}
