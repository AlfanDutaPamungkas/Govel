import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { dummyNovels } from "../data/novel";
import PageWrapper from "../components/PageWrapper";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

const NovelPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("q") || "";
  const genreParam = queryParams.get("genre") || "All";

  const [selectedGenre, setSelectedGenre] = useState(genreParam);
  const [filteredNovels, setFilteredNovels] = useState(dummyNovels);

  const genres = ["All", ...new Set(dummyNovels.map((n) => n.genre))];

  // Filter data berdasarkan query dan genre
  useEffect(() => {
    let filtered = dummyNovels;

    if (query.trim() !== "") {
      filtered = filtered.filter((novel) =>
        novel.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (selectedGenre !== "All") {
      filtered = filtered.filter((novel) => novel.genre === selectedGenre);
    }

    setFilteredNovels(filtered);
  }, [query, selectedGenre]);

  // Sinkronisasi URL genre ke dropdown
  useEffect(() => {
    setSelectedGenre(genreParam);
  }, [genreParam]);

  // Saat user ganti genre dari dropdown
  const handleGenreChange = (e) => {
    const newGenre = e.target.value;
    setSelectedGenre(newGenre);

    const newParams = new URLSearchParams(location.search);

    if (newGenre === "All") {
      newParams.delete("genre");
    } else {
      newParams.set("genre", newGenre);
    }

    navigate(`/novel?${newParams.toString()}`);
  };

  // Tombol Clear untuk hapus filter q dan genre
  const handleClearFilter = () => {
    navigate("/novel");
    setSelectedGenre("All");
  };

  // Fungsi highlight keyword pada judul
  const highlightMatch = (text, keyword) => {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      part.toLowerCase() === keyword.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 rounded px-1">
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <PageWrapper>
      <Navbar />
      <div className="p-6 pt-28 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4">
          <h1 className="text-2xl font-bold">All Novels</h1>
          <div className="flex gap-3 items-center">
            <select
              value={selectedGenre}
              onChange={handleGenreChange}
              className="border rounded px-3 py-1 text-sm"
            >
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            {(query || selectedGenre !== "All") && (
              <button
                onClick={handleClearFilter}
                className="text-sm text-red-500 hover:underline"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {filteredNovels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredNovels.map((novel) => (
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
                    {highlightMatch(novel.title, query)}
                  </h2>
                  <p className="text-sm text-gray-300">{novel.author}</p>
                  <p className="text-xs text-gray-400 italic">{novel.genre}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No novels found.</p>
        )}
      </div>
    </PageWrapper>
  );
};

export default NovelPage;
