import { readFile, writeFile } from 'node:fs/promises'

import { defineConfig } from 'tsdown'

const UI_EXT = '.mjs'

/**
 * Rewrite the UI barrel to pure `export *` re-exports (no side-effect imports).
 * `'use client'` lives in source leaves only — not injected by the build.
 */
async function writeTreeShakeableUiBarrel(): Promise<void> {
  const source = await readFile('src/ui/index.ts', 'utf8')
  const lines = source
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line.startsWith('export '))
    .map((line) => line.replace(/from '(\.[^']+)\.js'/g, `from '$1${UI_EXT}'`))

  await writeFile(`dist/ui/index${UI_EXT}`, [...lines, ''].join('\n'))
}

const shared = {
  format: ['esm'] as ['esm'],
  dts: true,
  sourcemap: true,
  target: 'es2022',
  hash: false,
  fixedExtension: true,
}

export default defineConfig([
  {
    ...shared,
    entry: {
      'index': 'src/index.ts',
      'cms/index': 'src/cms/index.ts',
      'cms/google-oauth': 'src/cms/auth/google-oauth.ts',
      'seo/index': 'src/seo/index.ts',
      'i18n/index': 'src/i18n/index.ts',
      'utils/index': 'src/utils/index.ts',
    },
    clean: true,
  },
  {
    ...shared,
    // Client leaves (`'use client'`) stay unbundled so Next preserves the boundary.
    entry: ['src/analytics/**/*.{ts,tsx}'],
    unbundle: true,
    root: 'src',
    clean: false,
    platform: 'neutral',
    deps: {
      neverBundle: true,
    },
    treeshake: false,
  },
  {
    ...shared,
    // One file per module so `import { Button } from '.../ui'` tree-shakes.
    entry: ['src/ui/**/*.{ts,tsx}'],
    unbundle: true,
    root: 'src',
    clean: false,
    platform: 'neutral',
    deps: {
      // Peers stay external — do not vendor embla/etc. into dist/node_modules.
      neverBundle: true,
    },
    // Keep all UI modules for consumer-side tree-shaking.
    treeshake: false,
    async onSuccess() {
      await writeTreeShakeableUiBarrel()
    },
  },
])
