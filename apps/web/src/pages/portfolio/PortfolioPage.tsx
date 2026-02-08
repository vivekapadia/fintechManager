import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useForm } from 'react-hook-form';

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

    const onSubmit = async (data: AssetParams) => {
        try {
            const commonData = { name: data.name };

            if (assetType === 'STOCK') {
                await api.post('/assets/stock', {
                    ...commonData,
                    symbol: data.symbol,
                    quantity: Number(data.quantity),
                    buyPrice: Number(data.price)
                });
            } else if (assetType === 'MUTUAL_FUND') {
                await api.post('/assets/mutual-fund', {
                    ...commonData,
                    symbol: data.symbol,
                    units: Number(data.quantity),
                    nav: Number(data.price)
                });
            } else if (assetType === 'FIXED_DEPOSIT') {
                await api.post('/assets/fixed-deposit', {
                    ...commonData,
                    principalAmount: Number(data.principalAmount),
                    interestRate: Number(data.interestRate),
                    startDate: data.startDate,
                    maturityDate: data.maturityDate
                });
            } else if (assetType === 'LOAN') {
                await api.post('/assets/loan', {
                    ...commonData,
                    principalAmount: Number(data.principalAmount),
                    interestRate: Number(data.interestRate),
                    startDate: data.startDate,
                    tenureMonths: Number(data.tenureMonths)
                });
            }

            reset();
            fetchAssets();
            alert(`${assetType.replace('_', ' ')} Added Successfully!`);
        } catch (error) {
            console.error(error);
            alert('Failed to add asset');
        }
    };

    // Helper to format currency
    const formatCurrency = (val: number | undefined) => {
        return val ? `$${val.toLocaleString()}` : '-';
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">My Portfolio</h1>

            {/* Add Asset Form */}
            <div className="bg-white p-6 rounded shadow mb-8 max-w-lg">
                <h2 className="text-xl font-semibold mb-4">Add New Asset</h2>

                {/* Type Selector */}
                <div className="flex space-x-2 mb-4 bg-gray-100 p-1 rounded-lg w-fit overflow-x-auto">
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

                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-medium">
                        Add {assetType.replace('_', ' ')}
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
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {assets.map((asset) => (
                                <tr key={asset.id}>
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
                                            <span>Matures: {new Date(asset.fixedDepositDetails?.maturityDate).toLocaleDateString()}</span>
                                        ) : asset.type === 'LOAN' ? (
                                            <span>{asset.loanDetails?.tenureMonths} Months @ {asset.loanDetails?.interestRate}%</span>
                                        ) : (
                                            <span>{asset.investmentDetails?.symbol} (Qty: {asset.investmentDetails?.quantity})</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {asset.type === 'FIXED_DEPOSIT' ? (
                                            <span>{formatCurrency(asset.fixedDepositDetails?.principalAmount)}</span>
                                        ) : asset.type === 'LOAN' ? (
                                            <span>{formatCurrency(asset.loanDetails?.principalAmount)} (EMI: {formatCurrency(asset.loanDetails?.emiAmount)})</span>
                                        ) : (
                                            <span>{formatCurrency(asset.investmentDetails?.averageBuyPrice)}</span>
                                        )}
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
