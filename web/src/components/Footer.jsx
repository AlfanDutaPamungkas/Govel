import { FaInstagram, FaTwitter, FaFacebookF } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo & Description */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img
              src="/images/book-open.png" // Ganti dengan path logo kamu
              alt="Logo"
              className="w-8 h-8 "
            />
            <span className="text-xl font-bold text-white">GOVEL</span>
          </div>
          <p className="text-sm">
            Discover and read amazing novels from diverse genres. Built with ❤️
            for readers.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Navigation</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/" className="hover:text-white">
                Home
              </a>
            </li>
            <li>
              <a href="/novel" className="hover:text-white">
                Novel
              </a>
            </li>
            <li>
              <a href="/genres" className="hover:text-white">
                Genre
              </a>
            </li>
            <li>
              <a href="/top-up" className="hover:text-white">
                Top Up
              </a>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Follow Us</h3>
          <div className="flex gap-4 text-lg">
            <a href="#" className="hover:text-white" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="#" className="hover:text-white" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="#" className="hover:text-white" aria-label="Facebook">
              <FaFacebookF />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-700 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} GOVEL. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
