import { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../services/authService";
import toast from "react-hot-toast";
import { HiOutlineEnvelope } from "react-icons/hi2";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return toast.error("Email is required");
        try {
            setLoading(true);
            await authService.resetPasswordToken(email);
            toast.success("Reset link sent to your email!");
            setSent(true);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send reset link");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/20">
                        <HiOutlineEnvelope className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
                    <p className="text-slate-500">
                        {sent ? "Check your email for the reset link" : "Enter your email to receive a reset link"}
                    </p>
                </div>
                {!sent ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="relative">
                            <HiOutlineEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@email.com"
                                className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold transition-all disabled:opacity-50 shadow-lg shadow-violet-500/25"
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                ) : (
                    <div className="text-center p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                        <p className="text-emerald-400 font-medium">✓ Reset link sent!</p>
                        <p className="text-sm text-slate-400 mt-2">Please check your email inbox.</p>
                    </div>
                )}
                <p className="text-center text-sm text-slate-500 mt-6">
                    <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium">
                        ← Back to Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
