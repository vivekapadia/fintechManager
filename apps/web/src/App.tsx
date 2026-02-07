import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import PortfolioPage from './pages/portfolio/PortfolioPage';

// ... imports

/**
 * Dashboard Component (Protected).
 * This is the main view user sees after logging in.
 */
function Dashboard() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-4">Welcome to Fintech Manager! You are logged in.</p>
        </div>
    );
}

/**
 * Main Application Component.
 * Sets up the Router and AuthProvider.
 * Defines Public Routes (Login/Register) and Protected Routes (Dashboard).
 */
function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/portfolio" element={<PortfolioPage />} />
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
