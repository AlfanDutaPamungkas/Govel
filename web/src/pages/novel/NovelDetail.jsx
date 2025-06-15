import { useParams, Link } from "react-router-dom";
import { dummyNovels } from "../../data/novel";
import PageWrapper from "../../components/PageWrapper";
import Navbar from "../../components/Navbar";

const NovelDetail = () => {
  const { id } = useParams();
  const novel = dummyNovels.find((n) => n.id === parseInt(id));

  if (!novel) {
    return (
      <PageWrapper>
        <Navbar />
        <div className="pt-28 px-6 max-w-3xl mx-auto text-center text-gray-500 italic">
          Novel not found.
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="pt-28 px-6 max-w-5xl mx-auto">
        {/* Container Gambar + Info */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-6 items-start">
          {/* Gambar */}
          <img
            src={novel.coverImage}
            alt={novel.title}
            className="w-40 md:w-52 max-h-80 object-cover rounded-lg shadow mx-auto md:mx-0"
          />

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{novel.title}</h1>

            {/* Deskripsi */}
            <p className="text-base text-gray-700 leading-relaxed mb-3">
              This is a brief description or synopsis of{" "}
              <strong>{novel.title}</strong>. You can replace this with a real
              summary once your backend is ready.
            </p>

            {/* Author & Genre */}
            <p className="text-sm text-gray-800 mb-1">
              <span className="font-semibold">Author:</span> {novel.author}
            </p>
            <p className="text-sm text-gray-600 italic">
              <span className="font-semibold">Genre:</span> {novel.genre}
            </p>
          </div>
        </div>

        {/* Chapter List */}
        <h2 className="text-xl font-semibold mb-3">Chapters</h2>
        {novel.chapters && novel.chapters.length > 0 ? (
          <ul className="space-y-3">
            {novel.chapters
              .slice()
              .reverse()
              .map((chapter) => (
                <li key={chapter.number}>
                  <Link
                    to={`/novel/${novel.id}/chapter/${chapter.number}`}
                    className="block bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                  >
                    Chapter {chapter.number} – {chapter.title}
                  </Link>
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No chapters available.</p>
        )}
      </div>
    </PageWrapper>
  );
};

export default NovelDetail;
