import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../slices/authSlice";
import { clearDashboard } from "../../slices/dashboardSlice";
import authService from "../../services/authService";
import toast from "react-hot-toast";
import {
    HiOutlineHome,
    HiOutlineBuildingOffice2,
    HiOutlineUsers,
    HiOutlineDocumentText,
    HiOutlineBell,
    HiOutlineCog6Tooth,
    HiOutlineArrowRightOnRectangle,
    HiOutlineMagnifyingGlass,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineSquares2X2,
    HiOutlineChatBubbleLeftRight,
} from "react-icons/hi2";

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const isLandlord = user?.roles?.isLandlord;
    const isRenter = user?.roles?.isRenter;

    const handleLogout = async () => {
        try {
            await authService.logout();
            dispatch(logout());
            dispatch(clearDashboard());
            toast.success("Logged out successfully");
            navigate("/login");
        } catch {
            dispatch(logout());
            navigate("/login");
        }
    };

    const landlordLinks = [
        { path: "/dashboard", label: "Dashboard", icon: HiOutlineHome },
        { path: "/houses", label: "My Houses", icon: HiOutlineBuildingOffice2 },
        { path: "/renters", label: "Renters", icon: HiOutlineUsers },
        { path: "/bills", label: "Bills", icon: HiOutlineDocumentText },
        { path: "/search-rooms", label: "Search Rooms", icon: HiOutlineMagnifyingGlass },
        { path: "/notifications", label: "Notifications", icon: HiOutlineBell },
    ];

    const renterLinks = [
        { path: "/dashboard", label: "Dashboard", icon: HiOutlineHome },
        { path: "/my-bills", label: "My Bills", icon: HiOutlineDocumentText },
        { path: "/search-rooms", label: "Search Rooms", icon: HiOutlineMagnifyingGlass },
        { path: "/chat", label: "Chat", icon: HiOutlineChatBubbleLeftRight },
        { path: "/notifications", label: "Notifications", icon: HiOutlineBell },
    ];

    const newUserLinks = [
        { path: "/dashboard", label: "Dashboard", icon: HiOutlineHome },
        { path: "/houses", label: "Get Started", icon: HiOutlineBuildingOffice2 },
        { path: "/search-rooms", label: "Search Rooms", icon: HiOutlineMagnifyingGlass },
        { path: "/notifications", label: "Notifications", icon: HiOutlineBell },
    ];

    let navLinks = newUserLinks;
    if (isLandlord && isRenter) {
        navLinks = [
            ...landlordLinks,
            { path: "/my-bills", label: "My Bills", icon: HiOutlineDocumentText },
            { path: "/chat", label: "Chat", icon: HiOutlineChatBubbleLeftRight },
        ];
    } else if (isLandlord) {
        navLinks = landlordLinks;
    } else if (isRenter) {
        navLinks = renterLinks;
    }

    // Deduplicate by path
    const seen = new Set();
    navLinks = navLinks.filter((link) => {
        if (seen.has(link.path)) return false;
        seen.add(link.path);
        return true;
    });

    return (
        <aside
            className={`fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out
        ${collapsed ? "w-20" : "w-64"}
        bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-white/5`}
        >
            {/* Logo */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-white/5">
                <Link to="/dashboard" className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                        <HiOutlineSquares2X2 className="w-5 h-5 text-white" />
                    </div>
                    {!collapsed && (
                        <span className="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                            Roomly
                        </span>
                    )}
                </Link>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                >
                    {collapsed ? <HiOutlineChevronRight className="w-4 h-4" /> : <HiOutlineChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
                {navLinks.map((link) => {
                    const isActive = location.pathname === link.path || (link.path !== "/dashboard" && location.pathname.startsWith(link.path));
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                ${isActive
                                    ? "bg-gradient-to-r from-violet-500/15 to-indigo-500/10 text-white shadow-sm"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <Icon
                                className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300"}`}
                            />
                            {!collapsed && <span className="text-sm font-medium truncate">{link.label}</span>}
                            {isActive && !collapsed && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shadow-sm shadow-violet-400/50" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User + Logout Footer */}
            <div className="px-3 py-4 border-t border-white/5 space-y-2">
                <Link
                    to="/settings"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                    <HiOutlineCog6Tooth className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">Settings</span>}
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                >
                    <HiOutlineArrowRightOnRectangle className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">Logout</span>}
                </button>

                {!collapsed && user && (
                    <div className="mt-3 px-3 py-3 rounded-xl bg-white/5 backdrop-blur-sm">
                        <p className="text-sm font-medium text-white truncate">
                            {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
