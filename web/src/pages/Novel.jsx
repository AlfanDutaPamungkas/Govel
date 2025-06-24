import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import { listGenresAPI } from "../services/genres/genreServices";
import { listNovelsAPI, listNovelsFromGenreAPI } from "../services/novels/novelServices";
import { useQuery } from "@tanstack/react-query";

const NovelPage = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q");
  const genreQuery = searchParams.get("genre");

  const [selectedGenre, setSelectedGenre] = useState("All");

  useEffect(() => {
    if (genreQuery) setSelectedGenre(genreQuery);
  }, [genreQuery]);

  const { data: genres } = useQuery({
    queryKey: ["list-genres"],
    queryFn: listGenresAPI,
  });

  const { data: novels } = useQuery({
    queryKey: genreQuery
      ? ["novels-by-genre", genreQuery]
      : searchQuery
      ? ["list-novels", "search", searchQuery]
      : ["list-novels"],
    queryFn: genreQuery ? listNovelsFromGenreAPI : listNovelsAPI,
  });

  const handleGenreChange = (e) => {
    const genreID = e.target.value;
    setSelectedGenre(genreID);

    if (genreID === "All") {
      navigate("/novel"); // Hapus query kalau All
    } else {
      navigate(`/novel?genre=${genreID}`); // Navigasi dengan query genre
    }
  };

  return (
    <PageWrapper>
      <div className="p-6 pt-28 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold">All Novels</h1>

          {/* Dropdown Genre */}
          <div>
            <select
              value={selectedGenre}
              onChange={handleGenreChange}
              className="border border-gray-300 bg-white rounded-lg px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All</option>
              {genres?.data.map((genre) => (
                <option key={genre?.id} value={genre?.id}>
                  {genre?.name.charAt(0).toUpperCase() + genre?.name.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid Novels */}
        {novels?.data?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {novels.data.map((novel) => (
              <Link
                to={`/novel/${novel.id}`}
                key={novel.id}
                className="relative aspect-[2/3] rounded-lg overflow-hidden shadow hover:shadow-lg transition duration-300 group"
              >
                <img
                  src={novel.image_url}
                  alt={novel.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent p-4 flex flex-col justify-end">
                  <h2 className="text-white font-semibold text-lg">{novel.title}</h2>
                  <p className="text-sm text-gray-300">{novel.author}</p>
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
