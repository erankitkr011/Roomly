import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import renterService from "../services/renterService";
import Spinner from "../components/ui/Spinner";
import { formatCurrency } from "../utils/formatters";
import toast from "react-hot-toast";
import {
    HiOutlineMapPin,
    HiOutlineBuildingOffice2,
    HiOutlineCurrencyRupee,
    HiOutlineArrowLeft,
    HiOutlineUser,
    HiOutlineHomeModern,
    HiOutlineSparkles,
    HiOutlineBolt,
    HiOutlineChatBubbleLeftRight,
    HiOutlineCheckCircle,
    HiOutlineEnvelope,
} from "react-icons/hi2";

const RoomDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const room = location.state?.room;
    const [requesting, setRequesting] = useState(false);
    const [requested, setRequested] = useState(false);

    // Check if user already requested this room
    useEffect(() => {
        const checkExisting = async () => {
            if (!room?._id) return;
            try {
                const res = await renterService.checkRoomRequest(room._id);
                if (res.data?.requested) setRequested(true);
            } catch {
                // ignore — just show the request button
            }
        };
        checkExisting();
    }, [room?._id]);

    if (!room) {
        return (
            <div className="text-center py-16">
                <p className="text-slate-400 mb-4">Room data not available.</p>
                <button onClick={() => navigate("/search-rooms")} className="text-violet-400 hover:text-violet-300 font-medium">
                    ← Back to Search
                </button>
            </div>
        );
    }

    const handleRequestRoom = async () => {
        try {
            setRequesting(true);
            // This sends a notification to the landlord via the add-renter endpoint
            await renterService.requestRoom({ landlordId: room.landlord?._id, roomId: room._id });
            toast.success("Request sent to landlord!");
            setRequested(true);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send request");
        } finally {
            setRequesting(false);
        }
    };

    const getTypeBadgeColor = (type) => {
        switch (type) {
            case "Room": return "bg-blue-500/15 text-blue-400 border-blue-500/20";
            case "Flat": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
            case "Shop": return "bg-amber-500/15 text-amber-400 border-amber-500/20";
            default: return "bg-slate-500/15 text-slate-400 border-slate-500/20";
        }
    };

    const isOwnProperty = room.landlord?._id === user?._id;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Back Button */}
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <HiOutlineArrowLeft className="w-4 h-4" /> Back
            </button>

            {/* Main Card */}
            <div className="rounded-2xl border border-white/5 bg-slate-800/30 overflow-hidden">
                {/* Header Banner */}
                <div className="relative h-32 bg-gradient-to-br from-violet-600/30 via-indigo-600/20 to-slate-800/40">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
                    <div className="absolute bottom-4 left-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-sm">
                                <HiOutlineHomeModern className="w-7 h-7 text-violet-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">{room.roomType} #{room.roomNumber}</h1>
                                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-lg text-xs font-medium border ${getTypeBadgeColor(room.roomType)}`}>
                                    {room.roomType}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-slate-700/20 border border-white/5">
                            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                                <HiOutlineCurrencyRupee className="w-4 h-4" /> Rent
                            </div>
                            <p className="text-xl font-bold text-white">{formatCurrency(room.pricePerMonth)}</p>
                            <p className="text-xs text-slate-500">per month</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-700/20 border border-white/5">
                            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                                <HiOutlineBolt className="w-4 h-4" /> Electricity
                            </div>
                            <p className="text-xl font-bold text-white">₹{room.perUnitRate || 8}</p>
                            <p className="text-xs text-slate-500">per unit</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-700/20 border border-white/5">
                            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                                <HiOutlineBuildingOffice2 className="w-4 h-4" /> House
                            </div>
                            <p className="text-base font-semibold text-white truncate">{room.house?.name || "N/A"}</p>
                            {room.floor && <p className="text-xs text-slate-500">Floor {room.floor.floorNumber || room.floor.floorName}</p>}
                        </div>
                        <div className="p-4 rounded-xl bg-slate-700/20 border border-white/5">
                            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                                <HiOutlineMapPin className="w-4 h-4" /> Location
                            </div>
                            {room.house?.address ? (
                                <>
                                    <p className="text-base font-semibold text-white">{room.house.address.city}</p>
                                    <p className="text-xs text-slate-500">{room.house.address.state} - {room.house.address.pincode}</p>
                                </>
                            ) : <p className="text-sm text-slate-400">N/A</p>}
                        </div>
                    </div>

                    {/* Features */}
                    {room.features && room.features.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                                <HiOutlineSparkles className="w-4 h-4 text-violet-400" /> Features & Amenities
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {room.features.map((f, i) => (
                                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/40 border border-white/5 text-sm text-slate-300">
                                        <HiOutlineCheckCircle className="w-4 h-4 text-emerald-400" />
                                        {f}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Landlord Info */}
                    {room.landlord && (
                        <div className="p-4 rounded-xl bg-slate-700/20 border border-white/5">
                            <h3 className="text-sm font-medium text-slate-300 mb-3">Property Owner</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                                    {room.landlord.firstName?.[0]}{room.landlord.lastName?.[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{room.landlord.firstName} {room.landlord.lastName}</p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <HiOutlineEnvelope className="w-3.5 h-3.5" /> {room.landlord.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    {!isOwnProperty && (
                        <div className="flex gap-3 pt-2">
                            {requested ? (
                                <div className="flex-1 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center font-medium flex items-center justify-center gap-2">
                                    <HiOutlineCheckCircle className="w-5 h-5" /> Request Sent
                                </div>
                            ) : (
                                <button
                                    onClick={handleRequestRoom}
                                    disabled={requesting}
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:from-violet-500 hover:to-indigo-500 transition-all disabled:opacity-50 shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2"
                                >
                                    <HiOutlineChatBubbleLeftRight className="w-5 h-5" />
                                    {requesting ? "Sending Request..." : "Request This Room"}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoomDetail;
