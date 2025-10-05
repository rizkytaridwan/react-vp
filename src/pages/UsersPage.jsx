// src/pages/UsersPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import UserEditModal from '../components/UserEditModal';
import { Edit, Search } from 'lucide-react';

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
    const [regions, setRegions] = useState([]); // Tambahkan state untuk regions

    // State untuk search dan paginasi
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Fungsi fetchUsers sekarang mendukung paginasi dan pencarian server-side
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

    // Fetch data awal (roles, stores, & regions) hanya sekali
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [rolesRes, storesRes, regionsRes] = await Promise.all([
                    api.get('/users/roles'),
                    api.get('/users/stores'),
                    api.get('/regions') // Asumsi endpoint baru
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
            const payload = {
                ...updatedData,
                store_id: updatedData.store_id || null,
                region_id: updatedData.region_id || null, // sertakan region_id
            };
            await api.put(`/users/${selectedUser.id}`, payload);
            alert(`User ${selectedUser.full_name} berhasil diupdate!`);
            handleCloseModal();
            fetchUsers(); // Muat ulang data user untuk menampilkan perubahan
        } catch (error) {
            console.error("Gagal mengupdate user", error);
            alert("Gagal mengupdate user. Silakan coba lagi.");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'inactive': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="container mx-auto">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Manajemen User</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari nama atau username..."
                        className="w-full sm:w-64 p-2 pl-10 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                         <thead>
                            <tr className="bg-gray-200 text-gray-600 uppercase text-sm">
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Nama Lengkap</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Username</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Role</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Toko</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left">Regional</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-center">Status</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-10">Memuat data user...</td></tr>
                            ) : users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-100">
                                        <td className="px-5 py-4 text-sm"><p className="text-gray-900 whitespace-no-wrap font-semibold">{user.full_name}</p></td>
                                        <td className="px-5 py-4 text-sm"><p className="text-gray-600 whitespace-no-wrap">@{user.telegram_username}</p></td>
                                        <td className="px-5 py-4 text-sm"><p className="text-gray-900 whitespace-no-wrap">{user.role_name || 'Pending'}</p></td>
                                        <td className="px-5 py-4 text-sm"><p className="text-gray-600 whitespace-no-wrap">{user.store_name || 'N/A'}</p></td>
                                        <td className="px-5 py-4 text-sm"><p className="text-gray-600 whitespace-no-wrap">{user.region_name || 'N/A'}</p></td>
                                        <td className="px-5 py-4 text-sm text-center">
                                            <span className={`px-3 py-1 font-semibold leading-tight rounded-full ${getStatusBadge(user.status)}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-center">
                                            <button onClick={() => handleOpenModal(user)} className="text-indigo-600 hover:text-indigo-900 font-semibold p-1">
                                                <Edit size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="7" className="text-center py-10 text-gray-500">Tidak ada user ditemukan.</td></tr>
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

            <UserEditModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveUser}
                user={selectedUser}
                roles={roles}
                stores={stores}
                regions={regions} // Kirimkan regions ke modal
            />
        </div>
    );
};

export default UsersPage;