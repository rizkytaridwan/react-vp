// src/App.jsx (Kode yang Benar)

import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MainLayout from './components/layout/MainLayout';
import TransactionsPage from './pages/TransactionsPage';
import UsersPage from './pages/UsersPage';
import StoresPage from './pages/StoresPage';

// Komponen PrivateRoute sekarang menjadi Layout Wrapper
const PrivateRoutes = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/" />;
    }
    // Jika ada token, render MainLayout yang akan berisi halaman-halaman private
    return (
        <MainLayout>
            <Outlet /> 
        </MainLayout>
    );
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Rute untuk Login, tidak menggunakan MainLayout */}
                <Route path="/" element={<LoginPage />} />

                {/* Rute-rute private yang menggunakan MainLayout */}
                <Route element={<PrivateRoutes />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    {/* Hanya satu rute untuk /settings */}
                    <Route path="/stores" element={<StoresPage />} /> 
                </Route>
            </Routes>
        </Router>
    );
}

export default App;