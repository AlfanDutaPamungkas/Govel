import React, { useEffect, useState } from "react";
import { BookOpen, FileText, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listNovelsAPI } from "../../services/novels/novelServices";

const Dashboard = () => {
    const {data: novels} = useQuery({
        queryFn: listNovelsAPI,
        queryKey: ["list-updated-novels", "sort_by", "updated_at"]
    });

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold mb-4">Dashboard Admin</h1>

            {/* Statistik ringkasan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    {novels?.data?.map((novel) => (
                        <li
                            key={novel?.id}
                            className="bg-white shadow p-4 rounded flex justify-between items-center"
                        >
                            <div>
                                <h3 className="font-semibold">{novel?.title}</h3>
                                <p className="text-sm text-gray-600">By {novel?.author}</p>
                            </div>
                            <Link
                                to={`/admin/edit-novel/${novel?.id}`}
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
