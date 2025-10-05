// src/components/UserEditModal.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const UserEditModal = ({ user, roles, stores, regions, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({ role_id: '', store_id: '', status: '', region_id: '' });

    const selectedRoleName = roles.find(r => r.id === parseInt(formData.role_id, 10))?.name;

    useEffect(() => {
        if (user) {
            setFormData({
                role_id: roles.find(r => r.name === user.role_name)?.id || '',
                store_id: stores.find(s => s.name === user.store_name)?.id || null,
                status: user.status || 'pending',
                region_id: user.region_id || '',
            });
        }
    }, [user, roles, stores]);

    if (!isOpen || !user) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            // Reset store_id jika role adalah 'Kepala Cabang'
            if (name === 'role_id' && roles.find(r => r.id === parseInt(value, 10))?.name === 'Kepala Cabang') {
                newState.store_id = '';
            }
            // Reset region_id jika role BUKAN 'Kepala Cabang'
            if (name === 'role_id' && roles.find(r => r.id === parseInt(value, 10))?.name !== 'Kepala Cabang') {
                newState.region_id = '';
            }
            return newState;
        });
    };

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={onClose}
                    />
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
                            <div>
                                <label htmlFor="role_id" className="block text-sm font-medium text-gray-700">Role</label>
                                <select name="role_id" value={formData.role_id || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                                    <option value="">-- Pilih Role --</option>
                                    {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                                </select>
                            </div>
                            
                            {/* Tampilkan dropdown Toko jika role BUKAN Kepala Cabang */}
                            {selectedRoleName !== 'Kepala Cabang' && (
                                <div>
                                    <label htmlFor="store_id" className="block text-sm font-medium text-gray-700">Toko</label>
                                    <select name="store_id" value={formData.store_id || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                                        <option value="">-- Pilih Toko (Kosongkan jika tidak relevan) --</option>
                                        {stores.map(store => <option key={store.id} value={store.id}>{store.name}</option>)}
                                    </select>
                                </div>
                            )}

                            {/* Tampilkan dropdown Regional jika role adalah Kepala Cabang */}
                            {selectedRoleName === 'Kepala Cabang' && (
                                <div>
                                    <label htmlFor="region_id" className="block text-sm font-medium text-gray-700">Regional</label>
                                    <select name="region_id" value={formData.region_id || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                                        <option value="">-- Pilih Regional --</option>
                                        {regions.map(region => <option key={region.id} value={region.id}>{region.name}</option>)}
                                    </select>
                                </div>
                            )}

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