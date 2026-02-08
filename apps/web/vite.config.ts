import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/', // General solution for local and cloud (unless sub-path hosting is required)

    plugins: [react()],
    server: {
        host: true,
        port: 5173,
        watch: {
            usePolling: true
        }
    }
})
