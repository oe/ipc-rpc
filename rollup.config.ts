import typescript from 'rollup-plugin-typescript2'
// @ts-ignore
import { increaseVersion } from './build/update-pkg-version.ts'
const pkg = require('./package.json')
pkg.version = increaseVersion(pkg.version)

export default [
  {
    input: 'src/main.ts',
    output: [
      {
        name: 'ipc-rpc',
        banner: `/*!
* ipc-rpc v${pkg.version}
* Copyright© ${new Date().getFullYear()} Saiya ${pkg.homepage}
*/`,
        format: 'cjs',
        file: `dist/main.cjs.js`
      },
      {
        name: 'ipc-rpc',
        banner: `/*!
* ipc-rpc v${pkg.version}
* Copyright© ${new Date().getFullYear()} Saiya ${pkg.homepage}
*/`,
        format: 'es',
        file: `dist/main.es.js`
      }
    ],
    plugins: [
      typescript({
        abortOnError: false,
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
    output: [
      {
        name: 'ipc-rpc',
        banner: `/*!
* ipc-rpc v${pkg.version}
* Copyright© ${new Date().getFullYear()} Saiya ${pkg.homepage}
*/`,
        format: 'cjs',
        file: `dist/renderer.cjs.js`
      },
      {
        name: 'ipc-rpc',
        banner: `/*!
* ipc-rpc v${pkg.version}
* Copyright© ${new Date().getFullYear()} Saiya ${pkg.homepage}
*/`,
        format: 'es',
        file: `dist/renderer.es.js`
      }
    ],
    plugins: [
      typescript({
        abortOnError: false,
        tsconfigOverride: {
          compilerOptions: { module: 'esnext' }
        },
        typescript: require('typescript')
      })
    ],
    external: ['electron']
  }
]
