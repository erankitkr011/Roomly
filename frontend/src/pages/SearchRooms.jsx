import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import renterService from "../services/renterService";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import { formatCurrency } from "../utils/formatters";
import toast from "react-hot-toast";
import {
    HiOutlineMagnifyingGlass,
    HiOutlineMapPin,
    HiOutlineBuildingOffice2,
    HiOutlineCurrencyRupee,
    HiOutlineAdjustmentsHorizontal,
    HiOutlineXMark,
    HiOutlineHomeModern,
    HiOutlineUser,
    HiOutlineSparkles,
} from "react-icons/hi2";

const roomTypes = ["All", "Room", "Flat", "Shop"];

const SearchRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        location: "",
        roomType: "All",
        minPrice: "",
        maxPrice: "",
    });
    const navigate = useNavigate();

    const handleSearch = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filters.location.trim()) params.location = filters.location.trim();
            if (filters.roomType !== "All") params.roomType = filters.roomType;
            if (filters.minPrice) params.minPrice = filters.minPrice;
            if (filters.maxPrice) params.maxPrice = filters.maxPrice;
            const res = await renterService.searchVacantRooms(params);
            setRooms(res.data.rooms || []);
            setSearched(true);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to search rooms");
        } finally {
            setLoading(false);
        }
    };

    // Load all vacant rooms on mount
    useEffect(() => { handleSearch(); }, []);

    const handleKeyPress = (e) => { if (e.key === "Enter") handleSearch(); };
    const clearFilters = () => { setFilters({ location: "", roomType: "All", minPrice: "", maxPrice: "" }); };
    const activeFilterCount = [filters.roomType !== "All", filters.minPrice, filters.maxPrice].filter(Boolean).length;

    const getTypeBadgeColor = (type) => {
        switch (type) {
            case "Room": return "bg-blue-500/15 text-blue-400 border-blue-500/20";
            case "Flat": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
            case "Shop": return "bg-amber-500/15 text-amber-400 border-amber-500/20";
            default: return "bg-slate-500/15 text-slate-400 border-slate-500/20";
        }
    };

    const ic = "w-full px-4 py-2.5 bg-slate-800/60 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all";

    return (
        <div className="space-y-6">
            {/* Hero Search Section */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-slate-800/40 border border-white/5 p-8">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-white mb-2">Find Your Perfect Room</h1>
                    <p className="text-slate-400 mb-6">Search vacant rooms, flats, and shops by location</p>

                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <HiOutlineMapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={filters.location}
                                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                onKeyDown={handleKeyPress}
                                placeholder="Enter city or state..."
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-800/70 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-base"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-3.5 rounded-xl border transition-all relative ${showFilters ? "bg-violet-500/20 border-violet-500/30 text-violet-300" : "bg-slate-800/70 border-white/10 text-slate-400 hover:text-white hover:bg-white/5"}`}
                        >
                            <HiOutlineAdjustmentsHorizontal className="w-5 h-5" />
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-violet-500 text-white text-xs flex items-center justify-center">{activeFilterCount}</span>
                            )}
                        </button>
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:from-violet-500 hover:to-indigo-500 transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20 flex items-center gap-2"
                        >
                            <HiOutlineMagnifyingGlass className="w-5 h-5" />
                            Search
                        </button>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="mt-4 p-4 rounded-xl bg-slate-800/50 border border-white/5 animate-in">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-slate-300">Filters</h3>
                                {activeFilterCount > 0 && (
                                    <button onClick={clearFilters} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                                        <HiOutlineXMark className="w-3.5 h-3.5" /> Clear all
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1.5">Room Type</label>
                                    <div className="flex gap-2">
                                        {roomTypes.map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setFilters({ ...filters, roomType: t })}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filters.roomType === t
                                                    ? "bg-violet-500/20 border-violet-500/30 text-violet-300"
                                                    : "bg-slate-700/50 border-white/5 text-slate-400 hover:text-white"
                                                    }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1.5">Min Price (₹)</label>
                                    <input type="number" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} placeholder="0" className={ic} />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1.5">Max Price (₹)</label>
                                    <input type="number" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} placeholder="50000" className={ic} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results */}
            {loading ? (
                <div className="flex justify-center pt-12"><Spinner size="lg" /></div>
            ) : rooms.length === 0 && searched ? (
                <EmptyState icon={HiOutlineMagnifyingGlass} title="No rooms found" description="Try adjusting your search filters or location" />
            ) : (
                <>
                    {searched && <p className="text-sm text-slate-500">{rooms.length} room{rooms.length !== 1 ? "s" : ""} found</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {rooms.map((room) => (
                            <div
                                key={room._id}
                                onClick={() => navigate(`/rooms/${room._id}`, { state: { room } })}
                                className="group relative rounded-2xl border border-white/5 bg-slate-800/30 hover:bg-slate-800/50 hover:border-violet-500/20 transition-all duration-300 cursor-pointer overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="p-2.5 rounded-xl bg-violet-500/10">
                                            <HiOutlineHomeModern className="w-5 h-5 text-violet-400" />
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getTypeBadgeColor(room.roomType)}`}>
                                            {room.roomType}
                                        </span>
                                    </div>

                                    {/* Room Info */}
                                    <h3 className="text-base font-semibold text-white mb-1 group-hover:text-violet-300 transition-colors">
                                        {room.roomType} #{room.roomNumber}
                                    </h3>
                                    {room.house && (
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                                            <HiOutlineBuildingOffice2 className="w-3.5 h-3.5" />
                                            {room.house.name}
                                        </div>
                                    )}
                                    {room.house?.address && (
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                                            <HiOutlineMapPin className="w-3.5 h-3.5" />
                                            {room.house.address.city}, {room.house.address.state}
                                        </div>
                                    )}

                                    {/* Features */}
                                    {room.features && room.features.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {room.features.slice(0, 4).map((f, i) => (
                                                <span key={i} className="px-2 py-0.5 rounded-md bg-slate-700/50 text-xs text-slate-400 border border-white/5">
                                                    {f}
                                                </span>
                                            ))}
                                            {room.features.length > 4 && (
                                                <span className="px-2 py-0.5 rounded-md bg-slate-700/50 text-xs text-violet-400">
                                                    +{room.features.length - 4} more
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-1.5">
                                            <HiOutlineCurrencyRupee className="w-4 h-4 text-emerald-400" />
                                            <span className="text-lg font-bold text-white">{formatCurrency(room.pricePerMonth)}</span>
                                            <span className="text-xs text-slate-500">/mo</span>
                                        </div>
                                        {room.landlord && (
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <HiOutlineUser className="w-3.5 h-3.5" />
                                                {room.landlord.firstName}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default SearchRooms;
