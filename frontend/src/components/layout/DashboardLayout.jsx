import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const DashboardLayout = () => {
    return (
        <div className="flex min-h-screen bg-slate-950">
            <Sidebar />
            {/* Main content — offset by sidebar width */}
            <div className="flex-1 ml-64 flex flex-col min-h-screen transition-all duration-300">
                <Navbar />
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
