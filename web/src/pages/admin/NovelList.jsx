import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, BookOpen } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listNovelsAPI, deleteNovelAPI } from "../../services/novels/novelServices";

const NovelList = () => {
  const queryClient = useQueryClient();
  const { data: novels } = useQuery({
    queryKey: ["list-novels"],
    queryFn: listNovelsAPI,
  });

  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { mutate: deleteNovel, isLoading } = useMutation({
    mutationFn: ({ novelID }) => deleteNovelAPI({ queryKey: ["delete-novel", novelID] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list-novels"] });
      setShowModal(false);
    },
  });

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedId) {
      deleteNovel({ novelID: selectedId });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daftar Novel</h1>
        <Link
          to="/admin/add-novel"
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          Tambah Novel
        </Link>
      </div>

      {novels?.data?.length === 0 ? (
        <p className="text-gray-500 italic">Belum ada novel.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {novels?.data?.map((novel) => (
            <div
              key={novel?.id}
              className="bg-white rounded shadow p-4 flex flex-col"
            >
              <img
                src={novel?.image_url}
                alt={novel?.title}
                className="w-full h-48 object-cover rounded mb-3"
              />
              <h2 className="font-semibold text-lg">{novel?.title}</h2>
              <p className="text-sm text-gray-600 mb-1">By: {novel?.author}</p>
              <div className="mt-auto flex gap-2 flex-wrap">
                <Link
                  to={`/admin/novels/${novel?.id}`}
                  className="flex items-center gap-1 text-green-600 hover:underline text-sm"
                >
                  <BookOpen size={16} /> Kelola
                </Link>
                <Link
                  to={`/admin/edit-novel/${novel?.id}`}
                  className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                >
                  <Pencil size={16} /> Edit
                </Link>
                <button
                  onClick={() => handleDeleteClick(novel?.id)}
                  className="flex items-center gap-1 text-red-600 hover:underline text-sm"
                >
                  <Trash2 size={16} /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Konfirmasi */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-3">Konfirmasi Hapus</h2>
            <p className="text-sm text-gray-600 mb-4">
                Apakah kamu yakin ingin menghapus novel ini? Tindakan ini tidak dapat dibatalkan.
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
                    disabled={isLoading}
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm disabled:opacity-50"
                >
                    {isLoading ? "Menghapus..." : "Hapus"}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NovelList;
