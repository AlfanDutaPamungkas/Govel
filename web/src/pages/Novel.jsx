import React, { useState } from "react";
import { Link } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import Navbar from "../components/Navbar";
import { dummyNovels } from "../data/novel"; // Ganti nanti dengan data dari BE

const NovelPage = () => {
  const [selectedGenre, setSelectedGenre] = useState("All");

  const genres = ["All", ...new Set(dummyNovels.map((n) => n.genre))];
  const novelsToDisplay = dummyNovels; // sementara static, nanti dari BE

  return (
    <PageWrapper>
      <div className="p-6 pt-28 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold">All Novels</h1>

          {/* Dropdown Genre */}
          <div>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="border border-gray-300 bg-white rounded-lg px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid Novels */}
        {novelsToDisplay.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {novelsToDisplay.map((novel) => (
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
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent p-4 flex flex-col justify-end">
                  <h2 className="text-white font-semibold text-lg">
                    {novel.title}
                  </h2>
                  <p className="text-sm text-gray-300">{novel.author}</p>
                  <p className="text-xs text-gray-400 italic">{novel.genre}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 italic">No novels found.</p>
        )}
      </div>
    </PageWrapper>
  );
};

export default NovelPage;
