import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import { addChapterAPI, editChapterAPI, detailChapterAPI } from "../../services/chapters/chapterServices";
import AlertMessage from "../../components/alert/AlertMessage";
import TiptapEditor from "../../components/TiptapEditor";

const validationSchema = Yup.object({
  title: Yup.string().required("Judul wajib diisi"),
  content: Yup.string().required("Isi chapter wajib diisi"),
  chapter_number: Yup.number()
    .typeError("Nomor chapter harus berupa angka")
    .required("Nomor chapter wajib diisi")
    .min(0, "Nomor chapter tidak boleh negatif"),
  is_locked: Yup.boolean(),
  price: Yup.number()
    .min(0, "Harga tidak boleh negatif")
    .when("is_locked", {
      is: true,
      then: (schema) => schema.required("Harga wajib diisi jika berbayar"),
      otherwise: (schema) => schema.notRequired(),
    }),
});

const AddEditChapter = () => {
  const { novelID, slug } = useParams();
  const navigate = useNavigate();
  const isEdit = !!slug;

  const { data: detailChapter, isLoading: loadingDetail } = useQuery({
    queryKey: ["detail-chapter", novelID, slug],
    queryFn: detailChapterAPI,
    enabled: isEdit,
  });

  const mutation = useMutation({
    mutationFn: isEdit ? editChapterAPI : addChapterAPI,
    mutationKey: [isEdit ? "edit-chapter" : "add-chapter"],
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      content: "",
      chapter_number: "",
      is_locked: false,
      price: 0,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const payload = {
        novelID,
        title: values.title,
        content: values.content,
        chapter_number: parseFloat(values.chapter_number),
        is_locked: values.is_locked,
        price: values.is_locked ? values.price : 0,
      };

      if (isEdit) {
        payload.slug = slug;
      }

      try {
        await mutation.mutateAsync(payload);
        navigate(`/admin/novels/${novelID}`);
      } catch (err) {
        console.error(err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (isEdit && detailChapter?.data) {
      const ch = detailChapter.data;
      formik.setValues({
        title: ch.title,
        content: ch.content,
        chapter_number: ch.chapter_number,
        is_locked: ch.is_locked,
        price: ch.price || 0,
      });
    }
  }, [detailChapter]);

  if (isEdit && loadingDetail) {
    return <div className="text-center py-10 text-gray-500">Memuat data chapter...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {isEdit ? "Edit Chapter" : "Tambah Chapter Baru"}
      </h1>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {mutation.isPending && <AlertMessage type="loading" message="Menyimpan chapter..." />}
        {mutation.isError && (
          <AlertMessage
            type="error"
            message={mutation.error?.response?.data?.error || "Gagal menyimpan"}
          />
        )}
        {mutation.isSuccess && (
          <AlertMessage type="success" message="Chapter berhasil disimpan" />
        )}

        <div>
          <label className="font-medium">Judul Chapter</label>
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

        <div>
          <label className="font-medium">Isi Chapter</label>
          <TiptapEditor
            value={formik.values.content}
            onChange={(val) => formik.setFieldValue("content", val)}
          />
          {formik.touched.content && formik.errors.content && (
            <span className="text-sm text-red-500">{formik.errors.content}</span>
          )}
        </div>

        <div>
          <label className="font-medium">Nomor Chapter</label>
          <input
            type="number"
            step="0.1"
            name="chapter_number"
            {...formik.getFieldProps("chapter_number")}
            className="w-full border rounded px-3 py-2"
          />
          {formik.touched.chapter_number && formik.errors.chapter_number && (
            <span className="text-sm text-red-500">{formik.errors.chapter_number}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_locked"
            name="is_locked"
            checked={formik.values.is_locked}
            onChange={(e) => formik.setFieldValue("is_locked", e.target.checked)}
          />
          <label htmlFor="is_locked" className="font-medium">
            Chapter Berbayar
          </label>
        </div>
        {formik.values.is_locked && (
          <div>
            <label className="font-medium">Harga Chapter</label>
            <input
              type="number"
              min="0"
              name="price"
              {...formik.getFieldProps("price")}
              className="w-full border rounded px-3 py-2"
            />
            {formik.touched.price && formik.errors.price && (
              <span className="text-sm text-red-500">{formik.errors.price}</span>
            )}
          </div>
        )}

        <button
            type="submit"
            disabled={formik.isSubmitting || mutation.isPending}
            className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
                (formik.isSubmitting || mutation.isPending) ? "opacity-50 cursor-not-allowed" : ""
            }`}
            >
            {isEdit ? "Update Chapter" : "Tambah Chapter"}
        </button>
      </form>
    </div>
  );
};

export default AddEditChapter;
