import { useState, useEffect } from "react";
import notificationService from "../services/notificationService";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import { formatDateTime } from "../utils/formatters";
import toast from "react-hot-toast";
import { HiOutlineBell, HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi2";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(null);
    const [rejectModal, setRejectModal] = useState({ open: false, notifId: null });
    const [rejectReason, setRejectReason] = useState("");
    const [rejecting, setRejecting] = useState(false);

    const fetchNotifs = async () => {
        try { setLoading(true); const res = await notificationService.getAll(); setNotifications(res.data.notifications || []); }
        catch { setNotifications([]); } finally { setLoading(false); }
    };

    useEffect(() => { fetchNotifs(); }, []);

    const markRead = async (id) => {
        try { await notificationService.markAsRead(id); setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n)); }
        catch { toast.error("Failed"); }
    };

    const acceptRequest = async (notifId) => {
        try {
            setAccepting(notifId);
            await notificationService.acceptRoomRequest(notifId);
            toast.success("Room request accepted! Renter allocated.");
            fetchNotifs();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to accept request");
        } finally {
            setAccepting(null);
        }
    };

    const openRejectModal = (notifId) => {
        setRejectModal({ open: true, notifId });
        setRejectReason("");
    };

    const handleReject = async () => {
        try {
            setRejecting(true);
            await notificationService.rejectRoomRequest(rejectModal.notifId, rejectReason);
            toast.success("Request rejected. Renter has been notified.");
            setRejectModal({ open: false, notifId: null });
            setRejectReason("");
            fetchNotifs();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to reject");
        } finally {
            setRejecting(false);
        }
    };

    if (loading) return <div className="flex justify-center pt-16"><Spinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold text-white">Notifications</h1><p className="text-slate-500 mt-1">{notifications.filter(n => !n.read).length} unread</p></div>

            {notifications.length === 0 ? (
                <EmptyState icon={HiOutlineBell} title="No notifications" description="You're all caught up!" />
            ) : (
                <div className="space-y-2">
                    {notifications.map((n) => {
                        const isRoomRequest = n.title === "Room Request";
                        return (
                            <div key={n._id} className={`rounded-2xl border p-5 transition-all ${n.read ? "border-white/5 bg-slate-800/20" : "border-violet-500/20 bg-violet-500/5"}`}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        {n.title && <p className="text-sm font-semibold text-white mb-1">{n.title}</p>}
                                        <p className="text-sm text-slate-300">{n.message}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-xs text-slate-500">{formatDateTime(n.createdAt)}</span>
                                            {n.sender && <span className="text-xs text-slate-500">from {n.sender.firstName} {n.sender.lastName}</span>}
                                        </div>

                                        {/* Accept/Reject buttons for room requests */}
                                        {isRoomRequest && !n.read && (
                                            <div className="flex items-center gap-2 mt-3">
                                                <button
                                                    onClick={() => acceptRequest(n._id)}
                                                    disabled={accepting === n._id}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 transition-all text-xs font-medium disabled:opacity-50"
                                                >
                                                    <HiOutlineCheckCircle className="w-4 h-4" />
                                                    {accepting === n._id ? "Accepting..." : "Accept"}
                                                </button>
                                                <button
                                                    onClick={() => openRejectModal(n._id)}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all text-xs font-medium"
                                                >
                                                    <HiOutlineXCircle className="w-4 h-4" />
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {!n.read && !isRoomRequest && (
                                        <button onClick={() => markRead(n._id)} className="p-1.5 rounded-lg text-violet-400 hover:bg-violet-500/10 transition-colors" title="Mark as read">
                                            <HiOutlineCheckCircle className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Reject Reason Modal */}
            <Modal isOpen={rejectModal.open} onClose={() => setRejectModal({ open: false, notifId: null })} title="Reject Room Request">
                <div className="space-y-4">
                    <p className="text-sm text-slate-400">The renter will be notified and can request again.</p>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Reason (optional)</label>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Enter a reason for rejecting this request..."
                            rows={3}
                            className="w-full px-4 py-2.5 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all resize-none"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setRejectModal({ open: false, notifId: null })}
                            className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleReject}
                            disabled={rejecting}
                            className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-semibold text-sm hover:bg-red-500/30 transition-all disabled:opacity-50"
                        >
                            {rejecting ? "Rejecting..." : "Reject Request"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Notifications;
