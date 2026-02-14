import { useState, useEffect } from "react";
import renterService from "../services/renterService";
import billService from "../services/billService";
import roomService from "../services/roomService";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import { getInitials, getStatusColor, formatCurrency } from "../utils/formatters";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
    HiOutlineUsers, HiOutlinePlusCircle, HiOutlineTrash,
    HiOutlineDocumentText, HiOutlineChatBubbleLeftRight,
    HiOutlineEnvelope, HiOutlineHomeModern, HiOutlineCurrencyRupee,
    HiOutlineUser,
} from "react-icons/hi2";

const Renters = () => {
    const [renters, setRenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBillsModal, setShowBillsModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedRenter, setSelectedRenter] = useState(null);
    const [renterBills, setRenterBills] = useState([]);
    const [addForm, setAddForm] = useState({ email: "", roomId: "" });
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const fetchRenters = async () => {
        try { setLoading(true); const res = await renterService.getAllRenters(); setRenters(res.data.renters || []); }
        catch { setRenters([]); } finally { setLoading(false); }
    };

    useEffect(() => { fetchRenters(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!addForm.email) return toast.error("Email required");
        try { setSubmitting(true); await renterService.addRenter(addForm); toast.success("Renter added!"); setShowAddModal(false); setAddForm({ email: "", roomId: "" }); fetchRenters(); }
        catch (err) { toast.error(err.response?.data?.message || "Failed"); } finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Remove this renter?")) return;
        try { await renterService.deleteRenter(id); toast.success("Renter removed"); fetchRenters(); }
        catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    };

    const viewBills = async (renterData) => {
        setSelectedRenter(renterData);
        try { const res = await renterService.getRenterBills(renterData.renter._id); setRenterBills(res.data.bills || []); setShowBillsModal(true); }
        catch { toast.error("Failed to load bills"); }
    };

    const viewDetail = (renterData) => {
        setSelectedRenter(renterData);
        setShowDetailModal(true);
    };

    const ic = "w-full px-4 py-2.5 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all";

    if (loading) return <div className="flex justify-center pt-16"><Spinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold text-white">Renters</h1><p className="text-slate-500 mt-1">{renters.length} tenants</p></div>
                <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/20">
                    <HiOutlinePlusCircle className="w-5 h-5" /> Add Renter
                </button>
            </div>

            {renters.length === 0 ? (
                <EmptyState icon={HiOutlineUsers} title="No renters" description="Add a renter by email or allocate a room" />
            ) : (
                <div className="rounded-2xl border border-white/5 bg-slate-800/30 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-white/5 text-slate-400"><th className="px-6 py-3 text-left font-medium">Renter</th><th className="px-6 py-3 text-left font-medium">Email</th><th className="px-6 py-3 text-left font-medium">Room</th><th className="px-6 py-3 text-left font-medium">Rent</th><th className="px-6 py-3 text-right font-medium">Actions</th></tr></thead>
                            <tbody className="divide-y divide-white/5">
                                {renters.map((item, idx) => {
                                    const r = item.renter;
                                    const room = item.room;
                                    if (!r) return null;
                                    return (
                                        <tr key={r._id || idx} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => viewDetail(item)}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                                        {getInitials(r.firstName, r.lastName)}
                                                    </div>
                                                    <span className="text-white font-medium">{r.firstName} {r.lastName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">{r.email}</td>
                                            <td className="px-6 py-4 text-slate-400">
                                                {room ? (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <span className="text-white font-medium">#{room.roomNumber}</span>
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-700/50 border border-white/5 text-slate-400">{room.roomType}</span>
                                                    </span>
                                                ) : "—"}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">{room ? formatCurrency(room.pricePerMonth) : "—"}</td>
                                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => viewBills(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10" title="Bills"><HiOutlineDocumentText className="w-4 h-4" /></button>
                                                    <button onClick={() => navigate(`/chat/${r._id}`)} className="p-1.5 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-violet-500/10" title="Chat"><HiOutlineChatBubbleLeftRight className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDelete(r._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10" title="Remove"><HiOutlineTrash className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Renter Modal */}
            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Renter">
                <form onSubmit={handleAdd} className="space-y-4">
                    <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Renter Email *</label><input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} placeholder="renter@email.com" className={ic} /></div>
                    <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Room ID (optional)</label><input value={addForm.roomId} onChange={(e) => setAddForm({ ...addForm, roomId: e.target.value })} placeholder="Room ID to allocate" className={ic} /></div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm">Cancel</button>
                        <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm disabled:opacity-50">{submitting ? "Adding..." : "Add Renter"}</button>
                    </div>
                </form>
            </Modal>

            {/* Renter Detail Modal */}
            <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Renter Details" size="lg">
                {selectedRenter?.renter && (
                    <div className="space-y-5">
                        {/* Profile Header */}
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-700/20 border border-white/5">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold">
                                {getInitials(selectedRenter.renter.firstName, selectedRenter.renter.lastName)}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">{selectedRenter.renter.firstName} {selectedRenter.renter.lastName}</h3>
                                <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
                                    <HiOutlineEnvelope className="w-4 h-4" /> {selectedRenter.renter.email}
                                </p>
                            </div>
                        </div>

                        {/* Room Info */}
                        {selectedRenter.room && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl bg-slate-700/20 border border-white/5">
                                    <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                                        <HiOutlineHomeModern className="w-3.5 h-3.5" /> Room
                                    </div>
                                    <p className="text-white font-semibold">{selectedRenter.room.roomType} #{selectedRenter.room.roomNumber}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-700/20 border border-white/5">
                                    <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                                        <HiOutlineCurrencyRupee className="w-3.5 h-3.5" /> Rent
                                    </div>
                                    <p className="text-white font-semibold">{formatCurrency(selectedRenter.room.pricePerMonth)}<span className="text-xs text-slate-500 font-normal"> /month</span></p>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => { setShowDetailModal(false); navigate(`/chat/${selectedRenter.renter._id}`); }}
                                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20"
                            >
                                <HiOutlineChatBubbleLeftRight className="w-4 h-4" /> Chat
                            </button>
                            <button
                                onClick={() => { setShowDetailModal(false); viewBills(selectedRenter); }}
                                className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
                            >
                                <HiOutlineDocumentText className="w-4 h-4" /> View Bills
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Bills Modal */}
            <Modal isOpen={showBillsModal} onClose={() => setShowBillsModal(false)} title={`Bills — ${selectedRenter?.renter?.firstName} ${selectedRenter?.renter?.lastName}`} size="lg">
                {renterBills.length === 0 ? <p className="text-slate-500 py-8 text-center">No bills found</p> : (
                    <div className="divide-y divide-white/5">
                        {renterBills.map((b) => (
                            <div key={b._id} className="py-3 flex items-center justify-between">
                                <div><p className="text-sm font-medium text-white">{b.month}</p><p className="text-xs text-slate-500">{new Date(b.createdAt).toLocaleDateString()}</p></div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(b.status)}`}>{b.status}</span>
                                    <span className="text-sm font-semibold text-white">{formatCurrency(b.totalAmount)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Renters;
