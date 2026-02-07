import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useForm } from 'react-hook-form';

interface StockParams {
    name: string;
    symbol: string;
    quantity: number;
    buyPrice: number;
}

export default function PortfolioPage() {
    const [assets, setAssets] = useState<any[]>([]);
    const { register, handleSubmit, reset } = useForm<StockParams>();
    const [loading, setLoading] = useState(true);

    const fetchAssets = async () => {
        try {
            const res = await api.get('/assets');
            setAssets(res.data);
        } catch (error) {
            console.error('Failed to fetch assets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const onSubmit = async (data: StockParams) => {
        try {
            // Convert strings to numbers
            const payload = {
                ...data,
                quantity: Number(data.quantity),
                buyPrice: Number(data.buyPrice)
            };
            await api.post('/assets/stock', payload);
            reset();
            fetchAssets(); // Refresh list
            alert('Stock Added Successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to add stock');
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">My Portfolio</h1>

            {/* Add Stock Form */}
            <div className="bg-white p-6 rounded shadow mb-8 max-w-md">
                <h2 className="text-xl font-semibold mb-4">Add New Stock</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <input {...register("name", { required: true })} placeholder="Stock Name (e.g. Apple)" className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <input {...register("symbol", { required: true })} placeholder="Symbol (e.g. AAPL)" className="w-full p-2 border rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input {...register("quantity", { required: true })} type="number" step="0.01" placeholder="Quantity" className="w-full p-2 border rounded" />
                        <input {...register("buyPrice", { required: true })} type="number" step="0.01" placeholder="Buy Price" className="w-full p-2 border rounded" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Add Stock</button>
                </form>
            </div>

            {/* Assets List */}
            <h2 className="text-xl font-semibold mb-4">Current Holdings</h2>
            {loading ? <p>Loading...</p> : (
                <div className="bg-white shadow rounded overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {assets.map((asset) => (
                                <tr key={asset.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{asset.name}</td>
                                    {/* Handle checking investmentDetails existence safely */}
                                    <td className="px-6 py-4 whitespace-nowrap">{asset.investmentDetails?.symbol || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{asset.investmentDetails?.quantity || 0}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">${asset.investmentDetails?.averageBuyPrice || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
