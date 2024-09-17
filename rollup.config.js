import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'iife',
    name: 'NostrContent',
  },
  plugins: [nodeResolve(), typescript({ sourceMap: false }), commonjs()],
  // external: ['light-bolt11-decoder'],
}
