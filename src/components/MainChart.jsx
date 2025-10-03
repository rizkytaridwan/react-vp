// src/components/MainChart.jsx

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MainChart = ({ data }) => {
    // Fungsi untuk format angka di sumbu Y (contoh: 150000 -> 150 rb)
    const formatYAxis = (tickItem) => {
        return new Intl.NumberFormat('id-ID', { notation: 'compact' , compactDisplay: 'short' }).format(tickItem)
    }
    
    // Fungsi untuk format label tanggal di tooltip
    const formatTooltipLabel = (label) => {
        return new Date(label).toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} />
                <YAxis tickFormatter={formatYAxis} />
                <Tooltip 
                    formatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)}
                    labelFormatter={formatTooltipLabel}
                />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#8884d8" activeDot={{ r: 8 }} name="Pendapatan"/>
            </LineChart>
        </ResponsiveContainer>
    );
};

export default MainChart;