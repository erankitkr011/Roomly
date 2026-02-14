import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Houses from "./pages/Houses";
import HouseDetail from "./pages/HouseDetail";
import Renters from "./pages/Renters";
import Bills from "./pages/Bills";
import MyBills from "./pages/MyBills";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import SearchRooms from "./pages/SearchRooms";
import RoomDetail from "./pages/RoomDetail";
import Chat from "./pages/Chat";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1e293b",
            color: "#f1f5f9",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            fontSize: "14px",
          },
        }}
      />
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/houses" element={<Houses />} />
              <Route path="/houses/:houseId" element={<HouseDetail />} />
              <Route path="/renters" element={<Renters />} />
              <Route path="/bills" element={<Bills />} />
              <Route path="/my-bills" element={<MyBills />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/search-rooms" element={<SearchRooms />} />
              <Route path="/rooms/:roomId" element={<RoomDetail />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/chat/:userId" element={<Chat />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
