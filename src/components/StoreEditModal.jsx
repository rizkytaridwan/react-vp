// src/components/StoreEditModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Store, MapPin, Phone, Info, Save, Building2 } from 'lucide-react';

const StoreEditModal = ({ store, isOpen, onClose, onSave, regions }) => {
    const [formData, setFormData] = useState({ 
        name: '', 
        address: '', 
        phone: '', 
        status: 'active', 
        region_id: '' 
    });
    const [errors, setErrors] = useState({});
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
            setFormData({ name: '', address: '', phone: '', status: 'active', region_id: '' });
        }
        setErrors({});
    }, [store, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear error saat user mulai mengetik
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Nama toko wajib diisi';
        if (!formData.region_id) newErrors.region_id = 'Regional wajib dipilih';
        if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
            newErrors.phone = 'Format nomor telepon tidak valid';
        }
        return newErrors;
    };

    const handleSave = () => {
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        onSave(formData, store ? store.id : null);
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
                    onClick={handleBackdropClick}
                >
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                    />
                    
                    {/* Modal */}
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                        animate={{ scale: 1, opacity: 1, y: 0 }} 
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto my-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-5 rounded-t-2xl">
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Store className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">
                                            {isEditing ? 'Edit Data Toko' : 'Tambah Toko Baru'}
                                        </h3>
                                        <p className="text-purple-100 text-sm mt-0.5">
                                            {isEditing ? 'Perbarui informasi toko' : 'Lengkapi form untuk menambah toko'}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={onClose} 
                                    className="p-2 hover:bg-white/20 rounded-lg transition-all text-white"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                        </div>
                        
                        {/* Body */}
                        <div className="p-6 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
                            {/* Nama Toko */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <Store className="w-4 h-4 text-purple-600" />
                                    Nama Toko
                                    <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleChange}
                                    placeholder="Contoh: Toko Cabang Jakarta Pusat"
                                    className={`w-full p-3 border-2 rounded-xl focus:outline-none transition-all ${
                                        errors.name 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                                            : 'border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
                                    }`}
                                />
                                {errors.name && (
                                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                        <Info className="w-4 h-4" />
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Regional */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <Building2 className="w-4 h-4 text-purple-600" />
                                    Regional
                                    <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    name="region_id" 
                                    value={formData.region_id} 
                                    onChange={handleChange}
                                    className={`w-full p-3 border-2 rounded-xl focus:outline-none transition-all appearance-none bg-white ${
                                        errors.region_id 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                                            : 'border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
                                    }`}
                                >
                                    <option value="">-- Pilih Regional --</option>
                                    {regions.map(region => (
                                        <option key={region.id} value={region.id}>{region.name}</option>
                                    ))}
                                </select>
                                {errors.region_id && (
                                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                        <Info className="w-4 h-4" />
                                        {errors.region_id}
                                    </p>
                                )}
                            </div>

                            {/* Alamat */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <MapPin className="w-4 h-4 text-purple-600" />
                                    Alamat
                                </label>
                                <textarea 
                                    name="address" 
                                    value={formData.address} 
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Contoh: Jl. Sudirman No. 123, Jakarta Pusat"
                                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
                                ></textarea>
                                <p className="mt-1.5 text-xs text-gray-500">Alamat lengkap toko (opsional)</p>
                            </div>

                            {/* No. Telepon */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <Phone className="w-4 h-4 text-purple-600" />
                                    No. Telepon
                                </label>
                                <input 
                                    type="text" 
                                    name="phone" 
                                    value={formData.phone} 
                                    onChange={handleChange}
                                    placeholder="Contoh: 021-1234567 atau 08123456789"
                                    className={`w-full p-3 border-2 rounded-xl focus:outline-none transition-all ${
                                        errors.phone 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                                            : 'border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
                                    }`}
                                />
                                {errors.phone ? (
                                    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                        <Info className="w-4 h-4" />
                                        {errors.phone}
                                    </p>
                                ) : (
                                    <p className="mt-1.5 text-xs text-gray-500">Format: angka, +, -, spasi, atau tanda kurung</p>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <Info className="w-4 h-4 text-purple-600" />
                                    Status Toko
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className={`relative flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                        formData.status === 'active' 
                                            ? 'border-green-500 bg-green-50' 
                                            : 'border-gray-200 hover:border-green-300 bg-white'
                                    }`}>
                                        <input 
                                            type="radio" 
                                            name="status" 
                                            value="active" 
                                            checked={formData.status === 'active'}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className="flex items-center gap-2">
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                                formData.status === 'active' 
                                                    ? 'border-green-500 bg-green-500' 
                                                    : 'border-gray-300'
                                            }`}>
                                                {formData.status === 'active' && (
                                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                                )}
                                            </div>
                                            <span className={`font-semibold ${
                                                formData.status === 'active' ? 'text-green-700' : 'text-gray-600'
                                            }`}>
                                                Aktif
                                            </span>
                                        </div>
                                    </label>

                                    <label className={`relative flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                        formData.status === 'inactive' 
                                            ? 'border-red-500 bg-red-50' 
                                            : 'border-gray-200 hover:border-red-300 bg-white'
                                    }`}>
                                        <input 
                                            type="radio" 
                                            name="status" 
                                            value="inactive" 
                                            checked={formData.status === 'inactive'}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className="flex items-center gap-2">
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                                formData.status === 'inactive' 
                                                    ? 'border-red-500 bg-red-500' 
                                                    : 'border-gray-300'
                                            }`}>
                                                {formData.status === 'inactive' && (
                                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                                )}
                                            </div>
                                            <span className={`font-semibold ${
                                                formData.status === 'inactive' ? 'text-red-700' : 'text-gray-600'
                                            }`}>
                                                Nonaktif
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-blue-900 mb-1">Informasi Penting</p>
                                        <p className="text-xs text-blue-700">
                                            Pastikan data yang Anda masukkan sudah benar. Toko dengan status "Nonaktif" tidak akan muncul dalam pilihan transaksi.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex flex-col sm:flex-row gap-3">
                            <button 
                                onClick={onClose} 
                                className="flex-1 sm:flex-initial px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-100 border-2 border-gray-200 transition-all"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={handleSave} 
                                className="flex-1 sm:flex-initial px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Save className="w-5 h-5" />
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