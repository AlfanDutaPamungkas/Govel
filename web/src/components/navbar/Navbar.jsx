import { BookOpen, Search, User, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listNovelsAPI } from "../../services/novels/novelServices";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { data: searchResult } = useQuery({
    queryKey: ["list-novels", "search", searchTerm],
    queryFn: listNovelsAPI,
    enabled: searchTerm.trim().length > 0,
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchEnter = (e) => {
    if (e.key === "Enter" && searchTerm.trim() !== "") {
      navigate(`/novel?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (novel) => {
    navigate(`/novel/${novel.id}`);
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-6xl bg-white border rounded-2xl shadow-md px-4 py-4 md:py-2">
      <div className="flex items-center justify-between">
        {/* Logo + Links */}
        <div className="flex items-center gap-6">
          <Link to="/">
            <BookOpen className="w-6 h-6" />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/novel" className="text-sm font-medium hover:text-black">Novel</Link>
            <Link to="/genres" className="text-sm font-medium hover:text-black">Genres</Link>
            <Link to="/top-up" className="text-sm font-medium hover:text-black">Top-up</Link>
            <Link to="/bookmarks" className="text-sm font-medium hover:text-black">Bookmarks</Link>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Search - Desktop */}
          <div className="relative hidden sm:flex items-center bg-black rounded-full px-3 py-1">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleSearchEnter}
              className="bg-black text-white placeholder-white text-sm px-2 py-1 focus:outline-none w-24 md:w-36"
            />
            <Search className="text-white w-4 h-4 ml-2" />
            {searchResult?.data?.length > 0 && (
              <ul className="absolute top-full left-0 mt-1 bg-white w-full rounded-md shadow z-10 text-black">
                {searchResult.data.map((novel) => (
                  <li
                    key={novel.id}
                    onClick={() => handleSuggestionClick(novel)}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {novel.title}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Profile - Desktop */}
          <Link to="/profile" className="hidden md:block">
            <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </Link>

          {/* Burger Menu - Mobile */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-black focus:outline-none"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div className={`flex flex-col gap-3 transition-all duration-300 ease-in-out overflow-hidden md:hidden ${
        isOpen ? "max-h-[500px] mt-4 opacity-100" : "max-h-0 opacity-0"
      }`}>
        <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
        <Link to="/genres" onClick={() => setIsOpen(false)}>Genres</Link>
        <Link to="/top-up" onClick={() => setIsOpen(false)}>Top-up</Link>
        <Link to="/bookmarks" onClick={() => setIsOpen(false)}>Bookmarks</Link>
        <Link to="/profile" onClick={() => setIsOpen(false)}>Profile</Link>

        {/* Search - Mobile */}
        <div className="relative flex items-center bg-black rounded-full px-3 py-1">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleSearchEnter}
            className="bg-black text-white placeholder-white text-sm px-2 py-1 focus:outline-none w-full"
          />
          <Search className="text-white w-4 h-4 ml-2" />
          {searchResult?.data?.length > 0 && (
            <ul className="absolute top-full mt-1 left-0 bg-white w-full rounded shadow z-10 text-black">
              {searchResult.data.map((novel) => (
                <li
                  key={novel.id}
                  onClick={() => handleSuggestionClick(novel)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  {novel.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
