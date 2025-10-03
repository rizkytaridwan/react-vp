// src/components/SearchableSelect.jsx
import React, { useState, useMemo } from 'react';
import Select from 'react-select';

const SearchableSelect = ({ options, value, onChange, placeholder = "Pilih..." }) => {
    const [inputValue, setInputValue] = useState('');

    // Logika untuk memfilter opsi berdasarkan input pengguna
    const filteredOptions = useMemo(() => {
        // Tampilkan "Semua Toko" tanpa perlu mengetik
        const allOption = options.find(opt => opt.value === 'all');
        const initialOptions = allOption ? [allOption] : [];

        // Jika input kurang dari 3 karakter, jangan tampilkan opsi lain
        if (inputValue.length < 3) {
            return initialOptions;
        }

        // Jika input 3 karakter atau lebih, filter opsi
        const searchResults = options.filter(option =>
            option.label.toLowerCase().includes(inputValue.toLowerCase()) && option.value !== 'all'
        );

        return [...initialOptions, ...searchResults];
    }, [inputValue, options]);
    
    // Mencari objek option yang sedang aktif berdasarkan value-nya
    const selectedValue = options.find(option => option.value === value) || null;

    return (
        <Select
            value={selectedValue}
            onChange={(selectedOption) => onChange(selectedOption ? selectedOption.value : 'all')}
            onInputChange={(value) => setInputValue(value)}
            options={filteredOptions}
            placeholder={placeholder}
            noOptionsMessage={() => 
                inputValue.length < 3 
                ? "Ketik minimal 3 huruf untuk mencari..." 
                : "Toko tidak ditemukan"
            }
            isClearable
        />
    );
};

export default SearchableSelect;