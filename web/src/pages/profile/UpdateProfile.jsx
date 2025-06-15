import React from "react";
import PageWrapper from "../../components/PageWrapper";
import Navbar from "../../components/Navbar";

const UpdateProfile = () => {
  return (
    <PageWrapper>
      <Navbar />
      <div className="pt-28 px-4 max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Update Profile</h1>
        <form className="space-y-6 bg-white p-6 rounded-lg shadow-md border">
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="username"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-black"
              placeholder="Enter new username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-black"
              placeholder="Enter new email"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-900 transition"
          >
            Update Profile
          </button>
        </form>
      </div>
    </PageWrapper>
  );
};

export default UpdateProfile;
