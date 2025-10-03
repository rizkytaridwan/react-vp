// src/components/layout/Sidebar.jsx

import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingCart, Store, X } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const navItems = [
        { icon: LayoutDashboard, name: 'Dashboard', path: '/dashboard' },
        { icon: ShoppingCart, name: 'Transaksi', path: '/transactions' },
        { icon: Store, name: 'Toko', path: '/stores' },
        { icon: Users, name: 'Users', path: '/users' },
    ];
    
    const navLinkClasses = ({ isActive }) => 
        `flex items-center p-3 rounded-lg transition-colors ${
            isActive 
            ? 'bg-indigo-600 text-white' 
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`;

    return (
        <>
            {/* Backdrop Overlay untuk mobile, akan muncul saat sidebar terbuka */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar */}
            <aside 
                className={`
                    w-64 bg-gray-800 text-white flex-col flex transition-transform duration-300 ease-in-out
                    
                    fixed inset-y-0 left-0 z-30 md:relative md:translate-x-0
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <span className="text-2xl font-bold text-center">VP Admin</span>
                    {/* Tombol close di dalam sidebar, hanya untuk mobile */}
                    <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map(item => (
                        <NavLink to={item.path} key={item.name} className={navLinkClasses} onClick={onClose}>
                            <item.icon className="w-6 h-6 mr-4" />
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;