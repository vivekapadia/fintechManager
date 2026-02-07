import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of the User object
interface User {
    id: string;
    email: string;
    role: string;
}

// Define the shape of the AuthContext data
interface AuthContextType {
    user: User | null;         // The current logged-in user (or null)
    isAuthenticated: boolean;  // Flag to check if user is logged in
    login: (token: string, userData?: User) => void; // Function to log in
    logout: () => void;        // Function to log out
    loading: boolean;          // Loading state (checking token on startup)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provides authentication state and methods (login, logout) to the application.
 * Persists the JWT token in localStorage to maintain sessions.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); // Initial load check

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // In a real app, verify token validity with /me endpoint here
            setIsAuthenticated(true);
            // setUser(decodedToken or fetchUser()); 
        }
        setLoading(false);
    }, []);

    const login = (token: string, userData?: User) => {
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
        if (userData) setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
