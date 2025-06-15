import React from "react";
import PageWrapper from "../../components/PageWrapper";
import Navbar from "../../components/Navbar";

const ChangePassword = () => {
  return (
    <PageWrapper>
      <Navbar />
      <div className="pt-28 px-4 max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Change Password</h1>
        <form className="space-y-6 bg-white p-6 rounded-lg shadow-md border">
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="current-password"
            >
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-black"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="new-password"
            >
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-black"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="confirm-password"
            >
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-black"
              placeholder="Re-enter new password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-900 transition"
          >
            Change Password
          </button>
        </form>
      </div>
    </PageWrapper>
  );
};

export default ChangePassword;
