import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { dirname, join } from 'pathe'
import { copy } from 'fs-extra'

const require = createRequire(import.meta.url)

export default defineConfig({
  input: 'src/index.ts',
  output: {
    file: 'dist/index.cjs',
    format: 'cjs',
  },
  external: ['vscode'],
  plugins: [
    esbuild(),
    commonjs(),
    nodeResolve({
      preferBuiltins: true,
    }),
    {
      resolveId(id) {
        // Must import from the `css-tree` browser bundled distribution due to `createRequire` usage if importing from css-tree directly
        if (id === 'css-tree')
          return require.resolve('./node_modules/css-tree/dist/csstree.esm.js')
      },
    },
    {
      buildEnd() {
        const source = join(dirname(fileURLToPath(import.meta.url)), './src/parser.go')
        const target = join(dirname(fileURLToPath(import.meta.url)), './dist/parser.go')

        copy(source, target)
      },
    },
  ],

})
