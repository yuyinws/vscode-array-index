import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
  ],
  format: ['cjs'],
  shims: false,
  dts: false,
  external: [
    'vscode',
  ],
  noExternal: [
    'typescript',
    '@vue/compiler-sfc',
    'svelte',
  ],
  treeshake: true,
})
