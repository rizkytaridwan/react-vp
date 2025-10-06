import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import api from '../services/api';
import { Search, Download, ChevronDown, FileText, FileBarChart2, FileDiff, Filter, X, TrendingUp, TrendingDown, Calendar, Store } from 'lucide-react';
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
        if (isNaN(value)) return <span className="text-gray-400 text-sm font-medium">Rp 0</span>;
        
        const formatted = formatRupiah(Math.abs(value));
        
        if (value > 0) {
            return (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-green-700 font-semibold text-sm">{formatted}</span>
                </div>
            );
        }
        if (value < 0) {
            return (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded-lg border border-red-200">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span className="text-red-700 font-semibold text-sm">{formatted}</span>
                </div>
            );
        }
        return <span className="text-gray-600 font-medium text-sm">{formatted}</span>;
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                                    <FileBarChart2 className="w-7 h-7 text-white" />
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Laporan Transaksi
                                </h1>
                            </div>
                            <p className="text-gray-600 ml-14">Kelola dan analisis data transaksi penjualan Anda</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                            <button 
                                onClick={() => setShowFilters(!showFilters)}
                                className={`
                                    inline-flex items-center justify-center px-5 py-2.5 
                                    font-medium rounded-xl shadow-md
                                    transition-all duration-200 transform hover:scale-105
                                    ${showFilters 
                                        ? 'bg-white text-gray-700 border-2 border-blue-200 hover:border-blue-300' 
                                        : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800'
                                    }
                                `}
                            >
                                <Filter className="h-5 w-5 mr-2" />
                                {showFilters ? 'Sembunyikan' : 'Tampilkan'} Filter
                            </button>
                            
                            <div className="relative" ref={exportMenuRef}>
                                <button 
                                    onClick={() => setExportMenuOpen(!isExportMenuOpen)}
                                    className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
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
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl z-20 border border-gray-100 overflow-hidden"
                                        >
                                            <div className="p-2">
                                                <button 
                                                    onClick={() => handleExport('detail')} 
                                                    className="flex items-center w-full px-4 py-3.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-xl transition-all group"
                                                >
                                                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mr-3.5 group-hover:shadow-md transition-all">
                                                        <FileText className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-semibold text-gray-900">Laporan Detail</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">Detail transaksi lengkap</div>
                                                    </div>
                                                </button>
                                                <button 
                                                    onClick={() => handleExport('summary')} 
                                                    className="flex items-center w-full px-4 py-3.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 rounded-xl transition-all group"
                                                >
                                                    <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mr-3.5 group-hover:shadow-md transition-all">
                                                        <FileBarChart2 className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-semibold text-gray-900">Laporan Rekap</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">Ringkasan per toko & tanggal</div>
                                                    </div>
                                                </button>
                                                <button 
                                                    onClick={() => handleExport('selisih')} 
                                                    className="flex items-center w-full px-4 py-3.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100 rounded-xl transition-all group"
                                                >
                                                    <div className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl mr-3.5 group-hover:shadow-md transition-all">
                                                        <FileDiff className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-semibold text-gray-900">Laporan Selisih</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">Analisis selisih penjualan</div>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 border border-gray-100 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-2">Total Selisih</p>
                                    <p className={`text-2xl md:text-3xl font-bold ${stats.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatRupiah(stats.total)}
                                    </p>
                                </div>
                                <div className={`p-4 rounded-2xl shadow-lg ${stats.total >= 0 ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-red-500 to-red-600'}`}>
                                    {stats.total >= 0 ? (
                                        <TrendingUp className="w-7 h-7 text-white" />
                                    ) : (
                                        <TrendingDown className="w-7 h-7 text-white" />
                                    )}
                                </div>
                            </div>
                            <div className={`absolute inset-0 opacity-5 ${stats.total >= 0 ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-red-400 to-red-600'}`}></div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 border border-gray-100 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-2">Selisih Positif</p>
                                    <p className="text-2xl md:text-3xl font-bold text-green-600">{stats.positive}</p>
                                    <p className="text-xs text-gray-500 mt-1">Transaksi</p>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg">
                                    <TrendingUp className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 opacity-5"></div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 border border-gray-100 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-2">Selisih Negatif</p>
                                    <p className="text-2xl md:text-3xl font-bold text-red-600">{stats.negative}</p>
                                    <p className="text-xs text-gray-500 mt-1">Transaksi</p>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg">
                                    <TrendingDown className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 opacity-5"></div>
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
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-5 h-5 text-blue-600" />
                                        <h3 className="text-lg font-bold text-gray-900">Filter Pencarian</h3>
                                    </div>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all"
                                        >
                                            <X className="w-4 h-4" />
                                            Hapus Semua Filter
                                        </button>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                    <div className="lg:col-span-2">
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Pencarian</label>
                                        <div className="relative">
                                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text" 
                                                placeholder="Cari invoice, kasir, metode pembayaran..."
                                                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                                                value={filter.searchTerm} 
                                                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <SearchableSelect
                                            label="Regional"
                                            options={regionOptions} 
                                            value={filter.selectedRegion}
                                            onChange={(value) => handleFilterChange('selectedRegion', value || 'all')} 
                                            placeholder="Semua Regional"
                                        />
                                    </div>
                                    
                                    <div>
                                        <SearchableSelect
                                            label="Toko"
                                            options={storeOptions} 
                                            value={filter.selectedStore}
                                            onChange={(value) => handleFilterChange('selectedStore', value || 'all')} 
                                            placeholder="Semua Toko"
                                        />
                                    </div>
                                    
                                    <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                                        <DatePicker
                                            id="start-date" 
                                            label="Dari Tanggal" 
                                            value={filter.startDate}
                                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                        />
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
                <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600">
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">Invoice</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">Kasir</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">Toko</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-white">Total</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white">Selisih</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-20">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="relative">
                                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                                                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0"></div>
                                                </div>
                                                <p className="text-gray-600 font-medium mt-4">Memuat data transaksi...</p>
                                                <p className="text-gray-400 text-sm mt-1">Mohon tunggu sebentar</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : transactions.length > 0 ? (
                                    transactions.map((tx, index) => (
                                        <motion.tr 
                                            key={tx.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 group"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-mono font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                                                    {tx.invoice_number}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-gray-900">{tx.cashier_name}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Store className="w-4 h-4 text-gray-400" />
                                                    <p className="text-sm text-gray-700">{tx.store_name || 'N/A'}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="text-sm font-bold text-gray-900">{formatRupiah(tx.total_amount)}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {formatSelisih(tx.selisih)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <p className="text-sm text-gray-700">{formatDate(tx.transaction_date)}</p>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-20">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                                    <Search className="w-10 h-10 text-gray-400" />
                                                </div>
                                                <p className="text-gray-700 font-semibold text-lg">Tidak ada transaksi ditemukan</p>
                                                <p className="text-gray-500 text-sm mt-2">Coba ubah atau hapus filter pencarian Anda</p>
                                                {hasActiveFilters && (
                                                    <button
                                                        onClick={clearFilters}
                                                        className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                                    >
                                                        Reset Filter
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    {!loading && transactions.length > 0 && (
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Halaman</span>
                                    <span className="px-3 py-1 bg-blue-600 text-white font-bold rounded-lg text-sm">
                                        {currentPage}
                                    </span>
                                    <span className="text-sm text-gray-600">dari {totalPages || 1}</span>
                                </div>
                                
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
                                    >
                                        ← Sebelumnya
                                    </button>
                                    
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 border-2 border-blue-600 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                                    >
                                        Selanjutnya →
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