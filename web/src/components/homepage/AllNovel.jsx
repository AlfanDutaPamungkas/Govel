// src/components/homepage/AllNovel.jsx
import React from "react";
import { Link } from "react-router-dom";
import { dummyNovels } from "../../data/novel";

const AllNovel = () => {
    const previewNovels = dummyNovels.slice(0, 4); // Ambil 4 novel pertama

    return (
        <section className="px-4 py-10 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">All Novels</h2>
                <Link
                    to="/novel"
                    className="text-sm text-blue-600 hover:underline"
                >
                    See more →
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {previewNovels.map((novel) => (
                    <Link
                        to={`/novel/${novel.id}`}
                        key={novel.id}
                        className="relative aspect-[2/3] rounded-lg overflow-hidden shadow hover:shadow-lg transition duration-300 group"
                    >
                        <img
                            src={novel.coverImage}
                            alt={novel.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent p-3 flex flex-col justify-end">
                            <h3 className="text-white text-sm font-semibold truncate">{novel.title}</h3>
                            <p className="text-xs text-gray-300">{novel.author}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default AllNovel;
