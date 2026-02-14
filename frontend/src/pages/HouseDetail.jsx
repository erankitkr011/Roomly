import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import houseService from "../services/houseService";
import roomService from "../services/roomService";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import { getStatusColor, formatCurrency } from "../utils/formatters";
import toast from "react-hot-toast";
import { HiOutlinePlusCircle, HiOutlineTrash, HiOutlineHome, HiOutlineArrowLeft, HiOutlineSquares2X2 } from "react-icons/hi2";

const HouseDetail = () => {
    const { houseId } = useParams();
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showFloorModal, setShowFloorModal] = useState(false);
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [selectedFloor, setSelectedFloor] = useState(null);
    const [floorUnits, setFloorUnits] = useState(null);
    const [floorForm, setFloorForm] = useState({ floorNumber: "", floorName: "" });
    const [roomForm, setRoomForm] = useState({ roomNumber: "", roomType: "Room", pricePerMonth: "", perUnitRate: "8", features: "" });
    const [submitting, setSubmitting] = useState(false);

    const fetchOverview = async () => {
        try {
            setLoading(true);
            const res = await houseService.getHouseOverview(houseId);
            setOverview(res.data.data);
        } catch (err) { toast.error("Failed to load house"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchOverview(); }, [houseId]);

    const fetchFloorUnits = async (floorId) => {
        try {
            const res = await houseService.getFloorWithUnits(floorId);
            setFloorUnits(res.data.data);
            setSelectedFloor(floorId);
        } catch { toast.error("Failed to load units"); }
    };

    const addFloor = async (e) => {
        e.preventDefault();
        if (floorForm.floorNumber === "") return toast.error("Floor number required");
        try {
            setSubmitting(true);
            await houseService.addFloor(houseId, { floorNumber: Number(floorForm.floorNumber), floorName: floorForm.floorName });
            toast.success("Floor added!"); setShowFloorModal(false);
            setFloorForm({ floorNumber: "", floorName: "" }); fetchOverview();
        } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
        finally { setSubmitting(false); }
    };

    const deleteFloor = async (floorId) => {
        if (!confirm("Delete this floor?")) return;
        try { await houseService.deleteFloor(floorId); toast.success("Floor deleted"); fetchOverview(); if (selectedFloor === floorId) { setSelectedFloor(null); setFloorUnits(null); } }
        catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    };

    const addRoom = async (e) => {
        e.preventDefault();
        if (!roomForm.roomNumber || !roomForm.pricePerMonth) return toast.error("Room number and price required");
        try {
            setSubmitting(true);
            const data = { houseId, floorId: selectedFloor, roomNumber: roomForm.roomNumber, roomType: roomForm.roomType, pricePerMonth: Number(roomForm.pricePerMonth), perUnitRate: Number(roomForm.perUnitRate) || 8, features: roomForm.features ? roomForm.features.split(",").map(f => f.trim()) : [] };
            await roomService.postVacantRoom(data);
            toast.success("Room added!"); setShowRoomModal(false);
            setRoomForm({ roomNumber: "", roomType: "Room", pricePerMonth: "", perUnitRate: "8", features: "" });
            fetchFloorUnits(selectedFloor); fetchOverview();
        } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
        finally { setSubmitting(false); }
    };

    const deleteRoom = async (roomId) => {
        if (!confirm("Delete this room?")) return;
        try { await roomService.deleteVacantRoom(roomId); toast.success("Room deleted"); fetchFloorUnits(selectedFloor); fetchOverview(); }
        catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    };

    const ic = "w-full px-4 py-2.5 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all";

    if (loading) return <div className="flex justify-center pt-16"><Spinner size="lg" /></div>;
    if (!overview) return <p className="text-slate-500 text-center py-16">House not found</p>;

    const { house, stats, floors } = overview;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/houses" className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"><HiOutlineArrowLeft className="w-5 h-5" /></Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">{house?.name}</h1>
                    <p className="text-sm text-slate-500">{house?.address?.city}, {house?.address?.state} — {house?.address?.pincode}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-white/5 bg-slate-800/30 p-4 text-center">
                    <p className="text-2xl font-bold text-white">{stats?.totalFloors}</p><p className="text-xs text-slate-500">Floors</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-slate-800/30 p-4 text-center">
                    <p className="text-2xl font-bold text-white">{stats?.totalUnits}</p><p className="text-xs text-slate-500">Total Rooms</p>
                </div>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{stats?.occupiedUnits}</p><p className="text-xs text-slate-500">Occupied</p>
                </div>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
                    <p className="text-2xl font-bold text-amber-400">{stats?.vacantUnits}</p><p className="text-xs text-slate-500">Vacant</p>
                </div>
            </div>

            {/* Floors */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Floors</h2>
                <button onClick={() => setShowFloorModal(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 text-sm font-medium"><HiOutlinePlusCircle className="w-4 h-4" /> Add Floor</button>
            </div>

            {floors?.length === 0 ? (
                <EmptyState icon={HiOutlineSquares2X2} title="No floors" description="Add a floor to start adding rooms" />
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {floors.map((f) => (
                        <div key={f._id} onClick={() => fetchFloorUnits(f._id)} className={`relative rounded-xl border p-4 cursor-pointer transition-all ${selectedFloor === f._id ? "border-violet-500/40 bg-violet-500/10" : "border-white/5 bg-slate-800/30 hover:bg-slate-800/50"}`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-white">{f.floorName || `Floor ${f.floorNumber}`}</span>
                                <button onClick={(e) => { e.stopPropagation(); deleteFloor(f._id); }} className="p-1 rounded text-slate-500 hover:text-red-400"><HiOutlineTrash className="w-3.5 h-3.5" /></button>
                            </div>
                            <p className="text-xs text-slate-500">{f.totalUnits} rooms · {f.occupiedUnits} occupied</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Floor Units */}
            {selectedFloor && floorUnits && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-white">{floorUnits.floor?.floorName || `Floor ${floorUnits.floor?.floorNumber}`} — Rooms</h3>
                        <button onClick={() => setShowRoomModal(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-sm font-medium"><HiOutlinePlusCircle className="w-4 h-4" /> Add Room</button>
                    </div>
                    {floorUnits.units?.length === 0 ? (
                        <EmptyState icon={HiOutlineHome} title="No rooms" description="Add a room to this floor" />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {floorUnits.units.map((room) => (
                                <div key={room._id} className="rounded-2xl border border-white/5 bg-slate-800/30 p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-semibold text-white">Room {room.roomNumber}</span>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(room.status)}`}>{room.status}</span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="text-slate-300">{room.roomType}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Rent</span><span className="text-white font-medium">{formatCurrency(room.pricePerMonth)}/mo</span></div>
                                        <div className="flex justify-between"><span className="text-slate-500">Rate</span><span className="text-slate-300">₹{room.perUnitRate}/unit</span></div>
                                        {room.renter && <div className="pt-2 border-t border-white/5"><p className="text-xs text-slate-500">Tenant</p><p className="text-sm text-white">{room.renter.firstName} {room.renter.lastName}</p></div>}
                                    </div>
                                    {room.status === "Vacant" && (
                                        <button onClick={() => deleteRoom(room._id)} className="mt-3 w-full py-2 rounded-xl border border-red-500/20 text-red-400 text-xs hover:bg-red-500/10 transition-all">Delete Room</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Add Floor Modal */}
            <Modal isOpen={showFloorModal} onClose={() => setShowFloorModal(false)} title="Add Floor">
                <form onSubmit={addFloor} className="space-y-4">
                    <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Floor Number *</label>
                        <input type="number" value={floorForm.floorNumber} onChange={(e) => setFloorForm({ ...floorForm, floorNumber: e.target.value })} className={ic} /></div>
                    <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Floor Name</label>
                        <input value={floorForm.floorName} onChange={(e) => setFloorForm({ ...floorForm, floorName: e.target.value })} placeholder="e.g., Ground Floor" className={ic} /></div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowFloorModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm">Cancel</button>
                        <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm disabled:opacity-50">{submitting ? "Adding..." : "Add Floor"}</button>
                    </div>
                </form>
            </Modal>

            {/* Add Room Modal */}
            <Modal isOpen={showRoomModal} onClose={() => setShowRoomModal(false)} title="Add Room">
                <form onSubmit={addRoom} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Room Number *</label>
                            <input value={roomForm.roomNumber} onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })} className={ic} /></div>
                        <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Type *</label>
                            <select value={roomForm.roomType} onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })} className={ic}>
                                <option value="Room">Room</option><option value="Flat">Flat</option><option value="Shop">Shop</option>
                            </select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Rent/Month *</label>
                            <input type="number" value={roomForm.pricePerMonth} onChange={(e) => setRoomForm({ ...roomForm, pricePerMonth: e.target.value })} className={ic} /></div>
                        <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Rate/Unit</label>
                            <input type="number" value={roomForm.perUnitRate} onChange={(e) => setRoomForm({ ...roomForm, perUnitRate: e.target.value })} className={ic} /></div>
                    </div>
                    <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Features (comma separated)</label>
                        <input value={roomForm.features} onChange={(e) => setRoomForm({ ...roomForm, features: e.target.value })} placeholder="AC, Balcony, WiFi" className={ic} /></div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowRoomModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm">Cancel</button>
                        <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm disabled:opacity-50">{submitting ? "Adding..." : "Add Room"}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default HouseDetail;
