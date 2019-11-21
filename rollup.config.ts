import typescript from 'rollup-plugin-typescript2'
// @ts-ignore
import { increaseVersion } from './build/update-pkg-version.ts'
const pkg = require('./package.json')
pkg.version = increaseVersion(pkg.version)

export default [
  {
    input: 'src/main.ts',
    output: {
      name: 'ipc-rpc',
      banner: `/*!
 * ipc-rpc v${pkg.version}
 * Copyright© ${new Date().getFullYear()} Saiya ${pkg.homepage}
 */`,
      format: 'es',
      file: `dist/main.js`
    },
    plugins: [
      typescript({
        tsconfigOverride: {
          compilerOptions: { module: 'esnext' }
        },
        typescript: require('typescript')
      })
    ],
    external: ['electron']
  },
  {
    input: 'src/renderer.ts',
    output: {
      name: 'ipc-rpc',
      banner: `/*!
 * Composie v${pkg.version}
 * Copyright© ${new Date().getFullYear()} Saiya ${pkg.homepage}
 */`,
      format: 'es',
      file: `dist/renderer.js`
    },
    plugins: [
      typescript({
        tsconfigOverride: {
          compilerOptions: { module: 'esnext' }
        },
        typescript: require('typescript')
      })
    ],
    external: ['electron']
  }
]
