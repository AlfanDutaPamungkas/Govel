import React, { useState } from "react";
import PageWrapper from "../components/PageWrapper";
import { Link } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBookmarkAPI, listBookmarksAPI } from "../services/bookmarks/bookmarkServices";

const Bookmark = () => {
  const {data: bookmarks} = useQuery({
    queryKey: ["bookmarks"],
    queryFn: listBookmarksAPI,
  });
  
  const [bookmarkedId, setBookmarkedId] = useState();
  const [modalOpen, setModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const { mutate: deleteBookmark } = useMutation({
    mutationFn: deleteBookmarkAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });

  const openModal = (id) => {
    setBookmarkedId(id)
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (bookmarkedId) {
      deleteBookmark({ bookmarkID: bookmarkedId });
    }
    closeModal();
  };

  return (
    <PageWrapper>
      <div className="pt-24 px-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Bookmarks</h1>
        <p className="text-center text-gray-600 mb-8">
          Daftar novel favoritmu 📚
        </p>

        {bookmarks?.data?.length > 0 ? (
          <div className="space-y-6">
            {bookmarks?.data?.map((bookmark) => (
              <div
                key={bookmark.id}
                className="relative flex flex-col sm:flex-row bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden"
              >
                <img
                  src={bookmark?.novel?.image_url}
                  alt={bookmark?.novel?.title}
                  className="w-full sm:w-40 h-52 object-cover"
                />

                {/* Icon Bookmark dan Hapus */}
                <div className="absolute top-2 right-2 flex space-x-2">
                  <Heart className="text-red-500 fill-red-500 w-5 h-5" />
                  <button
                    onClick={() => openModal(bookmark?.id)}
                    className="text-gray-500 hover:text-red-500 transition"
                    title="Hapus Bookmark"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col justify-between w-full">
                  <div>
                    <h2 className="text-xl font-bold mb-1">{bookmark?.novel?.title}</h2>
                    <p className="text-gray-600 italic mb-1">{bookmark?.novel?.author}</p>
                  </div>
                  <div className="mt-4">
                    <Link
                      to={`/novel/${bookmark?.novel?.id}`}
                      className="inline-block bg-white border border-black text-black text-sm px-4 py-1.5 rounded-lg hover:bg-black hover:text-white transition"
                    >
                      Baca Sekarang
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 italic">
            Belum ada novel yang kamu favoritkan.
          </p>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4">Yakin ingin menghapus?</h2>
            <p className="text-sm text-gray-600 mb-6">
              Novel ini akan dihapus dari bookmark kamu.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-1.5 rounded bg-gray-200 hover:bg-gray-300 text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
              >
                Ya, hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </PageWrapper>
  );
};

export default Bookmark;
