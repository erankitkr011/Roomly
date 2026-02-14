import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setDashboardStats, setDashboardLoading } from "../slices/dashboardSlice";
import dashboardService from "../services/dashboardService";
import StatCard from "../components/ui/StatCard";
import Spinner from "../components/ui/Spinner";
import { formatCurrency, getStatusColor } from "../utils/formatters";
import { Link } from "react-router-dom";
import {
    HiOutlineBuildingOffice2,
    HiOutlineHome,
    HiOutlineUsers,
    HiOutlineDocumentText,
    HiOutlineBanknotes,
    HiOutlineChartBar,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineArrowTrendingUp,
    HiOutlinePlusCircle,
} from "react-icons/hi2";

const RenterSection = ({ renterStats }) => {
    const [selectedRoom, setSelectedRoom] = useState(null);

    // Determine which stats/bills to show
    const displayStats = selectedRoom
        ? selectedRoom.stats
        : {
            totalBills: renterStats.totalBills,
            pendingBills: renterStats.pendingBills,
            paidBills: renterStats.paidBills,
            totalPaid: renterStats.totalPaid,
        };

    const displayBills = selectedRoom
        ? selectedRoom.stats?.recentBills || []
        : renterStats.recentBills || [];

    const sectionTitle = selectedRoom
        ? `Room ${selectedRoom.roomNumber} — Bills`
        : "Renter Overview";

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-500/10">
                    <HiOutlineDocumentText className="w-5 h-5 text-sky-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">{sectionTitle}</h2>
                {selectedRoom && (
                    <button
                        onClick={() => setSelectedRoom(null)}
                        className="ml-auto text-xs px-3 py-1.5 rounded-full border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 transition-all"
                    >
                        Show All Rooms
                    </button>
                )}
            </div>

            {/* Room cards */}
            {renterStats.rooms?.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm text-slate-400">
                        {selectedRoom ? "Click another room to switch" : "Click a room to see its details"}
                    </h3>
                    {renterStats.rooms.map((room) => {
                        const isSelected = selectedRoom?.id === room.id;
                        return (
                            <div
                                key={room.id}
                                onClick={() => setSelectedRoom(isSelected ? null : room)}
                                className={`rounded-2xl border p-6 cursor-pointer transition-all duration-200 ${isSelected
                                        ? "border-violet-500/60 bg-gradient-to-br from-violet-500/15 to-indigo-500/5 ring-1 ring-violet-500/40 shadow-lg shadow-violet-500/10"
                                        : "border-sky-500/20 bg-gradient-to-br from-sky-500/10 to-transparent hover:border-sky-500/40 hover:shadow-md hover:shadow-sky-500/5"
                                    }`}
                            >
                                <div className="flex items-center gap-6 flex-wrap">
                                    <div>
                                        <p className="text-2xl font-bold text-white">Room {room.roomNumber}</p>
                                        <p className="text-sm text-slate-500">
                                            {room.house?.name} · Floor {room.floor?.floorName || room.floor?.floorNumber}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-white">{formatCurrency(room.pricePerMonth)}</p>
                                            <p className="text-xs text-slate-500">Monthly Rent</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(room.roomType === "Flat" ? "Occupied" : "Vacant")}`}>
                                            {room.roomType}
                                        </div>
                                    </div>
                                </div>
                                {room.landlord && (
                                    <p className="text-xs text-slate-500 mt-3">
                                        Landlord: {room.landlord.firstName} {room.landlord.lastName}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={HiOutlineDocumentText}
                    label="Total Bills"
                    value={displayStats.totalBills}
                    color="sky"
                />
                <StatCard
                    icon={HiOutlineClock}
                    label="Pending Bills"
                    value={displayStats.pendingBills}
                    color="amber"
                />
                <StatCard
                    icon={HiOutlineCheckCircle}
                    label="Paid Bills"
                    value={displayStats.paidBills}
                    color="emerald"
                />
                <StatCard
                    icon={HiOutlineBanknotes}
                    label="Total Paid"
                    value={formatCurrency(displayStats.totalPaid)}
                    color="violet"
                />
            </div>

            {/* Recent bills */}
            {displayBills.length > 0 && (
                <div className="rounded-2xl border border-white/5 bg-slate-800/30 overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">
                            {selectedRoom ? `Room ${selectedRoom.roomNumber} — Recent Bills` : "Recent Bills"}
                        </h3>
                        <Link to="/my-bills" className="text-xs text-violet-400 hover:text-violet-300">
                            View All →
                        </Link>
                    </div>
                    <div className="divide-y divide-white/5">
                        {displayBills.map((bill) => (
                            <div key={bill._id} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                <div>
                                    <p className="text-sm font-medium text-white">{bill.month}</p>
                                    <p className="text-xs text-slate-500">{new Date(bill.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(bill.status)}`}>
                                        {bill.status}
                                    </span>
                                    <span className="text-sm font-semibold text-white">{formatCurrency(bill.totalAmount)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {displayBills.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                    {selectedRoom ? `No bills found for Room ${selectedRoom.roomNumber}` : "No recent bills"}
                </div>
            )}
        </div>
    );
};

const Dashboard = () => {
    const dispatch = useDispatch();
    const { stats, userRoles, loading } = useSelector((state) => state.dashboard);
    const { user } = useSelector((state) => state.auth);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                dispatch(setDashboardLoading(true));
                const res = await dashboardService.getStats();
                dispatch(setDashboardStats(res.data));
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load dashboard");
            } finally {
                dispatch(setDashboardLoading(false));
            }
        };
        fetchStats();
    }, [dispatch]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 transition-all"
                >
                    Retry
                </button>
            </div>
        );
    }

    const landlordStats = stats?.landlordStats;
    const renterStats = stats?.renterStats;
    const isNewUser = !userRoles?.isLandlord && !userRoles?.isRenter;

    return (
        <div className="space-y-8">
            {/* Greeting */}
            <div>
                <h1 className="text-2xl font-bold text-white">
                    Welcome back, {user?.firstName} 👋
                </h1>
                <p className="text-slate-500 mt-1">
                    Here's what's happening with your properties today.
                </p>
            </div>

            {/* New user prompt */}
            {isNewUser && (
                <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-indigo-500/5 to-transparent p-8">
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold text-white mb-2">Get Started with Roomly</h2>
                        <p className="text-slate-400 mb-6 max-w-lg">
                            You can start by adding a house to become a landlord, or wait for someone to allocate a room to you to become a renter.
                        </p>
                        <Link
                            to="/houses"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/25"
                        >
                            <HiOutlinePlusCircle className="w-5 h-5" />
                            Add Your First House
                        </Link>
                    </div>
                    <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-violet-500/10 blur-3xl" />
                </div>
            )}

            {/* Landlord Stats */}
            {landlordStats && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-violet-500/10">
                            <HiOutlineBuildingOffice2 className="w-5 h-5 text-violet-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-white">Landlord Overview</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            icon={HiOutlineHome}
                            label="Total Houses"
                            value={landlordStats.totalHouses}
                            color="violet"
                        />
                        <StatCard
                            icon={HiOutlineBuildingOffice2}
                            label="Total Rooms"
                            value={landlordStats.totalRooms}
                            subValue={`${landlordStats.occupiedRooms} occupied · ${landlordStats.vacantRooms} vacant`}
                            color="sky"
                        />
                        <StatCard
                            icon={HiOutlineUsers}
                            label="Total Renters"
                            value={landlordStats.totalRenters}
                            color="emerald"
                        />
                        <StatCard
                            icon={HiOutlineBanknotes}
                            label="Total Revenue"
                            value={formatCurrency(landlordStats.totalRevenue)}
                            color="amber"
                        />
                    </div>

                    {/* Secondary stats row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <StatCard
                            icon={HiOutlineClock}
                            label="Pending Bills"
                            value={landlordStats.pendingBills}
                            color="amber"
                        />
                        <StatCard
                            icon={HiOutlineCheckCircle}
                            label="Paid Bills"
                            value={landlordStats.paidBills}
                            color="emerald"
                        />
                        <StatCard
                            icon={HiOutlineArrowTrendingUp}
                            label="Occupancy Rate"
                            value={`${landlordStats.occupancyRate}%`}
                            color="sky"
                        />
                    </div>

                    {/* Houses overview */}
                    {landlordStats.houses?.length > 0 && (
                        <div className="rounded-2xl border border-white/5 bg-slate-800/30 overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-white">Your Houses</h3>
                                <Link to="/houses" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                                    View All →
                                </Link>
                            </div>
                            <div className="divide-y divide-white/5">
                                {landlordStats.houses.map((house, i) => (
                                    <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/10 flex items-center justify-center">
                                                <HiOutlineHome className="w-5 h-5 text-violet-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{house.name}</p>
                                                <p className="text-xs text-slate-500">{house.occupiedUnits}/{house.totalUnits} units occupied</p>
                                            </div>
                                        </div>
                                        {/* Occupancy bar */}
                                        <div className="w-24">
                                            <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
                                                    style={{ width: `${house.totalUnits > 0 ? (house.occupiedUnits / house.totalUnits) * 100 : 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Renter Stats */}
            {renterStats && <RenterSection renterStats={renterStats} />}
        </div>
    );
};

export default Dashboard;
