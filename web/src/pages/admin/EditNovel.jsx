import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { listGenresAPI } from "../../services/genres/genreServices";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import AlertMessage from "../../components/alert/AlertMessage";
import { detailNovelAPI, editNovelAPI } from "../../services/novels/novelServices";

const validationSchema = Yup.object({
  title: Yup.string().required("Judul wajib diisi"),
  author: Yup.string().required("Penulis wajib diisi"),
  synopsis: Yup.string().required("Sinopsis wajib diisi"),
  genre: Yup.array().min(1, "Pilih minimal satu genre"),
});

const EditNovel = () => {
  const {novelID} = useParams();

  const navigate = useNavigate();

  const { data: genres } = useQuery({
    queryFn: listGenresAPI,
    queryKey: ["list-genres"]
  });

  const { mutateAsync, isPending, isError, error, isSuccess } = useMutation({
    mutationFn: editNovelAPI,
    mutationKey: ["edit-novel"]
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      author: "",
      synopsis: "",
      genre: [],
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
    try {
      await mutateAsync({
        novelID,
        title: values.title,
        author: values.author,
        synopsis: values.synopsis,
        genre_ids: values.genre.map(g => g.value),
      });
      navigate(`/admin/novels/${novelID}`);
    } catch (err) {
      console.error(err);
    }
  }   

  });

  const genreOptions = genres?.data?.map((genre) => ({
    value: genre.id,
    label: genre.name
  }));

  const { data: detail, isLoading: loadingDetail, isError: isDetailError, error: detailError } = useQuery({
    queryKey: ["detail-novel", novelID],
    queryFn: detailNovelAPI,
    enabled: !!novelID,
  });

  
  useEffect(() => {
    if (detail?.data && genres?.data) {
      formik.setValues({
        title: detail.data.title,
        author: detail.data.author,
        synopsis: detail.data.synopsis,
        genre: detail.data.genre.map(g => ({ value: g.id, label: g.name })),
      });
    }
  }, [detail, genres]);

  if (loadingDetail) {
    return <div className="text-center py-10 text-gray-500">Memuat data novel...</div>;
  }

  if (isDetailError || !detail?.data) {
    return (
      <div className="text-center py-10 text-red-500">
        Gagal memuat data novel. {detailError?.response?.data?.error || "Novel tidak ditemukan."}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white shadow p-6 rounded">
      <h1 className="text-2xl font-bold mb-4">Edit Novel</h1>
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

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
};

export default EditNovel;
