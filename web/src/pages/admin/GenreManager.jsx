import React, { useState } from "react";

const GenreManager = () => {
    const [genres, setGenres] = useState(["Fantasi", "Romantis", "Horor"]);
    const [newGenre, setNewGenre] = useState("");

    const handleAdd = () => {
        if (newGenre.trim() === "") return;
        setGenres((prev) => [...prev, newGenre.trim()]);
        setNewGenre("");
    };

    const handleDelete = (genreToDelete) => {
        setGenres((prev) => prev.filter((g) => g !== genreToDelete));
    };

    return (
        <div className="max-w-xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">Kelola Genre</h1>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    className="border px-3 py-2 rounded w-full"
                    placeholder="Tambah genre baru"
                />
                <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded">
                    Tambah
                </button>
            </div>

            <ul className="space-y-2">
                {genres.map((genre, idx) => (
                    <li key={idx} className="flex justify-between items-center border px-4 py-2 rounded">
                        <span>{genre}</span>
                        <button onClick={() => handleDelete(genre)} className="text-red-600 hover:underline">
                            Hapus
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GenreManager;
