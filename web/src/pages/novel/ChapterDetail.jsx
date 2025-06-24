import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageWrapper from "../../components/PageWrapper";
import { detailChapterAPI, unlockChapterAPI } from "../../services/chapters/chapterServices";
import AlertMessage from "../../components/alert/AlertMessage";

const ChapterDetail = () => {
  const { novelID, slug } = useParams();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const {
    data: chapter,
    error,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["detail-chapter", novelID, slug],
    queryFn: detailChapterAPI,
    suspense: false,
    retry: false,
  });

  const { mutate: unlockChapter, isPending: isUnlocking } = useMutation({
    mutationFn: unlockChapterAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["detail-chapter", novelID, slug] });
      setShowModal(false);
      setAlert({ type: "success", message: "Chapter berhasil dibuka!" });
    },
    onError: (error) => {
      const status = error?.response?.status;
      if (status === 409) {
        setAlert({ type: "error", message: "Chapter sudah dibeli sebelumnya." });
      } else if (status === 402) {
        setAlert({ type: "error", message: "Koin kamu tidak cukup." });
      } else {
        setAlert({ type: "error", message: "Terjadi kesalahan saat membeli chapter." });
      }
    },
  });

  const handleBuyClick = () => {
    setAlert({ type: "", message: "" });
    setShowModal(true);
  };

  const handleConfirmBuy = () => {
    unlockChapter({ queryKey: ["unlock", novelID, slug] });
  };

  if (isError) {
    if (error?.response?.status === 404) {
      return (
        <PageWrapper>
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-red-500 text-center">Chapter tidak ditemukan.</p>
          </div>
        </PageWrapper>
      );
    }

    if (error?.response?.status === 402) {
      return (
        <PageWrapper>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Chapter Terkunci 🔒</h2>
              <p className="mb-4">Chapter ini perlu dibeli untuk dibaca.</p>
              <button
                onClick={handleBuyClick}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Beli Chapter
              </button>
            </div>

            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur">
                <div className="bg-white p-6 rounded shadow-md max-w-md w-full text-center">
                  <h2 className="text-xl font-semibold mb-2">Konfirmasi Pembelian</h2>

                  {alert.message && (
                    <div className="mb-3">
                      <AlertMessage type={alert.type} message={alert.message} />
                    </div>
                  )}

                  <p className="mb-4">Beli dan buka chapter ini sekarang?</p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleConfirmBuy}
                      disabled={isUnlocking}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {isUnlocking ? "Memproses..." : "Beli & Buka"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </PageWrapper>
      );
    }

    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-500 text-center">Terjadi kesalahan saat memuat chapter.</p>
        </div>
      </PageWrapper>
    );
  }

  if (isLoading) {
    return (
      <PageWrapper>
        <p className="mt-32 text-center text-gray-500">Loading...</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-4 py-28">
        <Link
          to={`/novel/${chapter?.data?.novel_id}`}
          className="text-blue-500 text-sm underline mb-4 inline-block"
        >
          ← Back
        </Link>

        {alert.message && (
          <div className="mb-4">
            <AlertMessage type={alert.type} message={alert.message} />
          </div>
        )}

        <h1 className="text-3xl font-bold mb-1">{chapter?.data?.title}</h1>
        <p className="text-gray-600 text-sm mb-6">
          Chapter {chapter?.data?.chapter_number}
        </p>

        <div 
          className="prose prose-base text-base leading-relaxed whitespace-pre-line mb-8" 
          dangerouslySetInnerHTML={{ __html: chapter?.data?.content }} />

        <div className="flex justify-between">
          {chapter?.data?.prev_slug ? (
            <Link
              to={`/novel/${chapter?.data?.novel_id}/chapter/${chapter?.data?.prev_slug}`}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              ← Previous
            </Link>
          ) : (
            <span className="px-4 py-2 bg-gray-200 text-gray-400 rounded cursor-not-allowed">
              ← Previous
            </span>
          )}

          {chapter?.data?.next_slug ? (
            <Link
              to={`/novel/${chapter?.data?.novel_id}/chapter/${chapter?.data?.next_slug}`}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Next →
            </Link>
          ) : (
            <span className="px-4 py-2 bg-gray-200 text-gray-400 rounded cursor-not-allowed">
              Next →
            </span>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default ChapterDetail;
