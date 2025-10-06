// src/pages/UsersPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import UserEditModal from '../components/UserEditModal';
import { Edit, Search, Users, UserCheck, Clock, Shield, Store, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

// Custom hook untuk debounce
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
}

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [roles, setRoles] = useState([]);
    const [stores, setStores] = useState([]);
    const [regions, setRegions] = useState([]);

    // State untuk search dan paginasi
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Fungsi fetchUsers dengan paginasi dan pencarian server-side
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                search: debouncedSearchTerm,
            });
            const res = await api.get(`/users?${params.toString()}`);
            setUsers(res.data.users);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error("Gagal mengambil data user", error);
            setUsers([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearchTerm]);

    // Fetch data dropdown (roles, stores, regions) hanya sekali
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [rolesRes, storesRes, regionsRes] = await Promise.all([
                    api.get('/users/roles'),
                    api.get('/users/stores'),
                    api.get('/users/regions')
                ]);
                setRoles(rolesRes.data);
                setStores(storesRes.data);
                setRegions(regionsRes.data);
            } catch (error) {
                console.error("Gagal mengambil data dropdown", error);
            }
        };
        fetchDropdownData();
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Reset ke halaman 1 saat pencarian berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm]);

    const handleOpenModal = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleSaveUser = async (updatedData) => {
        if (!selectedUser) return;
        try {
            // Logika berdasarkan role yang dipilih
            const selectedRole = roles.find(r => r.id === parseInt(updatedData.role_id, 10));
            const payload = {
                role_id: updatedData.role_id,
                status: updatedData.status,
                store_id: null,
                region_id: null
            };

            // Jika Kepala Cabang: harus ada region_id, store_id = null
            if (selectedRole?.name === 'Kepala Cabang') {
                payload.region_id = updatedData.region_id || null;
                payload.store_id = null;
            } 
            // Jika role lain: bisa punya store_id, region_id = null
            else {
                payload.store_id = updatedData.store_id || null;
                payload.region_id = null;
            }

            await api.put(`/users/${selectedUser.id}`, payload);
            alert(`User ${selectedUser.full_name} berhasil diupdate!`);
            handleCloseModal();
            fetchUsers();
        } catch (error) {
            console.error("Gagal mengupdate user", error);
            alert("Gagal mengupdate user. Silakan coba lagi.");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active': return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
            case 'pending': return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
            case 'inactive': return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
            default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl shadow-lg">
                                    <Users className="w-7 h-7 text-white" />
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Manajemen User
                                </h1>
                            </div>
                            <p className="text-gray-600 ml-14">Kelola akses dan role pengguna sistem</p>
                        </div>
                        
                        <div className="relative flex-1 lg:flex-initial">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama atau username..."
                                className="w-full lg:w-72 pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
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
                                <p className="text-sm font-medium text-gray-600 mb-2">Total User</p>
                                <p className="text-3xl font-bold text-indigo-600">{users.length}</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg">
                                <Users className="w-7 h-7 text-white" />
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
                                <p className="text-sm font-medium text-gray-600 mb-2">User Aktif</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {users.filter(u => u.status === 'active').length}
                                </p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg">
                                <UserCheck className="w-7 h-7 text-white" />
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
                                <p className="text-sm font-medium text-gray-600 mb-2">Pending</p>
                                <p className="text-3xl font-bold text-yellow-600">
                                    {users.filter(u => u.status === 'pending').length}
                                </p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-lg">
                                <Clock className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Table Desktop View */}
                <div className="hidden lg:block bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-600">
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">Nama Lengkap</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">Username</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">Toko Utama</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">Regional</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white">Status</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-20">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="relative">
                                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200"></div>
                                                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 absolute top-0"></div>
                                                </div>
                                                <p className="text-gray-600 font-medium mt-4">Memuat data user...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : users.length > 0 ? (
                                    users.map((user, index) => (
                                        <motion.tr 
                                            key={user.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-transparent transition-all duration-200 group"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                                                    {user.full_name}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600">@{user.telegram_username}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="w-4 h-4 text-indigo-500" />
                                                    <p className="text-sm text-gray-700 font-medium">{user.role_name || 'Pending'}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Store className="w-4 h-4 text-gray-400" />
                                                    <p className="text-sm text-gray-600">{user.store_name || 'N/A'}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <p className="text-sm text-gray-600">{user.region_name || 'N/A'}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-3 py-1.5 font-semibold text-xs rounded-lg shadow-sm ${getStatusBadge(user.status)}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => handleOpenModal(user)} 
                                                    className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all hover:shadow-md"
                                                >
                                                    <Edit size={18}/>
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-20">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                                    <Users className="w-10 h-10 text-gray-400" />
                                                </div>
                                                <p className="text-gray-700 font-semibold text-lg">Tidak ada user ditemukan</p>
                                                <p className="text-gray-500 text-sm mt-2">Coba ubah pencarian Anda</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && users.length > 0 && (
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Halaman</span>
                                    <span className="px-3 py-1 bg-indigo-600 text-white font-bold rounded-lg text-sm">
                                        {currentPage}
                                    </span>
                                    <span className="text-sm text-gray-600">dari {totalPages || 1}</span>
                                </div>
                                
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                                    >
                                        ← Sebelumnya
                                    </button>
                                    
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 border-2 border-indigo-600 rounded-xl hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
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
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200"></div>
                                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 absolute top-0"></div>
                                </div>
                                <p className="text-gray-600 font-medium mt-4">Memuat data user...</p>
                            </div>
                        </div>
                    ) : users.length > 0 ? (
                        users.map((user, index) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 hover:shadow-xl transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-md">
                                            <Users className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{user.full_name}</h3>
                                            <p className="text-sm text-gray-600">@{user.telegram_username}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-1 font-semibold text-xs rounded-lg ${getStatusBadge(user.status)}`}>
                                        {user.status}
                                    </span>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div className="flex items-start gap-2">
                                        <Shield className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">Role</p>
                                            <p className="text-sm text-gray-700 font-medium">{user.role_name || 'Pending'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Store className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">Toko</p>
                                            <p className="text-sm text-gray-700">{user.store_name || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">Regional</p>
                                            <p className="text-sm text-gray-700">{user.region_name || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleOpenModal(user)} 
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold rounded-xl transition-all"
                                >
                                    <Edit size={16}/>
                                    Edit User
                                </button>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                            <div className="flex flex-col items-center justify-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                    <Users className="w-10 h-10 text-gray-400" />
                                </div>
                                <p className="text-gray-700 font-semibold text-lg">Tidak ada user ditemukan</p>
                                <p className="text-gray-500 text-sm mt-2">Coba ubah pencarian Anda</p>
                            </div>
                        </div>
                    )}

                    {/* Mobile Pagination */}
                    {!loading && users.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Halaman</span>
                                    <span className="px-3 py-1 bg-indigo-600 text-white font-bold rounded-lg text-sm">
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
                                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <UserEditModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveUser}
                user={selectedUser}
                roles={roles}
                stores={stores}
                regions={regions}
            />
        </div>
    );
};

export default UsersPage;