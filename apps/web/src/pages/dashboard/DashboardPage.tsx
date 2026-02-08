import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, DollarSign, Briefcase } from 'lucide-react';

interface AnalyticsData {
    net_worth: number;
    gross_assets: number;
    liabilities: number;
    allocation: Record<string, number>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function DashboardPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

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

    const chartData = Object.entries(data.allocation).map(([key, value]) => ({
        name: key.replace('_', ' '),
        value: value
    }));

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Financial Overview</h1>
                <Link to="/portfolio" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center shadow-sm transition-colors">
                    Manage Portfolio <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
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
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px]">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Allocation</h3>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">
                            No assets to display
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
