import React from "react";
import { Link } from "react-router-dom";
import { Pencil } from "lucide-react";
import PageWrapper from "../components/PageWrapper";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  const handleEditClick = () => {
    navigate("/change-profile-picture");
  };

  return (
    <PageWrapper>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white text-black">
        {/* Avatar + Edit */}
        <div className="relative mb-6">
          <img
            src="https://randomuser.me/api/portraits/men/1.jpg"
            alt="User Avatar"
            className="w-28 h-28 rounded-full object-cover border-2 border-black shadow"
          />
          <button
            onClick={handleEditClick}
            className="absolute bottom-1 right-1 bg-white border border-black text-black p-1 rounded-full hover:bg-black hover:text-white transition"
          >
            <Pencil size={16} />
          </button>
        </div>

        {/* User Info */}
        <h1 className="text-xl font-bold">Azmi Nailal hadi</h1>
        <p className="text-sm text-gray-600 mb-3">
          azminailalhadi.py@gmail.com
        </p>

        {/* Balance */}
        <div className="flex items-center justify-center bg-black text-white rounded-full px-5 py-1 text-sm font-medium mb-6 shadow">
          <span>$</span>
          <span className="ml-2">100</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            to="/transaction-history"
            className="border border-black text-black py-2 rounded text-center hover:bg-black hover:text-white transition"
          >
            Transaction History
          </Link>
          <Link
            to="/update-profile"
            className="border border-black text-black py-2 rounded text-center hover:bg-black hover:text-white transition"
          >
            Update Profile
          </Link>
          <Link
            to="/change-password"
            className="border border-black text-black py-2 rounded text-center hover:bg-black hover:text-white transition"
          >
            Change Password
          </Link>
          <button className="border border-black text-black py-2 rounded text-center hover:bg-black hover:text-white transition">
            Log Out
          </button>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Profile;
