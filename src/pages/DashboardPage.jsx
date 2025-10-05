// src/pages/DashboardPage.jsx

import React, { useEffect, useState } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import MainChart from '../components/MainChart';
import DashboardSkeleton from '../components/DashboardSkeleton';
import { DollarSign, ShoppingCart, Users, UserPlus, Store, Trophy, Award, Medal, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/dashboard/stats');
            setData(res.data);
        } catch (err) {
            console.error("Gagal mengambil data dashboard", err);
            setError("Gagal memuat data. Silakan coba lagi nanti.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR',
        minimumFractionDigits: 0 
    }).format(number);

    if (loading) return <DashboardSkeleton />;

    if (error) {
        return (
            <main className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-semibold text-red-600 mb-2">Terjadi Kesalahan</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button onClick={fetchData} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    Coba Lagi
                </button>
            </main>
        );
    }
    
    const rankDetails = [
        { icon: Trophy, color: 'text-yellow-400' },
        { icon: Award, color: 'text-gray-400' },
        { icon: Medal, color: 'text-orange-500' }
    ];

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: i => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
            },
        }),
    };

    return (
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
                {[
                    { icon: DollarSign, title: "Penjualan Hari Ini", value: formatRupiah(data.stats.salesToday), color: "text-green-500" },
                    { icon: ShoppingCart, title: "Transaksi Hari Ini", value: data.stats.transactionsToday, color: "text-blue-500" },
                    { icon: UserPlus, title: "User Pending", value: data.stats.pendingUsers, color: "text-yellow-500" },
                    { icon: Users, title: "Total User Aktif", value: data.stats.activeUsers, color: "text-purple-500" },
                    { icon: Store, title: "Total Toko Aktif", value: data.stats.activeStores, color: "text-pink-500" },
                ].map((item, i) => (
                    <motion.div key={i} custom={i} variants={cardVariants} initial="hidden" animate="visible">
                        <StatCard {...item} />
                    </motion.div>
                ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Grafik Penjualan 7 Hari</h3>
                    <MainChart data={data.salesChart} />
                </motion.div>
                
                <div className="space-y-6">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="bg-white p-6 rounded-xl shadow-lg">
                        <div className="flex items-center mb-4">
                            <Trophy className="w-6 h-6 text-yellow-500 mr-3" />
                            <h3 className="text-xl font-semibold text-gray-800">Peringkat Toko (Hari Ini)</h3>
                        </div>
                        {data.topStores && data.topStores.length > 0 ? (
                            <ul className="space-y-4">
                                {data.topStores.map((store, index) => {
                                    const RankIcon = rankDetails[index]?.icon || Trophy;
                                    const iconColor = rankDetails[index]?.color || 'text-gray-500';
                                    return (
                                        <li key={store.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                                            <div className="flex items-center">
                                                <RankIcon className={`w-7 h-7 mr-4 ${iconColor}`} />
                                                <div>
                                                    <span className="font-bold text-gray-800">{store.name}</span>
                                                    <p className="text-sm text-green-600">{formatRupiah(store.totalSales)}</p>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-500 py-4">Belum ada penjualan hari ini.</p>
                        )}
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800">Transaksi Terbaru</h3>
                        {data.recentTransactions.length > 0 ? (
                            <ul className="space-y-4">
                                {data.recentTransactions.map(tx => (
                                    <li key={tx.invoice_number} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-b-0">
                                        <div>
                                            <p className="font-semibold text-gray-800">{tx.cashier_name}</p>
                                            <p className="text-sm text-gray-500">{tx.store_name || 'N/A'}</p>
                                        </div>
                                        <span className="font-bold text-green-600 text-right">{formatRupiah(tx.total_amount)}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-500 py-4">Belum ada transaksi terbaru.</p>
                        )}
                    </motion.div>
                </div>
            </div>
        </main>
    );
};

export default DashboardPage;