import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

import { chromeExtension, simpleReloader } from 'rollup-plugin-chrome-extension'

export default {
    input: 'src/script/manifest.json',
    output: {
        dir: 'dist',
        format: 'esm'
    },
    plugins: [
        chromeExtension({
            wrapContentScripts: false
        }),
        simpleReloader(),
        resolve({
            browser: true
        }),
        commonjs()
    ],
}