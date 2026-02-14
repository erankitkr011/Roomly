import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import notificationService from "../../services/notificationService";
import { getInitials } from "../../utils/formatters";
import {
    HiOutlineBell,
    HiOutlineEnvelope,
} from "react-icons/hi2";

const Navbar = () => {
    const { user } = useSelector((state) => state.auth);
    const [notifications, setNotifications] = useState([]);
    const [showNotif, setShowNotif] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const notifRef = useRef(null);
    const profileRef = useRef(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await notificationService.getAll();
                setNotifications(res.data.notifications || []);
            } catch {
                // silently fail
            }
        };
        fetchNotifications();
    }, []);

    useEffect(() => {
        const handleClick = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
            if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <header className="sticky top-0 z-30 h-16 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6">
            {/* Left: Page title area */}
            <div />

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotif(!showNotif)}
                        className="relative p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <HiOutlineBell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500 ring-2 ring-slate-900" />
                        )}
                    </button>
                    {showNotif && (
                        <div className="absolute right-0 top-12 w-80 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
                            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-white">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="text-xs text-violet-400 font-medium">{unreadCount} new</span>
                                )}
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-8 text-center">
                                        <HiOutlineEnvelope className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                        <p className="text-sm text-slate-500">No notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.slice(0, 8).map((n) => (
                                        <div
                                            key={n._id}
                                            className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${!n.read ? "bg-violet-500/5" : ""
                                                }`}
                                        >
                                            <p className="text-sm text-slate-200 line-clamp-2">{n.message || n.title}</p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {new Date(n.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                            <Link
                                to="/notifications"
                                className="block px-4 py-2.5 text-center text-xs text-violet-400 hover:bg-white/5 transition-colors border-t border-white/5"
                                onClick={() => setShowNotif(false)}
                            >
                                View All Notifications
                            </Link>
                        </div>
                    )}
                </div>

                {/* Profile Avatar */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setShowProfile(!showProfile)}
                        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-all"
                    >
                        {user?.image ? (
                            <img src={user.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                {getInitials(user?.firstName, user?.lastName)}
                            </div>
                        )}
                    </button>
                    {showProfile && (
                        <div className="absolute right-0 top-12 w-56 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
                            <div className="px-4 py-3 border-b border-white/5">
                                <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>
                            <div className="py-1">
                                <Link
                                    to="/settings"
                                    onClick={() => setShowProfile(false)}
                                    className="block px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                                >
                                    Settings
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
