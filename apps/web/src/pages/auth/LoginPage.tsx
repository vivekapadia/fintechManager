import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../lib/api';
import { useState } from 'react';

/**
 * Login Page Component.
 * Handles user email/password input and communicates with the API's /auth/login endpoint.
 */
export default function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const onSubmit = async (data: any) => {
        try {
            setError('');
            const response = await api.post('/auth/login', data);
            login(response.data.access_token);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-gray-700">Email</label>
                        <input
                            {...register('email', { required: 'Email is required' })}
                            className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            type="email"
                        />
                        {errors.email && <p className="text-red-500 text-sm">{(errors.email as any).message}</p>}
                    </div>
                    <div>
                        <label className="block text-gray-700">Password</label>
                        <input
                            {...register('password', { required: 'Password is required' })}
                            className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            type="password"
                        />
                        {errors.password && <p className="text-red-500 text-sm">{(errors.password as any).message}</p>}
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
                        Sign In
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
}
