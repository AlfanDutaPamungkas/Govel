import React, { useEffect, useState } from "react";
import { BookOpen, FileText, PlusCircle } from "lucide-react";
import { dummyNovels } from "../../data/novel"; // Ganti nanti dengan fetch dari Supabase
import { Link } from "react-router-dom";

const Dashboard = () => {
    const [novels, setNovels] = useState([]);
    const [totalChapters, setTotalChapters] = useState(0);

    useEffect(() => {
        // Gunakan dummy dulu
        setNovels(dummyNovels);

        // Hitung total chapter dari semua novel
        const total = dummyNovels.reduce((acc, novel) => acc + novel.chapters.length, 0);
        setTotalChapters(total);
    }, []);

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold mb-4">Dashboard Admin</h1>

            {/* Statistik ringkasan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white shadow rounded p-5 flex items-center gap-4">
                    <BookOpen className="text-blue-600" size={32} />
                    <div>
                        <h2 className="text-lg font-semibold">Total Novel</h2>
                        <p className="text-gray-700">{novels.length}</p>
                    </div>
                </div>

                <div className="bg-white shadow rounded p-5 flex items-center gap-4">
                    <FileText className="text-green-600" size={32} />
                    <div>
                        <h2 className="text-lg font-semibold">Total Chapter</h2>
                        <p className="text-gray-700">{totalChapters}</p>
                    </div>
                </div>

                <div className="bg-white shadow rounded p-5 flex items-center gap-4">
                    <PlusCircle className="text-purple-600" size={32} />
                    <div>
                        <h2 className="text-lg font-semibold">Tambah Novel</h2>
                        <Link to="/admin/add-novel" className="text-sm text-blue-600 hover:underline">
                            Klik di sini
                        </Link>
                    </div>
                </div>
            </div>

            {/* Daftar novel terbaru */}
            <div>
                <h2 className="text-lg font-bold mb-3">Novel Terbaru</h2>
                <ul className="space-y-3">
                    {novels.slice(0, 5).map((novel) => (
                        <li
                            key={novel.id}
                            className="bg-white shadow p-4 rounded flex justify-between items-center"
                        >
                            <div>
                                <h3 className="font-semibold">{novel.title}</h3>
                                <p className="text-sm text-gray-600">By {novel.author}</p>
                            </div>
                            <Link
                                to={`/admin/edit-novel/${novel.id}`}
                                className="text-blue-600 hover:underline text-sm"
                            >
                                Kelola
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;
