// src/components/DatePicker.jsx

import React, { useRef, useState, useEffect } from 'react';
import { Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';

const DatePicker = ({ label, value, onChange, min, id }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const containerRef = useRef(null);

    // Close calendar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Format tanggal untuk ditampilkan
    const formatDisplayDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange({ target: { value: '' } });
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen && value) {
            setCurrentMonth(new Date(value));
        }
    };

    // Generate calendar days
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        
        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            days.push({
                day: prevMonthLastDay - i,
                isCurrentMonth: false,
                date: new Date(year, month - 1, prevMonthLastDay - i)
            });
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            days.push({
                day,
                isCurrentMonth: true,
                date: new Date(year, month, day)
            });
        }

        // Next month days
        const remainingDays = 42 - days.length; // 6 weeks * 7 days
        for (let day = 1; day <= remainingDays; day++) {
            days.push({
                day,
                isCurrentMonth: false,
                date: new Date(year, month + 1, day)
            });
        }

        return days;
    };

    const handleDateSelect = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        onChange({ target: { value: dateString } });
        setIsOpen(false);
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const handleToday = () => {
        const today = new Date();
        handleDateSelect(today);
    };

    const isSelected = (date) => {
        if (!value) return false;
        const selectedDate = new Date(value);
        return date.toDateString() === selectedDate.toDateString();
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isDisabled = (date) => {
        if (!min) return false;
        const minDate = new Date(min);
        minDate.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate < minDate;
    };

    const days = getDaysInMonth(currentMonth);
    

    return (
        <div ref={containerRef} className="relative">
            <label htmlFor={id} className="text-sm font-medium text-gray-700 mb-1 block">
                {label}
            </label>
            
            {/* Input Field */}
            <div
                className={`
                    relative w-full px-3 py-2.5 
                    border-2 rounded-lg
                    transition-all duration-200 ease-in-out
                    cursor-pointer
                    ${isOpen 
                        ? 'border-indigo-500 ring-2 ring-indigo-200 shadow-sm' 
                        : value 
                            ? 'border-gray-300 hover:border-indigo-400' 
                            : 'border-gray-300 hover:border-gray-400'
                    }
                    ${value ? 'bg-white' : 'bg-gray-50 hover:bg-white'}
                `}
                onClick={handleToggle}
            >
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className={`
                            flex-shrink-0 transition-colors duration-200
                            ${value ? 'text-indigo-600' : 'text-gray-400'}
                        `}>
                            <Calendar className="h-5 w-5" />
                        </div>
                        <span className={`
                            truncate font-medium transition-colors duration-200
                            ${value ? 'text-gray-900' : 'text-gray-400'}
                        `}>
                            {value ? formatDisplayDate(value) : 'Pilih tanggal'}
                        </span>
                    </div>
                    
                    {value && (
                        <button
                            onClick={handleClear}
                            className="
                                flex-shrink-0 w-6 h-6 rounded-full
                                flex items-center justify-center
                                hover:bg-gray-200
                                text-gray-400 hover:text-red-600
                                transition-all duration-200
                            "
                            aria-label="Clear date"
                            type="button"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Custom Calendar Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 p-4 w-80">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4 gap-2">
                        <button
                            onClick={handlePrevMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            type="button"
                        >
                            <ChevronLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        
                        <div className="flex gap-2 flex-1">
                            {/* Month Selector */}
                            <select
                                value={currentMonth.getMonth()}
                                onChange={(e) => setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value)))}
                                className="flex-1 px-3 py-1.5 text-sm font-semibold text-gray-900 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((month, index) => (
                                    <option key={index} value={index}>{month}</option>
                                ))}
                            </select>
                            
                            {/* Year Selector */}
                            <select
                                value={currentMonth.getFullYear()}
                                onChange={(e) => setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth()))}
                                className="px-3 py-1.5 text-sm font-semibold text-gray-900 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 50 + i).map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        
                        <button
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            type="button"
                        >
                            <ChevronRight className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                            <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                        {days.map((dayObj, index) => {
                            const selected = isSelected(dayObj.date);
                            const today = isToday(dayObj.date);
                            const disabled = isDisabled(dayObj.date);

                            return (
                                <button
                                    key={index}
                                    onClick={() => !disabled && handleDateSelect(dayObj.date)}
                                    disabled={disabled}
                                    type="button"
                                    className={`
                                        h-10 rounded-lg text-sm font-medium
                                        transition-all duration-150
                                        ${!dayObj.isCurrentMonth 
                                            ? 'text-gray-300' 
                                            : disabled
                                                ? 'text-gray-300 cursor-not-allowed'
                                                : selected
                                                    ? 'bg-indigo-600 text-white shadow-md scale-105'
                                                    : today
                                                        ? 'bg-indigo-100 text-indigo-700 font-bold'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                        }
                                        ${!disabled && !selected && 'hover:scale-105'}
                                    `}
                                >
                                    {dayObj.day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            type="button"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleToday}
                            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                            type="button"
                        >
                            Hari Ini
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePicker;