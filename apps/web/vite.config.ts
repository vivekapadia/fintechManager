import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    // Base path: '/fintechManager/' for production (GitHub Pages), '/' for local development
    base: process.env.NODE_ENV === 'production' ? '/fintechManager/' : '/',

    plugins: [react()],
    server: {
        host: true,
        port: 5173,
        watch: {
            usePolling: true
        }
    }
})
