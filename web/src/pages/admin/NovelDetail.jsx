import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { detailNovelAPI } from "../../services/novels/novelServices";
import { deleteChapterAPI } from "../../services/chapters/chapterServices";
import { Pencil } from "lucide-react";

const NovelDetail = () => {
  const { novelID } = useParams();
  const queryClient = useQueryClient();

  const { data: novel } = useQuery({
    queryKey: ["detail-novel", novelID],
    queryFn: detailNovelAPI,
  });

  const novelData = novel?.data;

  const [selectedChapter, setSelectedChapter] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { mutate: deleteChapter, isLoading: isDeleting } = useMutation({
    mutationFn: ({ novelID, slug }) =>
      deleteChapterAPI({ queryKey: ["delete-chapter", novelID, slug] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["detail-novel", novelID] });
      setShowModal(false);
    },
  });

  const handleDeleteClick = (slug) => {
    setSelectedChapter(slug);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedChapter) {
      deleteChapter({ novelID, slug: selectedChapter });
    }
  };

  if (!novelData) {
    return (
      <div className="pt-28 px-6 max-w-3xl mx-auto text-center text-gray-500 italic">
        Novel tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Detail novel */}
      <div className="flex flex-col md:flex-row items-start gap-6">
        <div className="relative w-full md:w-1/3">
          <img
            src={novelData.image_url}
            alt={novelData.title}
            className="w-full aspect-[2/3] object-cover rounded max-h-[600px]"
          />
          <Link
            to={`/admin/edit-novel/${novelData.id}/image`}
            className="absolute bottom-2 right-2 bg-white border border-black text-black p-1 rounded-full hover:bg-black hover:text-white transition"
          >
            <Pencil size={16} />
          </Link>
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-1">{novelData.title}</h1>
          <p className="text-gray-600 mb-1">Penulis: {novelData.author}</p>
          <p className="text-gray-600 mb-4">
            Genre: {novelData.genre.map((g) => g.name).join(", ")}
          </p>
          <div className="text-gray-700 whitespace-pre-line">
            <span className="font-semibold block mb-1">Sinopsis:</span>
            <p className="text-justify leading-relaxed">{novelData.synopsis}</p>
          </div>
          <div className="mt-4">
            <Link
              to={`/admin/edit-novel/${novelData.id}`}
              className="inline-block bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Edit Novel
            </Link>
          </div>
        </div>
      </div>

      {/* List chapter */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Chapter</h2>
          <Link
            to={`/admin/novels/${novelData.id}/add-chapter`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Tambah Chapter
          </Link>
        </div>

        {novelData?.chapters?.length === 0 ? (
          <p className="text-gray-500 italic">Belum ada chapter.</p>
        ) : (
          <ul className="space-y-4">
            {novelData?.chapters?.map((chapter) => (
              <li
                key={chapter.id}
                className="border rounded p-4 shadow-sm hover:shadow"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">
                      Chapter {chapter.chapter_number}: {chapter.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Diperbarui: {new Date(chapter.updated_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/novels/${novelData.id}/edit-chapter/${chapter.slug}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(chapter.slug)}
                      className="text-red-500 hover:underline text-sm"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal konfirmasi hapus */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-3">Konfirmasi Hapus</h2>
            <p className="text-sm text-gray-600 mb-4">
              Apakah kamu yakin ingin menghapus chapter ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 text-sm"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm disabled:opacity-50"
              >
                {isDeleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NovelDetail;
