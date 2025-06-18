import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dummyNovels } from "../../data/novel";

const AddEditChapter = () => {
    const { id, number } = useParams(); // id = novelId, number = chapterNumber (optional)
    const navigate = useNavigate();

    const [novel, setNovel] = useState(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isPaid, setIsPaid] = useState(false);
    const [price, setPrice] = useState("");

    const isEdit = !!number;

    useEffect(() => {
        const foundNovel = dummyNovels.find((n) => n.id === parseInt(id));
        if (!foundNovel) {
            alert("Novel tidak ditemukan.");
            navigate("/admin/novels");
            return;
        }
        setNovel(foundNovel);

        if (isEdit) {
            const existing = foundNovel.chapters.find(
                (ch) => ch.number === parseInt(number)
            );
            if (!existing) {
                alert("Chapter tidak ditemukan.");
                navigate(`/admin/novels/${id}`);
            } else {
                setTitle(existing.title);
                setContent(existing.content);
                setIsPaid(existing.isPaid || false);
                setPrice(existing.price ? existing.price.toString() : "");
            }
        }
    }, [id, number, isEdit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !content) {
            alert("Judul dan isi chapter wajib diisi.");
            return;
        }

        if (isPaid && (!price || isNaN(price) || parseFloat(price) <= 0)) {
            alert("Harga harus diisi dengan angka valid jika chapter berbayar.");
            return;
        }

        const chapterData = {
            title,
            content,
            isPaid,
            price: isPaid ? parseFloat(price) : 0,
        };

        if (isEdit) {
            console.log("Update Chapter:", chapterData);
            alert(`(Dummy) Chapter ${number} berhasil diperbarui`);
        } else {
            console.log("Tambah Chapter Baru:", chapterData);
            alert(`(Dummy) Chapter baru berhasil ditambahkan`);
        }

        navigate(`/admin/novels/${id}`);
    };

    if (!novel) return null;

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">
                {isEdit ? `Edit Chapter ${number}` : "Tambah Chapter Baru"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="font-medium">Judul Chapter</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                <div>
                    <label className="font-medium">Isi Chapter</label>
                    <textarea
                        rows={10}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="isPaid"
                        checked={isPaid}
                        onChange={(e) => setIsPaid(e.target.checked)}
                    />
                    <label htmlFor="isPaid" className="font-medium">
                        Chapter Berbayar
                    </label>
                </div>

                {isPaid && (
                    <div>
                        <label className="font-medium">Harga Chapter (contoh: 5000)</label>
                        <input
                            type="number"
                            min="0"
                            step="100"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                )}

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    {isEdit ? "Update Chapter" : "Tambah Chapter"}
                </button>
            </form>
        </div>
    );
};

export default AddEditChapter;
