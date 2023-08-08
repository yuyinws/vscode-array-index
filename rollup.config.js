import { createRequire } from 'node:module'
import { defineConfig } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'

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
  ],
})
