import React, { useState } from "react";

const Settings = () => {
    const [formData, setFormData] = useState({
        siteTitle: "GOVEL",
        siteDescription: "Platform baca novel online terbaik.",
        contactEmail: "admin@govel.com",
        maintenanceMode: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Nanti bisa kirim ke Supabase
        console.log("Settings disimpan:", formData);
        alert("Pengaturan berhasil disimpan!");
    };

    return (
        <div className="p-6 max-w-3xl mx-auto bg-white shadow rounded">
            <h2 className="text-2xl font-bold mb-6">Pengaturan Aplikasi</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block font-medium mb-1">Judul Situs</label>
                    <input
                        type="text"
                        name="siteTitle"
                        value={formData.siteTitle}
                        onChange={handleChange}
                        className="w-full border px-4 py-2 rounded"
                    />
                </div>

                <div>
                    <label className="block font-medium mb-1">Deskripsi Situs</label>
                    <textarea
                        name="siteDescription"
                        value={formData.siteDescription}
                        onChange={handleChange}
                        rows="3"
                        className="w-full border px-4 py-2 rounded"
                    />
                </div>

                <div>
                    <label className="block font-medium mb-1">Email Kontak</label>
                    <input
                        type="email"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleChange}
                        className="w-full border px-4 py-2 rounded"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        name="maintenanceMode"
                        checked={formData.maintenanceMode}
                        onChange={handleChange}
                        className="w-4 h-4"
                    />
                    <label className="text-gray-700">Aktifkan Mode Perawatan</label>
                </div>

                <div className="text-right">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                        Simpan Pengaturan
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;
