// src/components/StoreEditModal.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const StoreEditModal = ({ store, isOpen, onClose, onSave, regions }) => {
    const [formData, setFormData] = useState({ name: '', address: '', phone: '', status: 'active', region_id: '' });
    const isEditing = !!store;

    useEffect(() => {
        if (store) {
            setFormData({
                name: store.name || '',
                address: store.address || '',
                phone: store.phone || '',
                status: store.status || 'active',
                region_id: store.region_id || '',
            });
        } else {
            // Reset form untuk mode "Tambah Baru"
            setFormData({ name: '', address: '', phone: '', status: 'active', region_id: '' });
        }
    }, [store]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        onSave(formData, store ? store.id : null);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">
                                {isEditing ? 'Edit Toko' : 'Tambah Toko Baru'}
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Toko</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Regional</label>
                                <select name="region_id" value={formData.region_id} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                                    <option value="">-- Pilih Regional --</option>
                                    {regions.map(region => (
                                        <option key={region.id} value={region.id}>{region.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Alamat</label>
                                <textarea name="address" value={formData.address} onChange={handleChange} rows="3" className="mt-1 block w-full p-2 border border-gray-300 rounded-md"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">No. Telepon</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Batal</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                                {isEditing ? 'Simpan Perubahan' : 'Tambah Toko'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default StoreEditModal;