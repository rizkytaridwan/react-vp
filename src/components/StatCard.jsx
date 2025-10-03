// src/components/StatCard.jsx

import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, title, value, color }) => {
    return (
        <motion.div 
            className="bg-white p-4 rounded-lg shadow-md flex items-center" // Padding disesuaikan menjadi p-4
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            {/* Bagian Ikon */}
            <div className={`
                flex-shrink-0  
                p-3 rounded-full mr-4 
                bg-opacity-20 ${color.replace('text-', 'bg-')}
            `}>
                <Icon className={`w-7 h-7 ${color}`} />
            </div>

            {/* Bagian Teks (diberi flex-grow dan min-w-0) */}
            <div className="flex-grow min-w-0">
                <p className="text-sm text-gray-500 whitespace-nowrap truncate">
                    {title}
                </p>
                <p className={`
                    font-bold text-gray-800 whitespace-nowrap truncate
                    text-lg sm:text-xl lg:text-2xl 
                `}>
                    {value}
                </p>
            </div>
        </motion.div>
    );
};

export default StatCard;