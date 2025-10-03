// admin-dashboard-frontend/src/pages/TransactionsPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { Search, Download } from 'lucide-react';
import SearchableSelect from '../components/SearchableSelect';
import DatePicker from '../components/DatePicker';

const TransactionsPage = () => {
    // State untuk data dan UI
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stores, setStores] = useState([]);

    // State untuk filter dan paginasi
    const [selectedStore, setSelectedStore] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                search: debouncedSearchTerm,
                storeId: selectedStore,
            });
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const res = await api.get(`/transactions?${params.toString()}`);
            setTransactions(res.data.transactions);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error("Gagal mengambil data transaksi", error);
            setTransactions([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearchTerm, selectedStore, startDate, endDate]);

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const res = await api.get('/users/stores');
                setStores(res.data);
            } catch (error) {
                console.error("Gagal mengambil data toko", error);
            }
        };
        fetchStores();
    }, []);
    
    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, selectedStore, startDate, endDate]);

    const handleExport = async () => {
        const params = new URLSearchParams({
            search: debouncedSearchTerm,
            storeId: selectedStore,
        });
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        try {
            const response = await api.get(`/transactions/export?${params.toString()}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `transactions-export-${new Date().toISOString().slice(0,10)}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Gagal mengekspor data", error);
            alert("Gagal mengekspor data. Mungkin tidak ada data yang cocok dengan filter Anda.");
        }
    };

    const formatDate = (dateString) => new Date(dateString).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);

    const storeOptions = useMemo(() => {
        return stores.map(store => ({ value: store.id, label: store.name }));
    }, [stores]);

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Daftar Transaksi</h1>

            <div className="mb-4 p-4 bg-white rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                {/* Search Bar */}
                <div className="lg:col-span-2">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Pencarian</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text" placeholder="Cari invoice atau kasir..."
                            className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Filter Toko */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Toko</label>
                    <SearchableSelect
                        options={storeOptions} value={selectedStore}
                        onChange={(value) => setSelectedStore(value || 'all')} placeholder="Cari & pilih toko..."
                    />
                </div>
                
                {/* Input Tanggal Mulai */}
                <div>
                    <DatePicker
                        id="start-date"
                        label="Dari Tanggal"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                
                {/* Input Tanggal Selesai */}
                <div>
                     <DatePicker
                        id="end-date"
                        label="Sampai Tanggal"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                    />
                </div>
            </div>
            
            <div className="mb-4 flex justify-end">
                 {/* Tombol Export */}
                <button 
                    onClick={handleExport} 
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                    <Download className="h-5 w-5 mr-2" />
                    Export ke Excel
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                           <tr className="bg-gray-200 text-gray-600 uppercase text-sm">
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Invoice</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Kasir</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Toko</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Pembayaran</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Total</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Tanggal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-10">Memuat data...</td></tr>
                            ) : transactions.length > 0 ? (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="border-b border-gray-200 hover:bg-gray-100">
                                        <td className="px-5 py-4 text-sm"><p className="text-gray-900 whitespace-no-wrap font-mono">{tx.invoice_number}</p></td>
                                        <td className="px-5 py-4 text-sm"><p className="text-gray-900 whitespace-no-wrap">{tx.cashier_name}</p></td>
                                        <td className="px-5 py-4 text-sm"><p className="text-gray-600 whitespace-no-wrap">{tx.store_name || 'N/A'}</p></td>
                                        <td className="px-5 py-4 text-sm"><p className="text-gray-900 whitespace-no-wrap">{tx.payment_method}</p></td>
                                        <td className="px-5 py-4 text-sm"><p className="text-green-700 font-semibold whitespace-no-wrap">{formatRupiah(tx.total_amount)}</p></td>
                                        <td className="px-5 py-4 text-sm"><p className="text-gray-600 whitespace-no-wrap">{formatDate(tx.transaction_date)}</p></td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="text-center py-10 text-gray-500">Tidak ada transaksi ditemukan.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                 <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
                    <span className="text-xs xs:text-sm text-gray-900">
                        Halaman {currentPage} dari {totalPages || 1}
                    </span>
                    <div className="inline-flex mt-2 xs:mt-0">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-l disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Prev
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-r disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Custom hook untuk debounce
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export default TransactionsPage;