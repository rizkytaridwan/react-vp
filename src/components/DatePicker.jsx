// src/components/DatePicker.jsx
import React from 'react';
import { Calendar, X } from 'lucide-react';

const DatePicker = ({ label, value, onChange, min, id }) => {
    const handleClear = (e) => {
        e.stopPropagation();
        onChange({ target: { value: '' } });
    };

    const formatDisplayDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    };

    return (
        <div className="relative">
            <label htmlFor={id} className="text-sm font-medium text-gray-700 mb-2 block">
                {label}
            </label>
            
            <div className="relative group">
                {/* Icon */}
                <div className={`
                    absolute left-3 top-1/2 -translate-y-1/2 
                    transition-colors duration-200 pointer-events-none z-10
                    ${value ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}
                `}>
                    <Calendar className="h-5 w-5" />
                </div>

                {/* Native Date Input */}
                <input
                    type="date"
                    id={id}
                    value={value}
                    onChange={onChange}
                    min={min}
                    className={`
                        w-full pl-11 pr-10 py-3
                        border-2 rounded-lg
                        font-medium text-gray-900
                        transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${value 
                            ? 'border-gray-300 bg-white hover:border-blue-400' 
                            : 'border-gray-300 bg-gray-50 hover:bg-white hover:border-gray-400'
                        }
                        cursor-pointer
                        [&::-webkit-calendar-picker-indicator]:opacity-0
                        [&::-webkit-calendar-picker-indicator]:absolute
                        [&::-webkit-calendar-picker-indicator]:w-full
                        [&::-webkit-calendar-picker-indicator]:h-full
                        [&::-webkit-calendar-picker-indicator]:cursor-pointer
                    `}
                />

                {/* Display formatted date overlay */}
                {value && (
                    <div className="absolute left-11 top-1/2 -translate-y-1/2 pointer-events-none">
                        <span className="text-gray-900 font-medium">
                            {formatDisplayDate(value)}
                        </span>
                    </div>
                )}

                {/* Placeholder when empty */}
                {!value && (
                    <div className="absolute left-11 top-1/2 -translate-y-1/2 pointer-events-none">
                        <span className="text-gray-400 font-medium">
                            Pilih tanggal
                        </span>
                    </div>
                )}

                {/* Clear button */}
                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="
                            absolute right-3 top-1/2 -translate-y-1/2
                            w-6 h-6 rounded-full z-20
                            flex items-center justify-center
                            hover:bg-red-100
                            text-gray-400 hover:text-red-600
                            transition-all duration-200
                        "
                        aria-label="Clear date"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Helper text */}
            {min && !value && (
                <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-blue-500"></span>
                    Minimal: {formatDisplayDate(min)}
                </p>
            )}
        </div>
    );
};

export default DatePicker;