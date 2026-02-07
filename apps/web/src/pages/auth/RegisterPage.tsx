import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../lib/api';
import { useState } from 'react';

/**
 * Registration Page Component.
 * Collects new user details and calls /auth/register to create an account.
 */
export default function RegisterPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const onSubmit = async (data: any) => {
        try {
            setError('');
            const response = await api.post('/auth/register', data);
            login(response.data.access_token);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Register</h2>
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
                            {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 chars' } })}
                            className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            type="password"
                        />
                        {errors.password && <p className="text-red-500 text-sm">{(errors.password as any).message}</p>}
                    </div>
                    <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition">
                        Sign Up
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}
