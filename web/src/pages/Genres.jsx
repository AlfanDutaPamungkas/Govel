import React from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import Navbar from "../components/Navbar";
import { dummyNovels } from "../data/novel";

const Genres = () => {
  const navigate = useNavigate();

  const genres = [...new Set(dummyNovels.map((novel) => novel.genre))];

  const handleSelectGenre = (genre) => {
    navigate(`/novel?genre=${encodeURIComponent(genre)}`);
  };

  return (
    <PageWrapper>
      <Navbar />
      <div className="pt-28 px-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Genres</h1>
        <p className="text-center mb-6 text-gray-600">
          Explore various genres of novels.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {genres.map((genre, i) => (
            <button
              key={i}
              onClick={() => handleSelectGenre(genre)}
              className="py-3 px-4 bg-blue-100 hover:bg-blue-200 rounded-lg text-center text-blue-800 font-medium transition"
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Genres;
