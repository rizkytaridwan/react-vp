// src/components/DatePicker.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';

const DatePicker = ({ label, value, onChange, min, id }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && value) {
            setCurrentMonth(new Date(value));
        }
    }, [isOpen, value]);

    const handleClear = (e) => {
        e.stopPropagation();
        onChange({ target: { value: '' } });
    };

    const formatDisplayDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { 
            weekday: 'short',
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            days.push({
                day: prevMonthLastDay - i,
                isCurrentMonth: false,
                date: new Date(year, month - 1, prevMonthLastDay - i)
            });
        }

        for (let day = 1; day <= daysInMonth; day++) {
            days.push({
                day,
                isCurrentMonth: true,
                date: new Date(year, month, day)
            });
        }

        const remainingDays = 42 - days.length;
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

    const handlePrevMonth = (e) => {
        e.stopPropagation();
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const handleNextMonth = (e) => {
        e.stopPropagation();
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const handleToday = (e) => {
        e.stopPropagation();
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

    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const days = getDaysInMonth(currentMonth);

    const handleToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    return (
        <div ref={containerRef} className="relative">
            <label htmlFor={id} className="text-sm font-medium text-gray-700 mb-2 block">
                {label}
            </label>
            
            <button
                type="button"
                onClick={handleToggle}
                className={`
                    w-full text-left
                    border-2 rounded-lg p-3
                    transition-all duration-200
                    ${isOpen 
                        ? 'border-blue-500 ring-2 ring-blue-200 bg-white' 
                        : value 
                            ? 'border-gray-300 bg-white hover:border-blue-400' 
                            : 'border-gray-300 bg-gray-50 hover:bg-white hover:border-gray-400'
                    }
                `}
            >
                <div className="flex items-center gap-3">
                    <Calendar className={`w-5 h-5 ${value ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={`flex-1 font-medium ${value ? 'text-gray-900' : 'text-gray-400'}`}>
                        {value ? formatDisplayDate(value) : 'Pilih tanggal'}
                    </span>
                    {value && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-100 text-gray-400 hover:text-red-600 transition-all"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </button>

            {/* Custom Calendar */}
            {isOpen && (
                <div className="absolute z-[9999] mt-2 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 p-5 w-full min-w-[320px] left-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-gray-900">
                                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                            </h3>
                        </div>
                        
                        <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>
                    </div>

                    {/* Day Names */}
                    <div className="grid grid-cols-7 gap-2 mb-3">
                        {dayNames.map((day) => (
                            <div key={day} className="text-center text-xs font-bold text-gray-600 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2">
                        {days.map((dayObj, index) => {
                            const selected = isSelected(dayObj.date);
                            const today = isToday(dayObj.date);
                            const disabled = isDisabled(dayObj.date);

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!disabled && dayObj.isCurrentMonth) {
                                            handleDateSelect(dayObj.date);
                                        }
                                    }}
                                    disabled={disabled || !dayObj.isCurrentMonth}
                                    className={`
                                        h-10 rounded-lg text-sm font-semibold
                                        transition-all duration-200
                                        ${!dayObj.isCurrentMonth 
                                            ? 'text-gray-300 cursor-default' 
                                            : disabled
                                                ? 'text-gray-300 cursor-not-allowed'
                                                : selected
                                                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg transform scale-110'
                                                    : today
                                                        ? 'bg-blue-100 text-blue-700 font-bold ring-2 ring-blue-300'
                                                        : 'text-gray-700 hover:bg-blue-50 hover:scale-105'
                                        }
                                    `}
                                >
                                    {dayObj.day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="flex gap-2 mt-5 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                            }}
                            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleToday}
                            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg shadow-md hover:shadow-lg transition-all"
                        >
                            Hari Ini
                        </button>
                    </div>
                </div>
            )}

            {/* Helper text */}
            {min && !value && (
                <p className="mt-2 text-xs text-gray-500 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Minimal: {formatDisplayDate(min)}
                </p>
            )}
        </div>
    );
};

export default DatePicker;