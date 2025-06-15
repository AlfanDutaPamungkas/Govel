import React, { useState } from "react";
import PageWrapper from "../../components/PageWrapper";
import Navbar from "../../components/Navbar";

const ChangeProfilePicture = () => {
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <PageWrapper>
      <div className="pt-28 px-4 max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Change Profile Picture
        </h1>
        <form className="bg-white p-6 rounded-lg shadow-md border space-y-6">
          {preview ? (
            <div className="flex justify-center">
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 rounded-full object-cover border"
              />
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 border">
                No Image
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-900"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-900 transition"
          >
            Save Changes
          </button>
        </form>
      </div>
    </PageWrapper>
  );
};

export default ChangeProfilePicture;
