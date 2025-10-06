// src/components/DashboardSkeleton.jsx
const SkeletonCard = () => (
    <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
        <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-200 mr-4 h-14 w-14"></div>
            <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
            </div>
        </div>
    </div>
);

const DashboardSkeleton = () => {
    return (
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
                {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-72 bg-gray-200 rounded"></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
                     <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
                     <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                             <div key={i} className="flex justify-between items-center">
                                <div>
                                    <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                                </div>
                                <div className="h-5 bg-gray-200 rounded w-24"></div>
                            </div> // <-- Diperbaiki di sini dari </li> menjadi </div>
                        ))}
                     </div>
                </div>
            </div>
        </main>
    );
};

export default DashboardSkeleton;