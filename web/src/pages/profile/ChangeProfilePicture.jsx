import React, { useState } from "react";
import axios from "axios";
import PageWrapper from "../../components/PageWrapper";
import { BASE_URL } from "../../utils/url";
import { getUser } from "../../utils/getUser";
import { useNavigate } from "react-router-dom";

const ChangeProfilePicture = () => {
  const token = getUser();
  const navigate = useNavigate();

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const file = e.target.elements.image.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);
    try {
      const response = await axios.patch(
        `${BASE_URL}/users/image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/profile");
      // Tambahkan notifikasi sukses jika perlu
    } catch (err) {
      console.error("Upload failed:", err);
      // Tambahkan notifikasi error jika perlu
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="pt-28 px-4 max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Change Profile Picture
        </h1>
        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="bg-white p-6 rounded-lg shadow-md border space-y-6"
        >
          <div className="flex justify-center">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 rounded-full object-cover border"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 border">
                No Image
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Image
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-900"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-900 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Save Changes"}
          </button>
        </form>
      </div>
    </PageWrapper>
  );
};

export default ChangeProfilePicture;
