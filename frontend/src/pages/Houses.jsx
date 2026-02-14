import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../slices/authSlice";
import houseService from "../services/houseService";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import toast from "react-hot-toast";
import { HiOutlineBuildingOffice2, HiOutlinePlusCircle, HiOutlineMapPin, HiOutlineTrash, HiOutlineEye } from "react-icons/hi2";

const Houses = () => {
    const [houses, setHouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        name: "", description: "",
        address: { houseNo: "", village: "", landmark: "", city: "", state: "", pincode: "" },
    });
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const fetchHouses = async () => {
        try {
            setLoading(true);
            const res = await houseService.getAllHouses();
            setHouses(res.data.houses || []);
        } catch (err) {
            // 403 = not a landlord yet, just show empty state
            if (err.response?.status === 403 || err.response?.status === 401) setHouses([]);
            else toast.error("Failed to load houses");
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchHouses(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.name || !form.address.city || !form.address.state || !form.address.pincode)
            return toast.error("Name and address required");
        try {
            setCreating(true);
            await houseService.createHouse(form);
            toast.success("House created!");
            setShowModal(false);
            // Update user roles — creating a house makes user a landlord
            const u = JSON.parse(localStorage.getItem("user"));
            if (u && !u.roles?.isLandlord) {
                u.roles = { ...u.roles, isLandlord: true };
                localStorage.setItem("user", JSON.stringify(u));
                dispatch(setUser(u));
            }
            fetchHouses();
        } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
        finally { setCreating(false); }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!confirm("Delete this house?")) return;
        try { await houseService.deleteHouse(id); toast.success("Deleted"); fetchHouses(); }
        catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    };

    const ic = "w-full px-4 py-2.5 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all";

    if (loading) return <div className="flex justify-center pt-16"><Spinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Houses</h1>
                    <p className="text-slate-500 mt-1">{houses.length} properties</p>
                </div>
                <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20">
                    <HiOutlinePlusCircle className="w-5 h-5" /> Add House
                </button>
            </div>

            {houses.length === 0 ? (
                <EmptyState icon={HiOutlineBuildingOffice2} title="No houses yet" description="Add your first house to start managing properties"
                    action={<button onClick={() => setShowModal(true)} className="px-6 py-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 transition-all text-sm font-medium">Create House</button>} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {houses.map((h) => (
                        <div key={h._id} onClick={() => navigate(`/houses/${h._id}`)} className="group relative rounded-2xl border border-white/5 bg-slate-800/30 hover:bg-slate-800/50 hover:border-violet-500/20 transition-all duration-300 cursor-pointer overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2.5 rounded-xl bg-violet-500/10"><HiOutlineBuildingOffice2 className="w-5 h-5 text-violet-400" /></div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); navigate(`/houses/${h._id}`); }} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"><HiOutlineEye className="w-4 h-4" /></button>
                                        <button onClick={(e) => handleDelete(h._id, e)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"><HiOutlineTrash className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <h3 className="text-base font-semibold text-white mb-1 group-hover:text-violet-300 transition-colors">{h.name}</h3>
                                {h.address && <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4"><HiOutlineMapPin className="w-3.5 h-3.5" />{h.address.city}, {h.address.state}</div>}
                                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                    <div className="text-center"><p className="text-lg font-bold text-white">{h.totalFloors || 0}</p><p className="text-xs text-slate-500">Floors</p></div>
                                    <div className="w-px h-8 bg-white/5" />
                                    <div className="text-center"><p className="text-lg font-bold text-white">{h.totalUnits || 0}</p><p className="text-xs text-slate-500">Rooms</p></div>
                                    <div className="w-px h-8 bg-white/5" />
                                    <div className="text-center"><p className="text-lg font-bold text-white">{h.occupiedUnits || 0}</p><p className="text-xs text-slate-500">Occupied</p></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New House" size="lg">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Name *</label>
                        <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Ankit Bhawan" className={ic} /></div>
                    <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={ic + " resize-none"} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-slate-300 mb-1.5">House No</label>
                            <input value={form.address.houseNo} onChange={(e) => setForm({ ...form, address: { ...form.address, houseNo: e.target.value } })} className={ic} /></div>
                        <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Village</label>
                            <input value={form.address.village} onChange={(e) => setForm({ ...form, address: { ...form.address, village: e.target.value } })} className={ic} /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div><label className="block text-sm font-medium text-slate-300 mb-1.5">City *</label>
                            <input value={form.address.city} onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })} className={ic} /></div>
                        <div><label className="block text-sm font-medium text-slate-300 mb-1.5">State *</label>
                            <input value={form.address.state} onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })} className={ic} /></div>
                        <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Pincode *</label>
                            <input value={form.address.pincode} onChange={(e) => setForm({ ...form, address: { ...form.address, pincode: e.target.value } })} className={ic} /></div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 text-sm">Cancel</button>
                        <button type="submit" disabled={creating} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-sm disabled:opacity-50 shadow-lg shadow-violet-500/20">{creating ? "Creating..." : "Create House"}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Houses;
