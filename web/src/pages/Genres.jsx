import React from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import { listGenresAPI } from "../services/genres/genreServices";
import { useQuery } from "@tanstack/react-query";

const Genres = () => {
  const navigate = useNavigate();

  const {data: genres} = useQuery({
    queryFn: listGenresAPI,
    queryKey: ["list-genres"]
  });

  const handleSelectGenre = (genre) => {
    navigate(`/novel?genre=${genre}`);
  };

  return (
    <PageWrapper>
      <div className="pt-28 px-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Genres</h1>
        <p className="text-center mb-6 text-gray-600">
          Explore various genres of novels.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {genres?.data.map((genre) => (
            <button
              key={genre?.id}
              onClick={() => handleSelectGenre(genre?.id)}
              className="py-3 px-4 bg-blue-100 hover:bg-blue-200 rounded-lg text-center text-blue-800 font-medium transition"
            >
              {genre?.name?.charAt(0).toUpperCase() + genre?.name?.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Genres;
