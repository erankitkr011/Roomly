import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import renterService from "../services/renterService";
import billService from "../services/billService";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import { getStatusColor, formatCurrency, formatDate, getInitials } from "../utils/formatters";
import toast from "react-hot-toast";
import {
    HiOutlineDocumentText, HiOutlinePlusCircle, HiOutlineBolt,
    HiOutlineCurrencyRupee,
} from "react-icons/hi2";

const Bills = () => {
    const { user } = useSelector((s) => s.auth);
    const [renters, setRenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null); // { renter, room }
    const [form, setForm] = useState({ month: "", currentReading: "", otherBills: { water: 0, maintenance: 0, custom: 0 } });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const load = async () => {
            try { setLoading(true); const res = await renterService.getAllRenters(); setRenters(res.data.renters || []); }
            catch { setRenters([]); } finally { setLoading(false); }
        };
        load();
    }, []);

    // When renter selection changes, reset form
    const onSelectRenter = (index) => {
        if (index === "") {
            setSelectedItem(null);
            return;
        }
        const item = renters[Number(index)];
        setSelectedItem(item);
        // Set default month
        const now = new Date();
        const monthStr = now.toLocaleString("en-US", { month: "long", year: "numeric" });
        setForm({ month: monthStr, currentReading: "", otherBills: { water: 0, maintenance: 0, custom: 0 } });
    };

    const previousReading = selectedItem?.room?.currentMeterReading || 0;
    const perUnitRate = selectedItem?.room?.perUnitRate || 8;
    const rent = selectedItem?.room?.pricePerMonth || 0;
    const currentReading = Number(form.currentReading) || 0;
    const unitsConsumed = Math.max(0, currentReading - previousReading);
    const electricityBill = unitsConsumed * perUnitRate;
    const otherTotal = (Number(form.otherBills.water) || 0) + (Number(form.otherBills.maintenance) || 0) + (Number(form.otherBills.custom) || 0);
    const totalAmount = rent + electricityBill + otherTotal;

    const handleSendBill = async (e) => {
        e.preventDefault();
        if (!selectedItem) return toast.error("Select a renter");
        if (!form.month || !form.currentReading) return toast.error("Month and current reading are required");
        if (currentReading < previousReading) return toast.error("Current reading can't be less than previous reading");
        try {
            setSubmitting(true);
            await billService.sendBill({
                roomId: selectedItem.room.id,
                month: form.month,
                currentReading: Number(form.currentReading),
                otherBills: form.otherBills,
            });
            toast.success("Bill sent!");
            setShowCreateModal(false);
            setSelectedItem(null);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send bill");
        } finally {
            setSubmitting(false);
        }
    };

    const ic = "w-full px-4 py-2.5 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all";

    if (loading) return <div className="flex justify-center pt-16"><Spinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold text-white">Bills Management</h1><p className="text-slate-500 mt-1">Send and manage bills for your renters</p></div>
                <button onClick={() => { setShowCreateModal(true); setSelectedItem(null); }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-500/20">
                    <HiOutlinePlusCircle className="w-5 h-5" /> Send Bill
                </button>
            </div>

            {renters.length === 0 ? (
                <EmptyState icon={HiOutlineDocumentText} title="No renters to bill" description="Add renters first before sending bills" />
            ) : (
                <div className="rounded-2xl border border-white/5 bg-slate-800/30 p-6">
                    <p className="text-slate-400 text-sm">Select a renter from the Renters page to view their bills, or click "Send Bill" to create a new bill.</p>
                </div>
            )}

            {/* Send Bill Modal */}
            <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Send Bill" size="lg">
                <form onSubmit={handleSendBill} className="space-y-5">
                    {/* Renter Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Select Renter *</label>
                        <select
                            value={selectedItem ? renters.indexOf(selectedItem) : ""}
                            onChange={(e) => onSelectRenter(e.target.value)}
                            className={ic}
                        >
                            <option value="">Choose renter...</option>
                            {renters.map((item, idx) => (
                                <option key={item.renter?._id || idx} value={idx}>
                                    {item.renter?.firstName} {item.renter?.lastName} — {item.renter?.email} ({item.room?.roomType} #{item.room?.roomNumber})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Show room info when renter is selected */}
                    {selectedItem && (
                        <>
                            {/* Room & Rate Info */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3 rounded-xl bg-slate-700/20 border border-white/5">
                                    <p className="text-xs text-slate-500 mb-0.5">Room</p>
                                    <p className="text-sm font-semibold text-white">{selectedItem.room?.roomType} #{selectedItem.room?.roomNumber}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-700/20 border border-white/5">
                                    <p className="text-xs text-slate-500 mb-0.5">Rent/month</p>
                                    <p className="text-sm font-semibold text-white">{formatCurrency(rent)}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-700/20 border border-white/5">
                                    <p className="text-xs text-slate-500 mb-0.5">Rate/unit</p>
                                    <p className="text-sm font-semibold text-white">₹{perUnitRate}</p>
                                </div>
                            </div>

                            {/* Month & Readings */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Month *</label>
                                    <input value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} placeholder="January 2025" className={ic} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Previous Reading</label>
                                    <input type="number" value={previousReading} readOnly className={`${ic} opacity-60 cursor-not-allowed`} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Current Reading *</label>
                                    <input type="number" value={form.currentReading} onChange={(e) => setForm({ ...form, currentReading: e.target.value })} placeholder="Enter reading" className={ic} />
                                </div>
                            </div>

                            {/* Electricity Calculation Preview */}
                            {form.currentReading && currentReading >= previousReading && (
                                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                    <div className="flex items-center gap-2 text-amber-400 text-xs font-medium mb-2">
                                        <HiOutlineBolt className="w-4 h-4" /> Electricity Calculation
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-300">
                                        <span>({currentReading} − {previousReading}) = <span className="text-white font-semibold">{unitsConsumed} units</span></span>
                                        <span className="text-slate-600">×</span>
                                        <span>₹{perUnitRate}/unit = <span className="text-amber-400 font-semibold">{formatCurrency(electricityBill)}</span></span>
                                    </div>
                                </div>
                            )}

                            {/* Other Bills */}
                            <div className="grid grid-cols-3 gap-4">
                                <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Water ₹</label><input type="number" value={form.otherBills.water} onChange={(e) => setForm({ ...form, otherBills: { ...form.otherBills, water: Number(e.target.value) } })} className={ic} /></div>
                                <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Maintenance ₹</label><input type="number" value={form.otherBills.maintenance} onChange={(e) => setForm({ ...form, otherBills: { ...form.otherBills, maintenance: Number(e.target.value) } })} className={ic} /></div>
                                <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Custom ₹</label><input type="number" value={form.otherBills.custom} onChange={(e) => setForm({ ...form, otherBills: { ...form.otherBills, custom: Number(e.target.value) } })} className={ic} /></div>
                            </div>

                            {/* Total Preview */}
                            <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-slate-300">
                                        <div className="flex justify-between gap-8 mb-1"><span>Room Rent</span><span className="text-white">{formatCurrency(rent)}</span></div>
                                        <div className="flex justify-between gap-8 mb-1"><span>Electricity</span><span className="text-white">{formatCurrency(electricityBill)}</span></div>
                                        {otherTotal > 0 && <div className="flex justify-between gap-8 mb-1"><span>Other Bills</span><span className="text-white">{formatCurrency(otherTotal)}</span></div>}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500 mb-1">Estimated Total</p>
                                        <p className="text-2xl font-bold text-white">{formatCurrency(totalAmount)}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm">Cancel</button>
                        <button type="submit" disabled={submitting || !selectedItem} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm disabled:opacity-50">{submitting ? "Sending..." : "Send Bill"}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Bills;
