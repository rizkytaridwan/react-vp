// src/pages/StoresPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import StoreEditModal from '../components/StoreEditModal';
import { Plus, Edit, Trash2, Search, Store, MapPin, Phone, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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

const StoresPage = () => {
    const [stores, setStores] = useState([]);
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const fetchStores = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                search: debouncedSearchTerm,
            });
            const res = await api.get(`/stores?${params.toString()}`);
            setStores(res.data.stores);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error("Gagal mengambil data toko", error);
            setStores([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearchTerm]);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [storesRes, regionsRes] = await Promise.all([
                    api.get(`/stores?page=${currentPage}&search=${debouncedSearchTerm}`),
                    api.get('/users/regions')
                ]);
                setStores(storesRes.data.stores);
                setTotalPages(storesRes.data.totalPages);
                setRegions(regionsRes.data);
            } catch (error) {
                console.error("Gagal mengambil data awal", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [currentPage, debouncedSearchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm]);

    const handleOpenModal = (store = null) => {
        setSelectedStore(store);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedStore(null);
    };

    const handleSaveStore = async (formData, storeId) => {
        try {
            if (storeId) {
                await api.put(`/stores/${storeId}`, formData);
                alert('Toko berhasil diupdate!');
            } else {
                await api.post('/stores', formData);
                alert('Toko baru berhasil ditambahkan!');
            }
            handleCloseModal();
            fetchStores();
        } catch (error) {
            console.error("Gagal menyimpan toko", error);
            alert(`Gagal: ${error.response?.data?.msg || 'Terjadi kesalahan'}`);
        }
    };

    const handleDeleteStore = async (storeId, storeName) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus toko "${storeName}"? Aksi ini tidak bisa dibatalkan.`)) {
            try {
                await api.delete(`/stores/${storeId}`);
                alert('Toko berhasil dihapus!');
                fetchStores();
            } catch (error) {
                console.error("Gagal menghapus toko", error);
                alert(`Gagal Menghapus: ${error.response?.data?.msg || 'Terjadi kesalahan'}`);
            }
        }
    };
    
    const getStatusBadge = (status) => {
        return status === 'active' 
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
            : 'bg-gradient-to-r from-red-500 to-red-600 text-white';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2.5 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-lg">
                                    <Store className="w-7 h-7 text-white" />
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Manajemen Toko
                                </h1>
                            </div>
                            <p className="text-gray-600 ml-14">Kelola data toko dan lokasi cabang</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div className="relative flex-1 sm:flex-initial">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama atau alamat toko..."
                                    className="w-full sm:w-72 pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={() => handleOpenModal()} 
                                className="inline-flex items-center justify-center px-5 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                            >
                                <Plus size={20} className="mr-2" />
                                Tambah Toko
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 border border-gray-100 transition-all duration-300 hover:-translate-y-1"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-2">Total Toko</p>
                                <p className="text-3xl font-bold text-purple-600">{stores.length}</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                                <Store className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 border border-gray-100 transition-all duration-300 hover:-translate-y-1"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-2">Toko Aktif</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {stores.filter(s => s.status === 'active').length}
                                </p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg">
                                <Store className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 border border-gray-100 transition-all duration-300 hover:-translate-y-1"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-2">Toko Nonaktif</p>
                                <p className="text-3xl font-bold text-red-600">
                                    {stores.filter(s => s.status === 'inactive').length}
                                </p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg">
                                <AlertCircle className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Table Desktop View */}
                <div className="hidden lg:block bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600">
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">Nama Toko</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">Regional</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">Alamat</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">Telepon</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white">Status</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-20">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="relative">
                                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
                                                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600 absolute top-0"></div>
                                                </div>
                                                <p className="text-gray-600 font-medium mt-4">Memuat data toko...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : stores.length > 0 ? (
                                    stores.map((store, index) => (
                                        <motion.tr 
                                            key={store.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-transparent transition-all duration-200 group"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                                                    {store.name}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-purple-500" />
                                                    <p className="text-sm text-gray-700 font-medium">{store.region_name || 'N/A'}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600">{store.address || '-'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <p className="text-sm text-gray-600">{store.phone || '-'}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-3 py-1.5 font-semibold text-xs rounded-lg shadow-sm ${getStatusBadge(store.status)}`}>
                                                    {store.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        onClick={() => handleOpenModal(store)} 
                                                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all hover:shadow-md"
                                                    >
                                                        <Edit size={18}/>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteStore(store.id, store.name)} 
                                                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all hover:shadow-md"
                                                    >
                                                        <Trash2 size={18}/>
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-20">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                                    <Store className="w-10 h-10 text-gray-400" />
                                                </div>
                                                <p className="text-gray-700 font-semibold text-lg">Tidak ada toko ditemukan</p>
                                                <p className="text-gray-500 text-sm mt-2">Coba ubah pencarian atau tambah toko baru</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && stores.length > 0 && (
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Halaman</span>
                                    <span className="px-3 py-1 bg-purple-600 text-white font-bold rounded-lg text-sm">
                                        {currentPage}
                                    </span>
                                    <span className="text-sm text-gray-600">dari {totalPages || 1}</span>
                                </div>
                                
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-purple-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                                    >
                                        ← Sebelumnya
                                    </button>
                                    
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-700 border-2 border-purple-600 rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                                    >
                                        Selanjutnya →
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="flex flex-col items-center justify-center">
                                <div className="relative">
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
                                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600 absolute top-0"></div>
                                </div>
                                <p className="text-gray-600 font-medium mt-4">Memuat data toko...</p>
                            </div>
                        </div>
                    ) : stores.length > 0 ? (
                        stores.map((store, index) => (
                            <motion.div
                                key={store.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 hover:shadow-xl transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
                                            <Store className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{store.name}</h3>
                                            <span className={`inline-flex items-center px-2.5 py-1 mt-1 font-semibold text-xs rounded-lg ${getStatusBadge(store.status)}`}>
                                                {store.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">Regional</p>
                                            <p className="text-sm text-gray-700 font-medium">{store.region_name || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">Alamat</p>
                                            <p className="text-sm text-gray-700">{store.address || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">Telepon</p>
                                            <p className="text-sm text-gray-700">{store.phone || '-'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-3 border-t border-gray-100">
                                    <button 
                                        onClick={() => handleOpenModal(store)} 
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold rounded-xl transition-all"
                                    >
                                        <Edit size={16}/>
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteStore(store.id, store.name)} 
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl transition-all"
                                    >
                                        <Trash2 size={16}/>
                                        Hapus
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                            <div className="flex flex-col items-center justify-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                    <Store className="w-10 h-10 text-gray-400" />
                                </div>
                                <p className="text-gray-700 font-semibold text-lg">Tidak ada toko ditemukan</p>
                                <p className="text-gray-500 text-sm mt-2">Coba ubah pencarian atau tambah toko baru</p>
                            </div>
                        </div>
                    )}

                    {/* Mobile Pagination */}
                    {!loading && stores.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Halaman</span>
                                    <span className="px-3 py-1 bg-purple-600 text-white font-bold rounded-lg text-sm">
                                        {currentPage}
                                    </span>
                                    <span className="text-sm text-gray-600">dari {totalPages || 1}</span>
                                </div>
                                
                                <div className="flex gap-2 w-full">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 border-2 border-gray-300 rounded-xl hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        ← Prev
                                    </button>
                                    
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <StoreEditModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveStore}
                store={selectedStore}
                regions={regions} 
            />
        </div>
    );
};

export default StoresPage;