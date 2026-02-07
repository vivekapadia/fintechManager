import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * A wrapper component that protects routes requiring authentication.
 * If user is logged in, renders the child route (Outlet).
 * If not, redirects to the /login page.
 */
export default function ProtectedRoute() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}
