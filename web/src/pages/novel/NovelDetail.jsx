import { useParams, Link } from "react-router-dom";
import PageWrapper from "../../components/PageWrapper";
import { useState } from "react";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { detailNovelAPI } from "../../services/novels/novelServices";
import { checkAdminAPI, profileAPI } from "../../services/users/userServices";
import { addBookmarkAPI } from "../../services/bookmarks/bookmarkServices";
import { unlockChapterAPI } from "../../services/chapters/chapterServices";
import AlertMessage from "../../components/alert/AlertMessage";

const NovelDetail = () => {
  const { novelID } = useParams();
  const queryClient = useQueryClient();
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const { data: checkAdmin } = useQuery({
    queryKey: ["admin-check"],
    queryFn: checkAdminAPI,
  });

  const isAdmin = checkAdmin?.data == "ok" ? true : false;
  
  const { data: novel } = useQuery({
    queryFn: detailNovelAPI,
    queryKey: ["detail-novel", novelID],
  });

  const { data: profile } = useQuery({
    queryFn: profileAPI,
    queryKey: ["user-profile"],
  });

  const { mutate: bookmarkNovel, isPending } = useMutation({
    mutationFn: addBookmarkAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["detail-novel", novelID] });
    },
  });

  const { mutate: unlockChapter, isPending: isUnlocking } = useMutation({
    mutationFn: unlockChapterAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["detail-novel", novelID] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      setAlert({ type: "success", message: "Chapter berhasil dibeli!" });
      setShowModal(false); // modal ditutup setelah sukses
      setSelectedChapter(null);
    },
    onError: (error) => {
      const status = error?.response?.status;
      if (status === 409) {
        setAlert({ type: "error", message: "Chapter sudah dibeli sebelumnya." });
      } else if (status === 402) {
        setAlert({ type: "error", message: "Koin kamu tidak cukup." });
      } else {
        setAlert({ type: "error", message: "Terjadi kesalahan. Silakan coba lagi." });
      }
    },
  });

  const handleBuyClick = (chapter) => {
    setAlert({ type: "", message: "" });
    setSelectedChapter(chapter);
    setShowModal(true);
  };

  const handleConfirmBuy = () => {
    if (selectedChapter) {
      unlockChapter({
        queryKey: ["unlock", novelID, selectedChapter.slug],
        chapter: selectedChapter,
      });
    }
  };

  const handleCancelBuy = () => {
    setAlert({ type: "", message: "" });
    setShowModal(false);
    setSelectedChapter(null);
  };

  if (!novel) {
    return (
      <PageWrapper>
        <div className="pt-28 px-6 max-w-3xl mx-auto text-center text-gray-500 italic">
          Novel tidak ditemukan.
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="pt-28 px-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-6 items-start">
          <img
            src={novel?.data.image_url}
            alt={novel?.data.title}
            className="w-40 md:w-52 max-h-80 object-cover rounded-lg shadow mx-auto md:mx-0"
          />

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{novel?.data.title}</h1>
            <p className="text-base text-gray-700 leading-relaxed mb-3">{novel?.data.synopsis}</p>
            <p className="text-sm text-gray-800 mb-1">
              <span className="font-semibold">Author:</span> {novel?.data.author}
            </p>
            <p className="text-sm text-gray-600 italic">
              <span className="font-semibold">Genre:</span> {novel?.data?.genre.map(g => g.name).join(", ")}
            </p>
            <p className="text-sm mt-2 text-yellow-700 font-semibold">
              Koin Anda: {profile?.data?.coin?.toLocaleString()}
            </p>
          </div>
        </div>

        <button
          onClick={() => bookmarkNovel({ novelID })}
          disabled={isPending}
          className={`inline-block px-4 py-2 rounded font-medium transition-colors ${novel?.data?.is_bookmark ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-800 hover:bg-gray-300"} ${isPending && "opacity-50 cursor-not-allowed"}`}
        >
          {novel?.data?.is_bookmark ? "★ Bookmarked" : "☆ Tambah ke Bookmark"}
        </button>

        <h2 className="text-xl font-semibold mb-3">Chapters</h2>
        {novel?.data?.chapters?.length > 0 ? (
          <ul className="space-y-3">
            {novel?.data?.chapters.map((chapter) => {
              const unlocked = !chapter?.is_locked || chapter?.is_paid || isAdmin;
              return (
                <li key={chapter?.id}>
                  {unlocked ? (
                    <Link
                      to={`/novel/${novel?.data?.id}/chapter/${chapter?.slug}`}
                      className={`block px-4 py-2 rounded hover:bg-gray-800 bg-black ${chapter?.is_read ? "text-gray-500" : "text-white"}`}
                    >
                      <div className="flex justify-between items-center">
                        <span>
                          Chapter {chapter?.chapter_number} – {chapter?.title}
                        </span>
                        {chapter?.is_read && (
                          <span className="text-xs text-gray-300 italic ml-4 whitespace-nowrap">
                            ✔ Dibaca
                          </span>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleBuyClick(chapter)}
                      className="w-full flex justify-between items-center bg-gray-100 px-4 py-2 rounded hover:bg-gray-200 text-gray-700"
                    >
                      <div>
                        Chapter {chapter?.chapter_number} – {chapter?.title}
                        <span className="ml-2 text-sm text-red-500 italic">(Berbayar)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{chapter?.price?.toLocaleString()} coin</span>
                        <LockClosedIcon className="w-5 h-5 text-gray-500" />
                      </div>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-500 italic">Belum ada chapter yang tersedia.</p>
        )}
      </div>

      {showModal && selectedChapter && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Konfirmasi Pembelian</h3>
            
            {alert.message && (
              <div className="mb-3">
                <AlertMessage type={alert.type} message={alert.message} />
              </div>
            )}

            <p className="mb-4">
              Apakah Anda ingin membeli{" "}
              <strong>Chapter {selectedChapter.number} – {selectedChapter.title}</strong>{" "}
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
                disabled={isUnlocking}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {isUnlocking ? "Memproses..." : "Beli Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default NovelDetail;
