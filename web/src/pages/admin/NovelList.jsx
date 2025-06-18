import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, BookOpen } from "lucide-react";
import { dummyNovels } from "../../data/novel"; // Nanti ganti dengan fetch dari backend

const NovelList = () => {
    const [novels, setNovels] = useState([]);

    useEffect(() => {
        // Untuk sekarang gunakan data dummy
        setNovels(dummyNovels);
    }, []);

    const handleDelete = (id) => {
        if (confirm("Yakin ingin menghapus novel ini?")) {
            setNovels((prev) => prev.filter((novel) => novel.id !== id));
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Daftar Novel</h1>
                <Link
                    to="/admin/add-novel"
                    className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
                >
                    Tambah Novel
                </Link>
            </div>

            {novels.length === 0 ? (
                <p className="text-gray-500 italic">Belum ada novel.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {novels.map((novel) => (
                        <div
                            key={novel.id}
                            className="bg-white rounded shadow p-4 flex flex-col"
                        >
                            <img
                                src={novel.coverImage}
                                alt={novel.title}
                                className="w-full h-48 object-cover rounded mb-3"
                            />
                            <h2 className="font-semibold text-lg">{novel.title}</h2>
                            <p className="text-sm text-gray-600 mb-1">By: {novel.author}</p>
                            <p className="text-sm text-gray-500 italic mb-3">
                                Genre: {novel.genre}
                            </p>
                            <div className="mt-auto flex gap-2 flex-wrap">
                                <Link
                                    to={`/admin/novels/${novel.id}`}
                                    className="flex items-center gap-1 text-green-600 hover:underline text-sm"
                                >
                                    <BookOpen size={16} /> Kelola
                                </Link>
                                <Link
                                    to={`/admin/edit-novel/${novel.id}`}
                                    className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                                >
                                    <Pencil size={16} /> Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(novel.id)}
                                    className="flex items-center gap-1 text-red-600 hover:underline text-sm"
                                >
                                    <Trash2 size={16} /> Hapus
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NovelList;
