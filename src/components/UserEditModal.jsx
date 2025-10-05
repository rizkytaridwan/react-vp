// src/components/UserEditModal.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Shield, Store, MapPin, Info, Save, AlertCircle } from 'lucide-react';

const UserEditModal = ({ user, roles, stores, regions, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({ 
        role_id: '', 
        store_id: '', 
        status: 'pending', 
        region_id: '' 
    });

    const selectedRoleName = roles.find(r => r.id === parseInt(formData.role_id, 10))?.name;

    useEffect(() => {
        if (user && roles.length > 0) {
            const roleId = roles.find(r => r.name === user.role_name)?.id || '';
            
            setFormData({
                role_id: roleId || '',
                store_id: user.store_id || '',
                status: user.status || 'pending',
                region_id: user.region_id || '',
            });
        }
    }, [user, roles]);

    if (!isOpen || !user) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            
            // Reset store_id jika role adalah 'Kepala Cabang'
            if (name === 'role_id') {
                const selectedRole = roles.find(r => r.id === parseInt(value, 10));
                if (selectedRole?.name === 'Kepala Cabang') {
                    newState.store_id = '';
                    // Jangan reset region_id karena Kepala Cabang butuh region
                } else {
                    // Untuk role lain, reset region_id
                    newState.region_id = '';
                }
            }
            
            return newState;
        });
    };

    const handleSave = () => {
        // Validasi
        if (!formData.role_id) {
            alert('Role harus dipilih!');
            return;
        }

        const selectedRole = roles.find(r => r.id === parseInt(formData.role_id, 10));
        
        // Validasi khusus untuk Kepala Cabang
        if (selectedRole?.name === 'Kepala Cabang' && !formData.region_id) {
            alert('Kepala Cabang harus memilih Regional!');
            return;
        }

        // Validasi khusus untuk Kepala Toko
        if (selectedRole?.name === 'Kepala Toko' && !formData.store_id) {
            alert('Kepala Toko harus memilih Toko!');
            return;
        }

        // Kirim data ke parent
        onSave(formData);
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
                        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5 rounded-t-2xl">
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Kelola User</h3>
                                        <p className="text-indigo-100 text-sm mt-0.5">{user.full_name}</p>
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
                            {/* Role */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <Shield className="w-4 h-4 text-indigo-600" />
                                    Role
                                    <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    name="role_id" 
                                    value={formData.role_id || ''} 
                                    onChange={handleChange}
                                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all appearance-none bg-white"
                                >
                                    <option value="">-- Pilih Role --</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                                <p className="mt-1.5 text-xs text-gray-500">Tentukan hak akses pengguna</p>
                            </div>
                            
                            {/* Toko - Tampilkan jika role BUKAN Kepala Cabang */}
                            {selectedRoleName && selectedRoleName !== 'Kepala Cabang' && (
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <Store className="w-4 h-4 text-indigo-600" />
                                        Toko
                                        {selectedRoleName === 'Kepala Toko' && <span className="text-red-500">*</span>}
                                    </label>
                                    <select 
                                        name="store_id" 
                                        value={formData.store_id || ''} 
                                        onChange={handleChange}
                                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all appearance-none bg-white"
                                    >
                                        <option value="">-- Pilih Toko {selectedRoleName === 'Cashier' || selectedRoleName === 'Store Manager' ? '(Opsional)' : ''} --</option>
                                        {stores.map(store => (
                                            <option key={store.id} value={store.id}>{store.name}</option>
                                        ))}
                                    </select>
                                    <p className="mt-1.5 text-xs text-gray-500">
                                        {selectedRoleName === 'Kepala Toko' 
                                            ? 'Pilih toko utama yang akan dikelola' 
                                            : 'Kosongkan jika user tidak terkait toko tertentu'}
                                    </p>
                                </div>
                            )}

                            {/* Regional - Tampilkan jika role adalah Kepala Cabang */}
                            {selectedRoleName === 'Kepala Cabang' && (
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <MapPin className="w-4 h-4 text-indigo-600" />
                                        Regional
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select 
                                        name="region_id" 
                                        value={formData.region_id || ''} 
                                        onChange={handleChange}
                                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all appearance-none bg-white"
                                    >
                                        <option value="">-- Pilih Regional --</option>
                                        {regions.map(region => (
                                            <option key={region.id} value={region.id}>{region.name}</option>
                                        ))}
                                    </select>
                                    <p className="mt-1.5 text-xs text-gray-500">Regional yang akan dikelola kepala cabang</p>
                                </div>
                            )}

                            {/* Status */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <Info className="w-4 h-4 text-indigo-600" />
                                    Status User
                                </label>
                                <div className="grid grid-cols-3 gap-3">
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
                                        <div className="flex flex-col items-center gap-1">
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                                formData.status === 'active' 
                                                    ? 'border-green-500 bg-green-500' 
                                                    : 'border-gray-300'
                                            }`}>
                                                {formData.status === 'active' && (
                                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                                )}
                                            </div>
                                            <span className={`font-semibold text-sm ${
                                                formData.status === 'active' ? 'text-green-700' : 'text-gray-600'
                                            }`}>
                                                Active
                                            </span>
                                        </div>
                                    </label>

                                    <label className={`relative flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                        formData.status === 'pending' 
                                            ? 'border-yellow-500 bg-yellow-50' 
                                            : 'border-gray-200 hover:border-yellow-300 bg-white'
                                    }`}>
                                        <input 
                                            type="radio" 
                                            name="status" 
                                            value="pending" 
                                            checked={formData.status === 'pending'}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className="flex flex-col items-center gap-1">
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                                formData.status === 'pending' 
                                                    ? 'border-yellow-500 bg-yellow-500' 
                                                    : 'border-gray-300'
                                            }`}>
                                                {formData.status === 'pending' && (
                                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                                )}
                                            </div>
                                            <span className={`font-semibold text-sm ${
                                                formData.status === 'pending' ? 'text-yellow-700' : 'text-gray-600'
                                            }`}>
                                                Pending
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
                                        <div className="flex flex-col items-center gap-1">
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                                formData.status === 'inactive' 
                                                    ? 'border-red-500 bg-red-500' 
                                                    : 'border-gray-300'
                                            }`}>
                                                {formData.status === 'inactive' && (
                                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                                )}
                                            </div>
                                            <span className={`font-semibold text-sm ${
                                                formData.status === 'inactive' ? 'text-red-700' : 'text-gray-600'
                                            }`}>
                                                Inactive
                                            </span>
                                        </div>
                                    </label>
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    Status aktif memberikan akses penuh ke sistem
                                </p>
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-blue-900 mb-1">Informasi Penting</p>
                                        <ul className="text-xs text-blue-700 space-y-1">
                                            <li>• User dengan status "Inactive" tidak dapat mengakses sistem</li>
                                            <li>• <strong>Kepala Cabang</strong> harus memilih Regional (tidak perlu toko)</li>
                                            <li>• <strong>Kepala Toko</strong> harus memilih toko yang akan dikelola</li>
                                            <li>• Role lain (Cashier, Store Manager) toko bersifat opsional</li>
                                        </ul>
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
                                className="flex-1 sm:flex-initial px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-indigo-800 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                Simpan Perubahan
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UserEditModal;