import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
// Index CSS (Tailwind imports)
import './index.css'

/**
 * React Entry Point.
 * Mounts the App component to the DOM element with id 'root'.
 * Uses StrictMode for additional development checks.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
