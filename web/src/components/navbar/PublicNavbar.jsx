import { BookOpen, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const PublicNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-6xl bg-white border rounded-2xl shadow-md px-4 py-4 md:py-2">
      <div className="flex items-center justify-between">
        {/* Logo & Menu */}
        <div className="flex items-center gap-6">
          <Link to="/">
            <BookOpen className="w-6 h-6" />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/novel" className="text-sm font-medium hover:text-black">
              Novel
            </Link>
            <Link to="/genres" className="text-sm font-medium hover:text-black">
              Genres
            </Link>
            <Link to="/top-up" className="text-sm font-medium hover:text-black">
              Top-up
            </Link>
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium border border-black px-3 py-1 rounded-full hover:bg-black hover:text-white transition"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-sm font-medium bg-black text-white px-3 py-1 rounded-full hover:bg-gray-800 transition"
          >
            Sign Up
          </Link>

          {/* Menu (Mobile) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-black focus:outline-none"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={`flex flex-col gap-3 transition-all duration-300 ease-in-out overflow-hidden md:hidden ${
          isOpen ? "max-h-[500px] mt-4 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <Link to="/" onClick={() => setIsOpen(false)}>
          Home
        </Link>
        <Link to="/novel" onClick={() => setIsOpen(false)}>
          Novel
        </Link>
        <Link to="/genres" onClick={() => setIsOpen(false)}>
          Genres
        </Link>
        <Link to="/top-up" onClick={() => setIsOpen(false)}>
          Top-up
        </Link>
        <Link to="/signin" onClick={() => setIsOpen(false)}>
          Sign In
        </Link>
        <Link to="/signup" onClick={() => setIsOpen(false)}>
          Sign Up
        </Link>
      </div>
    </nav>
  );
};

export default PublicNavbar;
