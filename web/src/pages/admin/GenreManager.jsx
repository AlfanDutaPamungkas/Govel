import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { addGenreAPI, deleteGenreAPI, listGenresAPI } from "../../services/genres/genreServices";
import AlertMessage from "../../components/alert/AlertMessage";

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Nama genre wajib diisi")
    .min(2, "Minimal 2 karakter"),
});

const GenreManager = () => {
  const queryClient = useQueryClient();

  const { data: genres } = useQuery({
    queryKey: ["list-genres"],
    queryFn: listGenresAPI,
  });

  const mutation = useMutation({
    mutationKey: ["add-genre"],
    mutationFn: addGenreAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list-genres"] });
    },
  });

  const [selectedGenre, setSelectedGenre] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { mutate: deleteGenre, isLoading: isDeleting } = useMutation({
    mutationFn: ({ genreID }) =>
      deleteGenreAPI({ queryKey: ["delete-chapter", genreID] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list-genres"] });
      setShowModal(false);
    },
  });

  const handleDeleteClick = (genreID) => {
    console.log(genreID);
    
    setSelectedGenre(genreID);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedGenre) {
      deleteGenre({ genreID: selectedGenre });
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Kelola Genre</h1>

      <Formik
        initialValues={{ name: "" }}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm, setSubmitting }) => {
          try {
            await mutation.mutateAsync(values);
            resetForm();
          } catch (err) {
            console.error(err);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form className="space-y-2">
            {mutation.isPending && (
              <AlertMessage type="loading" message="Menambahkan genre..." />
            )}
            {mutation.isError && (
              <AlertMessage
                type="error"
                message={mutation.error?.response?.data?.error || "Gagal menambahkan genre"}
              />
            )}
            {mutation.isSuccess && (
              <AlertMessage type="success" message="Genre berhasil ditambahkan" />
            )}

            <div className="flex gap-2 items-start">
              <div className="w-full">
                <Field
                  name="name"
                  placeholder="Tambah genre baru"
                  className="border px-3 py-2 rounded w-full"
                />
                {touched.name && errors.name && (
                  <span className="text-sm text-red-500">{errors.name}</span>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting || mutation.isPending}
                className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
                  isSubmitting || mutation.isPending ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Tambah
              </button>
            </div>
          </Form>
        )}
      </Formik>

      <ul className="space-y-2">
        {genres?.data?.map((genre) => (
          <li
            key={genre?.id}
            className="flex justify-between items-center border px-4 py-2 rounded"
          >
            <span>{genre?.name}</span>
            <button
              onClick={() => handleDeleteClick(genre?.id)}
              className="text-red-600 hover:underline">
                Hapus
            </button>
          </li>
        ))}
      </ul>

      {/* Modal konfirmasi hapus */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-3">Konfirmasi Hapus</h2>
            <p className="text-sm text-gray-600 mb-4">
              Apakah kamu yakin ingin menghapus genre ini? Tindakan ini tidak dapat dibatalkan.
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

export default GenreManager;
