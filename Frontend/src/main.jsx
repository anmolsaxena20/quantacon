import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from "@react-oauth/google";

import { ThemeProvider } from "@/components/theme-provider"
import { store } from '@/lib/redux-store'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider store={store}>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <GoogleOAuthProvider clientId="551836095010-l5c7dje253euhbqc6ttk3o0giholgcus.apps.googleusercontent.com">
                <App />
            </GoogleOAuthProvider>
            </ThemeProvider>
        </Provider>
    </StrictMode>,
)
