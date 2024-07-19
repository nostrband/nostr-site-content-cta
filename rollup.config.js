import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'iife',
    name: 'nostr_site_content_cta_iife',
  },
  plugins: [nodeResolve(), typescript({ sourceMap: false })],
}
