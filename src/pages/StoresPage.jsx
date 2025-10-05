// src/pages/StoresPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import StoreEditModal from '../components/StoreEditModal';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

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

const StoresPage = () => {
    const [stores, setStores] = useState([]);
    const [regions, setRegions] = useState([]); // State untuk menyimpan daftar regional
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState(null);
    
    // State untuk search dan paginasi
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

    // Fetch data awal (stores & regions)
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // Di sini perubahannya:
                const [storesRes, regionsRes] = await Promise.all([
                    api.get(`/stores?page=${currentPage}&search=${debouncedSearchTerm}`),
                    api.get('/users/regions') // UBAH INI dari '/regions' menjadi '/users/regions'
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


    // Efek untuk mereset ke halaman 1 saat filter pencarian berubah
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
        return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    return (
        <div className="container mx-auto">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Manajemen Toko</h1>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau alamat..."
                            className="w-full sm:w-64 p-2 pl-10 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={() => handleOpenModal()} className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700">
                        <Plus size={20} className="mr-2" />
                        Tambah Toko
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                         <thead>
                            <tr className="bg-gray-200 text-gray-600 uppercase text-sm">
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Nama Toko</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Regional</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Alamat</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Telepon</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-center">Status</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-center">Aksi</th>
                            </tr>
                         </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-10">Memuat data toko...</td></tr>
                            ) : 
                            stores.length > 0 ? (
                                stores.map((store) => (
                                    <tr key={store.id} className="border-b border-gray-200 hover:bg-gray-100">
                                        <td className="px-5 py-4 text-sm"><p className="text-gray-900 whitespace-no-wrap font-semibold">{store.name}</p></td>
                                        <td className="px-5 py-4 text-sm"><p className="text-gray-700 whitespace-no-wrap">{store.region_name || 'N/A'}</p></td>
                                        <td className="px-5 py-4 text-sm"><p className="text-gray-600 whitespace-no-wrap">{store.address || '-'}</p></td>
                                        <td className="px-5 py-4 text-sm"><p className="text-gray-600 whitespace-no-wrap">{store.phone || '-'}</p></td>
                                        <td className="px-5 py-4 text-sm text-center">
                                            <span className={`px-3 py-1 font-semibold leading-tight rounded-full ${getStatusBadge(store.status)}`}>
                                                {store.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-center space-x-2">
                                            <button onClick={() => handleOpenModal(store)} className="text-indigo-600 hover:text-indigo-900 p-1"><Edit size={18}/></button>
                                            <button onClick={() => handleDeleteStore(store.id, store.name)} className="text-red-600 hover:text-red-900 p-1"><Trash2 size={18}/></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="text-center py-10 text-gray-500">Tidak ada toko ditemukan.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Komponen Paginasi */}
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