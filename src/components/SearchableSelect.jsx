// src/components/SearchableSelect.jsx
import { useState, useMemo } from 'react';
import Select from 'react-select';

const SearchableSelect = ({ options, value, onChange, placeholder = "Pilih...", label }) => {
    const [inputValue, setInputValue] = useState('');

    const filteredOptions = useMemo(() => {
        const allOption = options.find(opt => opt.value === 'all');
        const initialOptions = allOption ? [allOption] : [];

        if (inputValue.length < 3) {
            return initialOptions;
        }

        const searchResults = options.filter(option =>
            option.label.toLowerCase().includes(inputValue.toLowerCase()) && option.value !== 'all'
        );

        return [...initialOptions, ...searchResults];
    }, [inputValue, options]);
    
    const selectedValue = options.find(option => option.value === value) || null;

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            minHeight: '48px',
            borderRadius: '0.5rem',
            borderWidth: '2px',
            borderColor: state.isFocused ? '#3B82F6' : '#E5E7EB',
            backgroundColor: state.hasValue ? '#FFFFFF' : '#F9FAFB',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
            transition: 'all 0.2s',
            '&:hover': {
                borderColor: state.isFocused ? '#3B82F6' : '#9CA3AF',
                backgroundColor: '#FFFFFF',
            }
        }),
        valueContainer: (provided) => ({
            ...provided,
            padding: '0.5rem 0.75rem',
        }),
        input: (provided) => ({
            ...provided,
            margin: '0',
            padding: '0',
            color: '#111827',
            fontWeight: '500',
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#9CA3AF',
            fontWeight: '500',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#111827',
            fontWeight: '600',
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: '1rem',
            marginTop: '0.5rem',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '2px solid #E5E7EB',
        }),
        menuList: (provided) => ({
            ...provided,
            padding: '0.5rem',
            maxHeight: '300px',
        }),
        option: (provided, state) => ({
            ...provided,
            borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
            marginBottom: '0.25rem',
            backgroundColor: state.isSelected 
                ? 'linear-gradient(to right, #3B82F6, #2563EB)' 
                : state.isFocused 
                    ? '#EFF6FF' 
                    : 'transparent',
            color: state.isSelected ? '#FFFFFF' : '#111827',
            fontWeight: state.isSelected ? '600' : '500',
            cursor: 'pointer',
            transition: 'all 0.15s',
            '&:hover': {
                backgroundColor: state.isSelected ? '#2563EB' : '#DBEAFE',
            },
            '&:active': {
                backgroundColor: state.isSelected ? '#1D4ED8' : '#BFDBFE',
            }
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: state.hasValue ? '#3B82F6' : '#9CA3AF',
            transition: 'all 0.2s',
            transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            '&:hover': {
                color: '#3B82F6',
            }
        }),
        clearIndicator: (provided) => ({
            ...provided,
            color: '#9CA3AF',
            transition: 'all 0.2s',
            '&:hover': {
                color: '#EF4444',
            }
        }),
        noOptionsMessage: (provided) => ({
            ...provided,
            color: '#6B7280',
            fontSize: '0.875rem',
            padding: '1rem',
        }),
    };

    return (
        <div>
            {label && (
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {label}
                </label>
            )}
            <Select
                value={selectedValue}
                onChange={(selectedOption) => onChange(selectedOption ? selectedOption.value : 'all')}
                onInputChange={(value) => setInputValue(value)}
                options={filteredOptions}
                placeholder={placeholder}
                noOptionsMessage={() => 
                    inputValue.length < 3 
                    ? "Ketik minimal 3 huruf untuk mencari..." 
                    : "Data tidak ditemukan"
                }
                isClearable
                styles={customStyles}
                classNamePrefix="react-select"
            />
            {inputValue.length > 0 && inputValue.length < 3 && (
                <p className="mt-2 text-xs text-amber-600 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Ketik {3 - inputValue.length} karakter lagi untuk mencari...
                </p>
            )}
        </div>
    );
};

export default SearchableSelect;