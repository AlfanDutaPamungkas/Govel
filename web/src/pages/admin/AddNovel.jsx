import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { listGenresAPI } from "../../services/genres/genreServices";
import { addNovelAPI } from "../../services/novels/novelServices";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import AlertMessage from "../../components/alert/AlertMessage";

const validationSchema = Yup.object({
  title: Yup.string().required("Judul wajib diisi"),
  author: Yup.string().required("Penulis wajib diisi"),
  synopsis: Yup.string().required("Sinopsis wajib diisi"),
  genre: Yup.array().min(1, "Pilih minimal satu genre"),
});

const AddNovel = () => {
  const navigate = useNavigate();
  const [coverImage, setCoverImage] = useState(null);

  const { data: genres } = useQuery({
    queryFn: listGenresAPI,
    queryKey: ["list-genres"]
  });

  const { mutateAsync, isPending, isError, error, isSuccess } = useMutation({
    mutationFn: addNovelAPI,
    mutationKey: ["add-novel"]
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      author: "",
      synopsis: "",
      genre: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!coverImage) {
        alert("Gambar cover harus diupload.");
        return;
      }

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("author", values.author);
      formData.append("synopsis", values.synopsis);
      formData.append("image", coverImage);
      values.genre.forEach((g) => formData.append("genre_ids", g.value));

      try {
        await mutateAsync(formData);
        navigate("/admin/novels");
      } catch (err) {
        console.error(err);
      }
    }
  });

  const genreOptions = genres?.data?.map((genre) => ({
    value: genre.id,
    label: genre.name
  }));

  return (
    <div className="max-w-xl mx-auto bg-white shadow p-6 rounded">
      <h1 className="text-2xl font-bold mb-4">Tambah Novel</h1>
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {isPending && <AlertMessage type="loading" message="Mengunggah novel..." />}
        {isError && <AlertMessage type="error" message={error?.response?.data?.error || "Gagal menyimpan"} />}
        {isSuccess && <AlertMessage type="success" message="Berhasil tambah novel" />}

        {/* Judul */}
        <div>
          <label className="font-medium block mb-1">Judul</label>
          <input
            type="text"
            name="title"
            {...formik.getFieldProps("title")}
            className="w-full border rounded px-3 py-2"
          />
          {formik.touched.title && formik.errors.title && (
            <span className="text-sm text-red-500">{formik.errors.title}</span>
          )}
        </div>

        {/* Penulis */}
        <div>
          <label className="font-medium block mb-1">Penulis</label>
          <input
            type="text"
            name="author"
            {...formik.getFieldProps("author")}
            className="w-full border rounded px-3 py-2"
          />
          {formik.touched.author && formik.errors.author && (
            <span className="text-sm text-red-500">{formik.errors.author}</span>
          )}
        </div>

        {/* Sinopsis */}
        <div>
          <label className="font-medium block mb-1">Sinopsis</label>
          <textarea
            name="synopsis"
            {...formik.getFieldProps("synopsis")}
            className="w-full border rounded px-3 py-2 h-32 resize-none"
            placeholder="Tuliskan sinopsis singkat novel..."
          />
          {formik.touched.synopsis && formik.errors.synopsis && (
            <span className="text-sm text-red-500">{formik.errors.synopsis}</span>
          )}
        </div>

        {/* Genre */}
        <div>
          <label className="font-medium block mb-1">Genre</label>
          <Select
            isMulti
            name="genre"
            options={genreOptions}
            value={formik.values.genre}
            onChange={(selected) => formik.setFieldValue("genre", selected)}
            placeholder="Pilih genre..."
          />
          {formik.touched.genre && formik.errors.genre && (
            <span className="text-sm text-red-500">{formik.errors.genre}</span>
          )}
        </div>

        {/* Gambar */}
        <div>
          <label className="font-medium block mb-1">Gambar Cover</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files[0])}
            className="w-full border rounded px-3 py-2"
          />
          {!coverImage && (
            <span className="text-sm text-red-500">Gambar wajib diisi</span>
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Tambah Novel
        </button>
      </form>
    </div>
  );
};

export default AddNovel;
