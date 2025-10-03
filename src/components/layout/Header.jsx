// src/components/layout/Header.jsx

import React from 'react';
import { LogOut, UserCircle, Menu } from 'lucide-react'; // Impor ikon Menu

// Header sekarang menerima prop onMenuClick
const Header = ({ onMenuClick }) => {
    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    return (
        <header className="h-20 bg-white shadow-md flex items-center justify-between px-4 sm:px-8">
            <div className="flex items-center">
                {/* Tombol ini hanya akan muncul di layar kecil (di bawah 'md') */}
                <button 
                    onClick={onMenuClick}
                    className="md:hidden mr-4 text-gray-600 hover:text-gray-800"
                >
                    <Menu size={24} />
                </button>
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Dashboard</h1>
                    <p className="text-xs sm:text-sm text-gray-500">Selamat datang kembali, Super Admin!</p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center">
                    <UserCircle className="w-8 h-8 text-gray-600 mr-2" />
                    <span className="font-semibold text-gray-700">Rizkyy</span>
                </div>
                <button 
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                >
                    <LogOut className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Header;