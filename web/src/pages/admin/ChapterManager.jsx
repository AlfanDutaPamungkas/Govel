// src/pages/admin/ChapterManager.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { dummyNovels } from "../../data/novel"; // Ganti nanti dengan fetch dari Supabase

const ChapterManager = () => {
    const { id } = useParams(); // id novel
    const navigate = useNavigate();
    const [novel, setNovel] = useState(null);
    const [chapters, setChapters] = useState([]);

    useEffect(() => {
        const found = dummyNovels.find((n) => n.id === parseInt(id));
        if (!found) {
            alert("Novel tidak ditemukan");
            navigate("/admin/novels");
        } else {
            setNovel(found);
            setChapters(found.chapters);
        }
    }, [id]);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">
                    Chapter dari: <span className="text-blue-600">{novel?.title}</span>
                </h1>
                <Link
                    to={`/admin/novels/${id}/add-chapter`}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Tambah Chapter
                </Link>
            </div>

            {chapters.length === 0 ? (
                <p className="text-gray-500 italic">Belum ada chapter.</p>
            ) : (
                <ul className="space-y-4">
                    {chapters.map((chapter) => (
                        <li
                            key={chapter.number}
                            className="border rounded p-4 shadow-sm hover:shadow"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="font-semibold">
                                        Chapter {chapter.number}: {chapter.title}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        Diperbarui: {new Date(chapter.updatedAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        to={`/admin/novels/${id}/edit-chapter/${chapter.number}`}
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() =>
                                            alert(`(Dummy) Hapus chapter ${chapter.number}`)
                                        }
                                        className="text-red-500 hover:underline text-sm"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ChapterManager;
