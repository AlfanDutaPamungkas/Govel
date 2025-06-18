import { useParams, Link } from "react-router-dom";
import { dummyNovels } from "../../data/novel";
import PageWrapper from "../../components/PageWrapper";
import Navbar from "../../components/Navbar";
import { useState } from "react";
import { LockClosedIcon } from "@heroicons/react/24/solid";

const NovelDetail = () => {
  const { id } = useParams();
  const novel = dummyNovels.find((n) => n.id === parseInt(id));

  const [coin, setCoin] = useState(10000); // Simulasi koin user
  const [purchasedChapters, setPurchasedChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [showModal, setShowModal] = useState(false);

  if (!novel) {
    return (
      <PageWrapper>
        <Navbar />
        <div className="pt-28 px-6 max-w-3xl mx-auto text-center text-gray-500 italic">
          Novel tidak ditemukan.
        </div>
      </PageWrapper>
    );
  }

  const isChapterUnlocked = (chapterNumber) =>
    purchasedChapters.includes(chapterNumber);

  const handleBuyClick = (chapter) => {
    setSelectedChapter(chapter);
    setShowModal(true);
  };

  const handleConfirmBuy = () => {
    if (selectedChapter) {
      if (coin >= selectedChapter.price) {
        setCoin((prev) => prev - selectedChapter.price);
        setPurchasedChapters((prev) => [...prev, selectedChapter.number]);
        alert("Chapter berhasil dibeli.");
      } else {
        alert("Koin tidak cukup!");
      }
    }
    setShowModal(false);
    setSelectedChapter(null);
  };

  const handleCancelBuy = () => {
    setShowModal(false);
    setSelectedChapter(null);
  };

  return (
    <PageWrapper>
      <Navbar />
      <div className="pt-28 px-6 max-w-5xl mx-auto">
        {/* Info Novel */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-6 items-start">
          <img
            src={novel.coverImage}
            alt={novel.title}
            className="w-40 md:w-52 max-h-80 object-cover rounded-lg shadow mx-auto md:mx-0"
          />

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{novel.title}</h1>
            <p className="text-base text-gray-700 leading-relaxed mb-3">
              Deskripsi singkat novel ini (dummy).
            </p>
            <p className="text-sm text-gray-800 mb-1">
              <span className="font-semibold">Author:</span> {novel.author}
            </p>
            <p className="text-sm text-gray-600 italic">
              <span className="font-semibold">Genre:</span> {novel.genre}
            </p>
            <p className="text-sm mt-2 text-yellow-700 font-semibold">
              Koin Anda: {coin.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Daftar Chapter */}
        <h2 className="text-xl font-semibold mb-3">Chapters</h2>
        <ul className="space-y-3">
          {novel.chapters
            .slice()
            .reverse()
            .map((chapter) => {
              const unlocked =
                !chapter.isPaid || isChapterUnlocked(chapter.number);

              return (
                <li key={chapter.number}>
                  {unlocked ? (
                    <Link
                      to={`/novel/${novel.id}/chapter/${chapter.number}`}
                      className="block bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                    >
                      Chapter {chapter.number} – {chapter.title}
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleBuyClick(chapter)}
                      className="w-full flex justify-between items-center bg-gray-100 px-4 py-2 rounded hover:bg-gray-200 text-gray-700"
                    >
                      <div>
                        Chapter {chapter.number} – {chapter.title}
                        <span className="ml-2 text-sm text-red-500 italic">
                          (Berbayar)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {chapter.price.toLocaleString()} coin
                        </span>
                        <LockClosedIcon className="w-5 h-5 text-gray-500" />
                      </div>
                    </button>
                  )}
                </li>
              );
            })}
        </ul>
      </div>

      {/* Modal Konfirmasi */}
      {showModal && selectedChapter && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Konfirmasi Pembelian</h3>
            <p className="mb-4">
              Apakah Anda ingin membeli{" "}
              <strong>
                Chapter {selectedChapter.number} – {selectedChapter.title}
              </strong>{" "}
              seharga{" "}
              <strong>{selectedChapter.price.toLocaleString()} coin</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelBuy}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmBuy}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                Beli Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default NovelDetail;
