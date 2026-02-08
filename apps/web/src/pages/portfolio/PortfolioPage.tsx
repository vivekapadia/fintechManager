import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useForm } from 'react-hook-form';
import { Trash2, Pencil } from 'lucide-react';

interface AssetParams {
    name: string;
    symbol?: string;      // Optional for FD/Loan
    quantity?: number;    // Stock/MF
    price?: number;       // Stock/MF (Buy Price / NAV)

    // FD & Loan Specific
    principalAmount?: number;
    interestRate?: number;
    startDate?: string;

    // FD Specific
    maturityDate?: string;

    // Loan Specific
    tenureMonths?: number;
}

type AssetType = 'STOCK' | 'MUTUAL_FUND' | 'FIXED_DEPOSIT' | 'LOAN';

export default function PortfolioPage() {
    const [assets, setAssets] = useState<any[]>([]);
    const { register, handleSubmit, reset } = useForm<AssetParams>();
    const [loading, setLoading] = useState(true);
    const [assetType, setAssetType] = useState<AssetType>('STOCK');

    const [editingAssetId, setEditingAssetId] = useState<string | null>(null);

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

    const handleEdit = (asset: any) => {
        setEditingAssetId(asset.id);
        setAssetType(asset.type);

        // Pre-fill form
        const defaultValues: Partial<AssetParams> = {
            name: asset.name,
        };

        if (asset.type === 'STOCK' || asset.type === 'MUTUAL_FUND') {
            defaultValues.symbol = asset.investmentDetails?.symbol;
            defaultValues.quantity = asset.investmentDetails?.quantity;
            defaultValues.price = asset.investmentDetails?.averageBuyPrice; // buyPrice maps to price field
        } else if (asset.type === 'FIXED_DEPOSIT') {
            defaultValues.principalAmount = asset.fdDetails?.principalAmount;
            defaultValues.interestRate = asset.fdDetails?.interestRate;
            defaultValues.startDate = asset.fdDetails?.startDate ? new Date(asset.fdDetails.startDate).toISOString().split('T')[0] : '';
            defaultValues.maturityDate = asset.fdDetails?.maturityDate ? new Date(asset.fdDetails.maturityDate).toISOString().split('T')[0] : '';
        } else if (asset.type === 'LOAN') {
            defaultValues.principalAmount = asset.loanDetails?.principalAmount;
            defaultValues.interestRate = asset.loanDetails?.interestRate;
            defaultValues.startDate = asset.loanDetails?.startDate ? new Date(asset.loanDetails.startDate).toISOString().split('T')[0] : '';
            defaultValues.tenureMonths = asset.loanDetails?.tenureMonths;
        }

        reset(defaultValues as AssetParams);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const onSubmit = async (data: AssetParams) => {
        try {
            const commonData = { name: data.name };

            // Construct Payload
            let payload: any = { ...commonData };

            if (assetType === 'STOCK') {
                payload = { ...payload, symbol: data.symbol, quantity: Number(data.quantity), buyPrice: Number(data.price) };
            } else if (assetType === 'MUTUAL_FUND') {
                payload = { ...payload, symbol: data.symbol, units: Number(data.quantity), nav: Number(data.price) };
            } else if (assetType === 'FIXED_DEPOSIT') {
                payload = { ...payload, principalAmount: Number(data.principalAmount), interestRate: Number(data.interestRate), startDate: data.startDate, maturityDate: data.maturityDate };
            } else if (assetType === 'LOAN') {
                payload = { ...payload, principalAmount: Number(data.principalAmount), interestRate: Number(data.interestRate), startDate: data.startDate, tenureMonths: Number(data.tenureMonths) };
            }

            if (editingAssetId) {
                // UPDATE logic
                await api.patch(`/assets/${editingAssetId}`, payload);
                alert(`${assetType.replace('_', ' ')} Updated Successfully!`);
            } else {
                // CREATE logic
                if (assetType === 'STOCK') await api.post('/assets/stock', payload);
                else if (assetType === 'MUTUAL_FUND') await api.post('/assets/mutual-fund', payload);
                else if (assetType === 'FIXED_DEPOSIT') await api.post('/assets/fixed-deposit', payload);
                else if (assetType === 'LOAN') await api.post('/assets/loan', payload);

                alert(`${assetType.replace('_', ' ')} Added Successfully!`);
            }

            setEditingAssetId(null);
            reset({
                name: '',
                symbol: '',
                quantity: '' as any,
                price: '' as any,
                principalAmount: '' as any,
                interestRate: '' as any,
                startDate: '',
                maturityDate: '',
                tenureMonths: '' as any
            }); // Clear form
            fetchAssets();
        } catch (error) {
            console.error(error);
            alert(`Failed to ${editingAssetId ? 'update' : 'add'} asset`);
        }
    };

    // Helper to format currency
    const formatCurrency = (val: number | undefined) => {
        return val ? `$${val.toLocaleString()}` : '-';
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this asset?')) return;
        try {
            await api.delete(`/assets/${id}`);
            fetchAssets();
        } catch (error) {
            console.error('Failed to delete asset', error);
            alert('Failed to delete asset');
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">My Portfolio</h1>

            {/* Add/Edit Asset Form */}
            <div className="bg-white p-6 rounded shadow mb-8 max-w-lg border-t-4 border-blue-600">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{editingAssetId ? 'Edit Asset' : 'Add New Asset'}</h2>
                    {editingAssetId && (
                        <button
                            onClick={() => { setEditingAssetId(null); reset(); }}
                            className="text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>

                {/* Type Selector (Disable when editing to keep simple) */}
                <div className={`flex space-x-2 mb-4 bg-gray-100 p-1 rounded-lg w-fit overflow-x-auto ${editingAssetId ? 'opacity-50 pointer-events-none' : ''}`}>
                    {(['STOCK', 'MUTUAL_FUND', 'FIXED_DEPOSIT', 'LOAN'] as AssetType[]).map((type) => (
                        <button
                            key={type}
                            onClick={() => setAssetType(type)}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${assetType === type
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {type.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            {...register("name", { required: true })}
                            placeholder={assetType === 'LOAN' ? "Loan Name (e.g. Home Loan)" : "Asset Name"}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    {(assetType === 'STOCK' || assetType === 'MUTUAL_FUND') && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Symbol / Ticker</label>
                                <input
                                    {...register("symbol", { required: true })}
                                    placeholder={assetType === 'STOCK' ? "AAPL" : "SBIblue"}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {assetType === 'STOCK' ? "Quantity" : "Units"}
                                    </label>
                                    <input
                                        {...register("quantity", { required: true })}
                                        type="number" step="0.01"
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {assetType === 'STOCK' ? "Buy Price" : "NAV"}
                                    </label>
                                    <input
                                        {...register("price", { required: true })}
                                        type="number" step="0.01"
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {(assetType === 'FIXED_DEPOSIT' || assetType === 'LOAN') && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Principal Amount</label>
                                    <input
                                        {...register("principalAmount", { required: true })}
                                        type="number" step="0.01"
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
                                    <input
                                        {...register("interestRate", { required: true })}
                                        type="number" step="0.01"
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        {...register("startDate", { required: true })}
                                        type="date"
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {assetType === 'FIXED_DEPOSIT' ? 'Maturity Date' : 'Tenure (Months)'}
                                    </label>
                                    {assetType === 'FIXED_DEPOSIT' ? (
                                        <input
                                            {...register("maturityDate", { required: true })}
                                            type="date"
                                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    ) : (
                                        <input
                                            {...register("tenureMonths", { required: true })}
                                            type="number"
                                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    <button type="submit" className={`w-full text-white p-2 rounded font-medium transition-colors ${editingAssetId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                        {editingAssetId ? 'Update Asset' : `Add ${assetType.replace('_', ' ')}`}
                    </button>
                </form>
            </div>

            {/* Assets List */}
            <h2 className="text-xl font-semibold mb-4">Current Holdings</h2>
            {loading ? <p>Loading...</p> : (
                <div className="bg-white shadow rounded overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value / EMI</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {assets.map((asset) => (
                                <tr key={asset.id} className={editingAssetId === asset.id ? 'bg-blue-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${asset.type === 'STOCK' ? 'bg-green-100 text-green-800' :
                                                asset.type === 'MUTUAL_FUND' ? 'bg-purple-100 text-purple-800' :
                                                    asset.type === 'FIXED_DEPOSIT' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'}`}>
                                            {asset.type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{asset.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {asset.type === 'FIXED_DEPOSIT' ? (
                                            <span>Matures: {new Date(asset.fdDetails?.maturityDate).toLocaleDateString()}</span>
                                        ) : asset.type === 'LOAN' ? (
                                            <span>{asset.loanDetails?.tenureMonths} Months @ {asset.loanDetails?.interestRate}%</span>
                                        ) : (
                                            <span>{asset.investmentDetails?.symbol} (Qty: {asset.investmentDetails?.quantity})</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {asset.type === 'FIXED_DEPOSIT' ? (
                                            <span>{formatCurrency(asset.fdDetails?.principalAmount)}</span>
                                        ) : asset.type === 'LOAN' ? (
                                            <span>{formatCurrency(asset.loanDetails?.principalAmount)} (EMI: {formatCurrency(asset.loanDetails?.emiAmount)})</span>
                                        ) : (
                                            <span>{formatCurrency(asset.investmentDetails?.averageBuyPrice)}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        <button
                                            onClick={() => handleEdit(asset)}
                                            className="text-blue-600 hover:text-blue-900 transition-colors"
                                            title="Edit Asset"
                                        >
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(asset.id)}
                                            className="text-red-600 hover:text-red-900 transition-colors"
                                            title="Delete Asset"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
