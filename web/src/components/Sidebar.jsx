import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Book,
    Plus,
    Settings,
    LogOut,
    Receipt
} from "lucide-react";
import { useDispatch } from "react-redux";
import { logoutAction } from "../redux/slice/authSlice";

const Sidebar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logoutAction());
        localStorage.removeItem("userInfo");
        navigate("/");
    };

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-2 rounded transition font-medium ${isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
        }`;

    return (
        <aside className="w-64 h-screen bg-white shadow-md p-4 flex flex-col justify-between fixed left-0 top-0">
            <div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-700">
                    <LayoutDashboard size={20} />
                    Admin Panel
                </h2>

                <nav className="flex flex-col gap-2">
                    <NavLink to="/admin" end className={linkClass}>
                        <LayoutDashboard size={18} />
                        Dashboard
                    </NavLink>

                    <NavLink to="/admin/novels" className={linkClass}>
                        <Book size={18} />
                        Daftar Novel
                    </NavLink>

                    <NavLink to="/admin/add-novel" className={linkClass}>
                        <Plus size={18} />
                        Tambah Novel
                    </NavLink>

                    <NavLink to="/admin/genres" className={linkClass}>
                        <Book size={18} />
                        Kelola Genre
                    </NavLink>

                    <NavLink to="/admin/transactions" className={linkClass}>
                        <Receipt size={18} />
                        Transaksi User
                    </NavLink>

                    <NavLink to="/admin/settings" className={linkClass}>
                        <Settings size={18} />
                        Pengaturan
                    </NavLink>
                </nav>
            </div>

            {/* Logout button di bawah */}
            <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 rounded text-red-600 hover:bg-red-100 transition"
            >
                <LogOut size={18} />
                Logout
            </button>
        </aside>
    );
};

export default Sidebar;
