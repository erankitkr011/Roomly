import { useState, useEffect } from "react";
import renterService from "../services/renterService";
import paymentService from "../services/paymentService";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import { getStatusColor, formatCurrency, formatDate } from "../utils/formatters";
import toast from "react-hot-toast";
import { HiOutlineDocumentText, HiOutlineBanknotes, HiOutlineCheckCircle } from "react-icons/hi2";

const MyBills = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBills = async () => {
        try { setLoading(true); const res = await renterService.getAllBills(); setBills(res.data.bills || []); }
        catch { setBills([]); } finally { setLoading(false); }
    };

    useEffect(() => { fetchBills(); }, []);

    const handleVerify = async (billId) => {
        try { await renterService.verifyBill(billId); toast.success("Bill verified!"); fetchBills(); }
        catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    };

    const handlePayOnline = async (billId) => {
        try {
            const res = await paymentService.payOnline(billId);
            const { orderId, amount } = res.data;
            const key = import.meta.env.VITE_API_RAZORPAY_KEY;
            const options = {
                key, amount: amount * 100, currency: "INR", name: "Roomly", description: "Rent Payment", order_id: orderId,
                handler: async (response) => {
                    try { await paymentService.verifyPayment({ ...response, billId }); toast.success("Payment successful!"); fetchBills(); }
                    catch { toast.error("Verification failed"); }
                },
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    };

    if (loading) return <div className="flex justify-center pt-16"><Spinner size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold text-white">My Bills</h1><p className="text-slate-500 mt-1">{bills.length} bills</p></div>

            {bills.length === 0 ? (
                <EmptyState icon={HiOutlineDocumentText} title="No bills yet" description="Your bills will appear here when your landlord sends them" />
            ) : (
                <div className="space-y-4">
                    {bills.map((b) => (
                        <div key={b._id} className="rounded-2xl border border-white/5 bg-slate-800/30 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-base font-semibold text-white">{b.month}</p>
                                    <p className="text-xs text-slate-500">{formatDate(b.createdAt)}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(b.status)}`}>{b.status}</span>
                                    <span className="text-lg font-bold text-white">{formatCurrency(b.totalAmount)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                                <div><span className="text-slate-500">Prev Reading</span><p className="text-white font-medium">{b.previousReading}</p></div>
                                <div><span className="text-slate-500">Curr Reading</span><p className="text-white font-medium">{b.currentReading}</p></div>
                                <div><span className="text-slate-500">Units</span><p className="text-white font-medium">{b.unitsConsumed}</p></div>
                                <div><span className="text-slate-500">Rent</span><p className="text-white font-medium">{formatCurrency(b.room?.pricePerMonth || 0)}</p></div>
                            </div>

                            {b.status === "Pending" && (
                                <div className="flex gap-3">
                                    <button onClick={() => handleVerify(b._id)} className="flex-1 py-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 text-sm font-medium hover:bg-sky-500/20 transition-all flex items-center justify-center gap-2">
                                        <HiOutlineCheckCircle className="w-4 h-4" /> Verify
                                    </button>
                                </div>
                            )}
                            {(b.status === "Verified") && (
                                <div className="flex gap-3">
                                    <button onClick={() => handlePayOnline(b._id)} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium transition-all flex items-center justify-center gap-2">
                                        <HiOutlineBanknotes className="w-4 h-4" /> Pay Online
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBills;
