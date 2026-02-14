import { useState } from "react";
import { useSelector } from "react-redux";
import authService from "../services/authService";
import { getInitials } from "../utils/formatters";
import toast from "react-hot-toast";
import { HiOutlineLockClosed } from "react-icons/hi2";

const Settings = () => {
    const { user } = useSelector((s) => s.auth);
    const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmNewPassword) return toast.error("All fields required");
        if (passwordForm.newPassword !== passwordForm.confirmNewPassword) return toast.error("Passwords don't match");
        try { setLoading(true); await authService.changePassword(passwordForm); toast.success("Password changed!"); setPasswordForm({ oldPassword: "", newPassword: "", confirmNewPassword: "" }); }
        catch (err) { toast.error(err.response?.data?.message || "Failed"); } finally { setLoading(false); }
    };

    const ic = "w-full px-4 py-2.5 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all";

    return (
        <div className="max-w-2xl space-y-8">
            <h1 className="text-2xl font-bold text-white">Settings</h1>

            {/* Profile Card */}
            <div className="rounded-2xl border border-white/5 bg-slate-800/30 p-6">
                <h2 className="text-base font-semibold text-white mb-4">Profile</h2>
                <div className="flex items-center gap-4">
                    {user?.image ? <img src={user.image} alt="" className="w-16 h-16 rounded-2xl object-cover" /> : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold">{getInitials(user?.firstName, user?.lastName)}</div>
                    )}
                    <div>
                        <p className="text-lg font-semibold text-white">{user?.firstName} {user?.lastName}</p>
                        <p className="text-sm text-slate-500">{user?.email}</p>
                        <div className="flex gap-2 mt-2">
                            {user?.roles?.isLandlord && <span className="px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs border border-violet-500/20">Landlord</span>}
                            {user?.roles?.isRenter && <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs border border-sky-500/20">Renter</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password */}
            <div className="rounded-2xl border border-white/5 bg-slate-800/30 p-6">
                <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2"><HiOutlineLockClosed className="w-5 h-5 text-slate-400" /> Change Password</h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Current Password</label><input type="password" value={passwordForm.oldPassword} onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })} className={ic} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label><input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className={ic} /></div>
                        <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm</label><input type="password" value={passwordForm.confirmNewPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })} className={ic} /></div>
                    </div>
                    <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold disabled:opacity-50 transition-all">{loading ? "Saving..." : "Update Password"}</button>
                </form>
            </div>
        </div>
    );
};

export default Settings;
