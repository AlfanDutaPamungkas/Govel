// src/pages/admin/AddEditNovel.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { dummyNovels } from "../../data/novel"; // ganti nanti dengan fetch dari backend

const AddEditNovel = () => {
    const { id } = useParams(); // jika ada id, maka ini mode edit
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState({
        title: "",
        author: "",
        genre: "",
        coverImage: "",
    });

    useEffect(() => {
        if (isEdit) {
            const novel = dummyNovels.find((n) => n.id === parseInt(id));
            if (novel) {
                setForm({
                    title: novel.title,
                    author: novel.author,
                    genre: novel.genre,
                    coverImage: novel.coverImage,
                });
            } else {
                alert("Novel tidak ditemukan.");
                navigate("/admin/novels");
            }
        }
    }, [id]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.title || !form.author || !form.genre || !form.coverImage) {
            alert("Semua field harus diisi.");
            return;
        }

        if (isEdit) {
            // update novel di database
            console.log("Update novel:", form);
        } else {
            // tambah novel baru
            console.log("Tambah novel baru:", form);
        }

        navigate("/admin/novels");
    };

    return (
        <div className="max-w-xl mx-auto bg-white shadow p-6 rounded">
            <h1 className="text-2xl font-bold mb-4">
                {isEdit ? "Edit Novel" : "Tambah Novel"}
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="font-medium block mb-1">Judul</label>
                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="font-medium block mb-1">Penulis</label>
                    <input
                        type="text"
                        name="author"
                        value={form.author}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="font-medium block mb-1">Genre</label>
                    <input
                        type="text"
                        name="genre"
                        value={form.genre}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="font-medium block mb-1">URL Gambar Sampul</label>
                    <input
                        type="text"
                        name="coverImage"
                        value={form.coverImage}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                    {form.coverImage && (
                        <img
                            src={form.coverImage}
                            alt="Cover preview"
                            className="w-40 mt-2 rounded shadow"
                        />
                    )}
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    {isEdit ? "Simpan Perubahan" : "Tambah Novel"}
                </button>
            </form>
        </div>
    );
};

export default AddEditNovel;
