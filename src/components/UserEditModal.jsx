// src/components/UserEditModal.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const UserEditModal = ({ user, roles, stores, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({ role_id: '', store_id: '', status: '' });

    // Setiap kali user yang dipilih berubah, update state form di dalam modal
    useEffect(() => {
        if (user) {
            setFormData({
                // Cari ID role berdasarkan nama role user, atau set default jika tidak ada
                role_id: roles.find(r => r.name === user.role_name)?.id || '',
                // Cari ID toko berdasarkan nama toko user, atau set null jika tidak ada
                store_id: stores.find(s => s.name === user.store_name)?.id || null,
                status: user.status || 'pending',
            });
        }
    }, [user, roles, stores]);

    if (!isOpen || !user) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        // Kirim data yang sudah diupdate ke parent component
        onSave(formData);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={onClose}
                    />
                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Kelola User</h3>
                                <p className="text-gray-600">{user.full_name}</p>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            {/* Role Dropdown */}
                            <div>
                                <label htmlFor="role_id" className="block text-sm font-medium text-gray-700">Role</label>
                                <select name="role_id" value={formData.role_id || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                                    <option value="">-- Pilih Role --</option>
                                    {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                                </select>
                            </div>
                            {/* Store Dropdown */}
                            <div>
                                <label htmlFor="store_id" className="block text-sm font-medium text-gray-700">Toko</label>
                                <select name="store_id" value={formData.store_id || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                                    <option value="">-- Pilih Toko (Kosongkan untuk Super Admin) --</option>
                                    {stores.map(store => <option key={store.id} value={store.id}>{store.name}</option>)}
                                </select>
                            </div>
                            {/* Status Dropdown */}
                             <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                                    <option value="pending">Pending</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Simpan Perubahan</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UserEditModal;