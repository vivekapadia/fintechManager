import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, DollarSign, Briefcase } from 'lucide-react';

interface AnalyticsData {
    net_worth: number;
    gross_assets: number;
    liabilities: number;
    allocation: Record<string, number>;
    composition: {
        by_value: Record<string, number>;
        by_quantity: Record<string, number>;
        liabilities: Record<string, number>;
    };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function DashboardPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [chartFilter, setChartFilter] = useState<'VALUE' | 'QUANTITY' | 'LIABILITY'>('VALUE');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/analytics/portfolio');
                setData(res.data);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="text-center p-10">Loading Dashboard...</div>;
    if (!data) return <div className="text-center p-10">No Data Available</div>;

    const getChartData = () => {
        if (!data.composition) return []; // Fallback for old API response

        let source: Record<string, number> = {};
        if (chartFilter === 'VALUE') source = data.composition.by_value;
        else if (chartFilter === 'QUANTITY') source = data.composition.by_quantity;
        else if (chartFilter === 'LIABILITY') source = data.composition.liabilities;

        return Object.entries(source).map(([key, value]) => ({
            name: key.replace('_', ' '),
            value: value
        }));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Financial Overview</h1>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Net Worth</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                ${data.net_worth.toLocaleString()}
                            </h3>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Gross Assets</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                ${data.gross_assets?.toLocaleString() || '0'}
                            </h3>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <DollarSign className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Liabilities</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                ${data.liabilities?.toLocaleString() || '0'}
                            </h3>
                        </div>
                        <div className="p-3 bg-red-100 rounded-full">
                            <Briefcase className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Asset Allocation Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[450px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Portfolio Breakdown</h3>

                        {/* Filter Controls */}
                        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setChartFilter('VALUE')}
                                className={`px-2 py-1 text-xs font-medium rounded ${chartFilter === 'VALUE' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                            >
                                Value
                            </button>
                            <button
                                onClick={() => setChartFilter('QUANTITY')}
                                className={`px-2 py-1 text-xs font-medium rounded ${chartFilter === 'QUANTITY' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                            >
                                Quantity
                            </button>
                            <button
                                onClick={() => setChartFilter('LIABILITY')}
                                className={`px-2 py-1 text-xs font-medium rounded ${chartFilter === 'LIABILITY' ? 'bg-white shadow text-red-600' : 'text-gray-500'}`}
                            >
                                Liabilities
                            </button>
                        </div>
                    </div>

                    {getChartData().length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={getChartData()}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {getChartData().map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">
                            {chartFilter === 'QUANTITY' ? 'No Stocks/Mutual Funds found' :
                                chartFilter === 'LIABILITY' ? 'No Liabilities found' : 'No assets to display'}
                        </div>
                    )}
                </div>

                {/* Placeholder for Future Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px] flex flex-col items-center justify-center text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance History</h3>
                    <p className="text-gray-500">Historical data tracking coming soon.</p>
                </div>
            </div>
        </div>
    );
}
