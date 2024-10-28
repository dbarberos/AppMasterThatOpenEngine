import { defineConfig } from 'vite'

export default defineConfig({
    define: {
        global: 'window'
    },
    resolve: {
        alias: {
            'dragula': 'dragula/dist/dragula.min.js'
        }
    }
})