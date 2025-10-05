import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import api from '../services/api';
import { Search, Download, ChevronDown, FileText, FileBarChart2, FileDiff, Filter, X, TrendingUp, TrendingDown } from 'lucide-react';
import SearchableSelect from '../components/SearchableSelect';
import DatePicker from '../components/DatePicker';
import { motion, AnimatePresence } from 'framer-motion';

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stores, setStores] = useState([]);
    const [regions, setRegions] = useState([]);
    const [showFilters, setShowFilters] = useState(true);

    const [filter, setFilter] = useState({
        searchTerm: '',
        selectedStore: 'all',
        selectedRegion: 'all',
        startDate: '',
        endDate: '',
    });
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isExportMenuOpen, setExportMenuOpen] = useState(false);
    const exportMenuRef = useRef(null);

    const debouncedSearchTerm = useDebounce(filter.searchTerm, 500);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
                setExportMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                search: debouncedSearchTerm,
                storeId: filter.selectedStore,
                regionId: filter.selectedRegion,
                startDate: filter.startDate,
                endDate: filter.endDate,
            });
        
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
    }, [currentPage, debouncedSearchTerm, filter]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [storesRes, regionsRes] = await Promise.all([
                    api.get('/users/stores'),
                    api.get('/users/regions')
                ]);
                setStores([{ id: 'all', name: 'Semua Toko' }, ...storesRes.data]);
                setRegions([{ id: 'all', name: 'Semua Regional' }, ...regionsRes.data]);
            } catch (error) {
                console.error("Gagal mengambil data filter", error);
            }
        };
        fetchInitialData();
    }, []);
    
    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, filter.selectedStore, filter.selectedRegion, filter.startDate, filter.endDate]);

    const handleFilterChange = (key, value) => {
        setFilter(prev => {
            const newFilter = { ...prev, [key]: value };
            if (key === 'selectedRegion') {
                newFilter.selectedStore = 'all';
            }
            return newFilter;
        });
    };

    const clearFilters = () => {
        setFilter({
            searchTerm: '',
            selectedStore: 'all',
            selectedRegion: 'all',
            startDate: '',
            endDate: '',
        });
    };

    const hasActiveFilters = useMemo(() => {
        return filter.searchTerm || 
               filter.selectedStore !== 'all' || 
               filter.selectedRegion !== 'all' || 
               filter.startDate || 
               filter.endDate;
    }, [filter]);

    const handleExport = async (exportType) => {
        setExportMenuOpen(false);
        const { startDate, endDate } = filter;
        if ((exportType === 'summary' || exportType === 'selisih') && (!startDate || !endDate)) {
            alert('Harap pilih rentang "Dari Tanggal" dan "Sampai Tanggal" untuk ekspor ini.');
            return;
        }

        const params = new URLSearchParams({
            search: debouncedSearchTerm,
            storeId: filter.selectedStore,
            regionId: filter.selectedRegion,
            startDate: filter.startDate,
            endDate: filter.endDate,
        });

        let url, filename;
        switch (exportType) {
            case 'detail':
                url = `/transactions/export?${params.toString()}`;
                filename = `Detail-Transaksi-${new Date().toISOString().slice(0, 10)}.xlsx`;
                break;
            case 'summary':
                url = `/transactions/summary-export?${params.toString()}`;
                filename = `Rekap-Penjualan-${startDate}-to-${endDate}.xlsx`;
                break;
            case 'selisih':
                url = `/transactions/export-selisih?${params.toString()}`;
                filename = `Laporan-Selisih-${startDate}-to-${endDate}.xlsx`;
                break;
            default:
                return;
        }

        try {
            const response = await api.get(url, { responseType: 'blob' });
            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error(`Gagal mengekspor ${exportType}`, error);
            alert(`Gagal mengekspor data. Mungkin tidak ada data yang cocok dengan filter Anda.`);
        }
    };
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };
    
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { 
            style: 'currency', 
            currency: 'IDR', 
            minimumFractionDigits: 0 
        }).format(number);
    };
    
    const formatSelisih = (selisih) => {
        const value = parseFloat(selisih);
        if (isNaN(value)) return <span className="text-gray-400 text-sm">-</span>;
        
        const formatted = formatRupiah(Math.abs(value));
        
        if (value > 0) {
            return (
                <div className="flex items-center justify-end gap-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 font-semibold">{formatted}</span>
                </div>
            );
        }
        if (value < 0) {
            return (
                <div className="flex items-center justify-end gap-1">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span className="text-red-600 font-semibold">{formatted}</span>
                </div>
            );
        }
        return <span className="text-gray-600 font-medium">{formatted}</span>;
    };

    const filteredStores = useMemo(() => {
        if (filter.selectedRegion === 'all') {
            return stores;
        }
        return [
            { id: 'all', name: 'Semua Toko' },
            ...stores.filter(store => store.region_id === parseInt(filter.selectedRegion))
        ];
    }, [stores, filter.selectedRegion]);

    const regionOptions = useMemo(() => regions.map(r => ({ value: r.id, label: r.name })), [regions]);
    const storeOptions = useMemo(() => filteredStores.map(s => ({ value: s.id, label: s.name })), [filteredStores]);

    // Calculate statistics
    const stats = useMemo(() => {
        if (!transactions.length) return { total: 0, positive: 0, negative: 0 };
        
        const totalSelisih = transactions.reduce((sum, tx) => sum + (parseFloat(tx.selisih) || 0), 0);
        const positiveCount = transactions.filter(tx => parseFloat(tx.selisih) > 0).length;
        const negativeCount = transactions.filter(tx => parseFloat(tx.selisih) < 0).length;
        
        return {
            total: totalSelisih,
            positive: positiveCount,
            negative: negativeCount
        };
    }, [transactions]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                Laporan Transaksi
                            </h1>
                            <p className="text-gray-600">Kelola dan analisis data transaksi penjualan</p>
                        </div>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center justify-center px-4 py-2.5 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 border border-gray-300 shadow-sm transition-all"
                            >
                                <Filter className="h-5 w-5 mr-2" />
                                {showFilters ? 'Sembunyikan' : 'Tampilkan'} Filter
                            </button>
                            
                            <div className="relative" ref={exportMenuRef}>
                                <button 
                                    onClick={() => setExportMenuOpen(!isExportMenuOpen)}
                                    className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all"
                                >
                                    <Download className="h-5 w-5 mr-2" />
                                    Export Excel
                                    <ChevronDown className={`h-5 w-5 ml-1 transition-transform duration-200 ${isExportMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                <AnimatePresence>
                                    {isExportMenuOpen && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-20 border border-gray-200 overflow-hidden"
                                        >
                                            <div className="py-2">
                                                <button 
                                                    onClick={() => handleExport('detail')} 
                                                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors group"
                                                >
                                                    <div className="p-2 bg-blue-100 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors">
                                                        <FileText className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-medium">Laporan Detail</div>
                                                        <div className="text-xs text-gray-500">Detail transaksi lengkap</div>
                                                    </div>
                                                </button>
                                                <button 
                                                    onClick={() => handleExport('summary')} 
                                                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 transition-colors group"
                                                >
                                                    <div className="p-2 bg-purple-100 rounded-lg mr-3 group-hover:bg-purple-200 transition-colors">
                                                        <FileBarChart2 className="w-4 h-4 text-purple-600" />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-medium">Laporan Rekap</div>
                                                        <div className="text-xs text-gray-500">Ringkasan per toko & tanggal</div>
                                                    </div>
                                                </button>
                                                <button 
                                                    onClick={() => handleExport('selisih')} 
                                                    className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 transition-colors group"
                                                >
                                                    <div className="p-2 bg-amber-100 rounded-lg mr-3 group-hover:bg-amber-200 transition-colors">
                                                        <FileDiff className="w-4 h-4 text-amber-600" />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-medium">Laporan Selisih</div>
                                                        <div className="text-xs text-gray-500">Analisis selisih penjualan</div>
                                                    </div>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                {transactions.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Selisih</p>
                                    <p className={`text-2xl font-bold ${stats.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatRupiah(stats.total)}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-full ${stats.total >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                    {stats.total >= 0 ? (
                                        <TrendingUp className="w-6 h-6 text-green-600" />
                                    ) : (
                                        <TrendingDown className="w-6 h-6 text-red-600" />
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Selisih Positif</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.positive}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Selisih Negatif</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.negative}</p>
                                </div>
                                <div className="p-3 bg-red-100 rounded-full">
                                    <TrendingDown className="w-6 h-6 text-red-600" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Filter Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mb-6 overflow-hidden"
                        >
                            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Filter Pencarian</h3>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                                        >
                                            <X className="w-4 h-4" />
                                            Hapus Filter
                                        </button>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="lg:col-span-3">
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Pencarian</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text" 
                                                placeholder="Cari invoice, kasir, metode pembayaran..."
                                                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                value={filter.searchTerm} 
                                                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Regional</label>
                                        <SearchableSelect
                                            options={regionOptions} 
                                            value={filter.selectedRegion}
                                            onChange={(value) => handleFilterChange('selectedRegion', value || 'all')} 
                                            placeholder="Semua Regional"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Toko</label>
                                        <SearchableSelect
                                            options={storeOptions} 
                                            value={filter.selectedStore}
                                            onChange={(value) => handleFilterChange('selectedStore', value || 'all')} 
                                            placeholder="Semua Toko"
                                        />
                                    </div>
                                    
                                    <div>
                                        <DatePicker
                                            id="start-date" 
                                            label="Dari Tanggal" 
                                            value={filter.startDate}
                                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                        />
                                    </div>
                                    
                                    <div>
                                        <DatePicker
                                            id="end-date" 
                                            label="Sampai Tanggal" 
                                            value={filter.endDate}
                                            onChange={(e) => handleFilterChange('endDate', e.target.value)} 
                                            min={filter.startDate}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Transactions Table */}
                <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Invoice</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Kasir</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Toko</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Selisih</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-16">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                                <p className="text-gray-600">Memuat data transaksi...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : transactions.length > 0 ? (
                                    transactions.map((tx, index) => (
                                        <motion.tr 
                                            key={tx.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-blue-50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-mono font-semibold text-gray-900">{tx.invoice_number}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-900">{tx.cashier_name}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600">{tx.store_name || 'N/A'}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="text-sm font-semibold text-gray-900">{formatRupiah(tx.total_amount)}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {formatSelisih(tx.selisih)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600">{formatDate(tx.transaction_date)}</p>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-16">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                    <Search className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <p className="text-gray-600 font-medium">Tidak ada transaksi ditemukan</p>
                                                <p className="text-gray-400 text-sm mt-1">Coba ubah filter pencarian Anda</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    {!loading && transactions.length > 0 && (
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-sm text-gray-600">
                                    Halaman <span className="font-semibold text-gray-900">{currentPage}</span> dari{' '}
                                    <span className="font-semibold text-gray-900">{totalPages || 1}</span>
                                </p>
                                
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-all"
                                    >
                                        Sebelumnya
                                    </button>
                                    
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 transition-all"
                                    >
                                        Selanjutnya
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
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