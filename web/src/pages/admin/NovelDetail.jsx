// src/pages/admin/NovelDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { dummyNovels } from "../../data/novel";

const NovelDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [novel, setNovel] = useState(null);

    useEffect(() => {
        const found = dummyNovels.find((n) => n.id === parseInt(id));
        if (!found) {
            alert("Novel tidak ditemukan.");
            navigate("/admin/novels");
        } else {
            setNovel(found);
        }
    }, [id]);

    if (!novel) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Detail novel */}
            <div className="flex items-start gap-6">
                <img
                    src={novel.coverImage}
                    alt={novel.title}
                    className="w-32 h-48 object-cover rounded"
                />
                <div>
                    <h1 className="text-2xl font-bold mb-1">{novel.title}</h1>
                    <p className="text-gray-600 mb-1">Penulis: {novel.author}</p>
                    <p className="text-gray-600">Genre: {novel.genre}</p>
                    <div className="mt-4">
                        <Link
                            to={`/admin/edit-novel/${novel.id}`}
                            className="inline-block bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                        >
                            Edit Novel
                        </Link>
                    </div>
                </div>
            </div>

            {/* List chapter */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Chapter</h2>
                    <Link
                        to={`/admin/novels/${novel.id}/add-chapter`}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Tambah Chapter
                    </Link>
                </div>

                {novel.chapters.length === 0 ? (
                    <p className="text-gray-500 italic">Belum ada chapter.</p>
                ) : (
                    <ul className="space-y-4">
                        {novel.chapters.map((chapter) => (
                            <li
                                key={chapter.number}
                                className="border rounded p-4 shadow-sm hover:shadow"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold">
                                            Chapter {chapter.number}: {chapter.title}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Diperbarui: {new Date(chapter.updatedAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/admin/novels/${novel.id}/edit-chapter/${chapter.number}`}
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
        </div>
    );
};

export default NovelDetail;
