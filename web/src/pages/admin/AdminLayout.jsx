import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

const AdminLayout = () => {
    return (
        <div className="flex">
            {/* Sidebar */}
            <Sidebar />

            {/* Main content */}
            <div className="ml-64 p-6 w-full min-h-screen bg-gray-50">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
