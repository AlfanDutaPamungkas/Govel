import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { dummyNovels } from "../../data/novel";
import PageWrapper from "../../components/PageWrapper";
import Navbar from "../../components/Navbar";

const ChapterDetail = () => {
  const { novelId, chapterNumber } = useParams();
  const navigate = useNavigate();

  const novel = dummyNovels.find((n) => n.id === parseInt(novelId));

  if (!novel) return <p className="mt-32 text-center">Novel not found.</p>;

  const chapterIndex = novel.chapters.findIndex(
    (c) => c.number === parseInt(chapterNumber)
  );

  if (chapterIndex === -1)
    return <p className="mt-32 text-center">Chapter not found.</p>;

  const chapter = novel.chapters[chapterIndex];

  const goToChapter = (direction) => {
    const newIndex = direction === "next" ? chapterIndex + 1 : chapterIndex - 1;
    const nextChapter = novel.chapters[newIndex];
    if (nextChapter) {
      navigate(`/novel/${novel.id}/chapter/${nextChapter.number}`);
    }
  };

  // ✅ Scroll ke atas setiap ganti chapter
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [chapterIndex]);

  return (
    <PageWrapper>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-28">
        <Link
          to={`/novel/${novel.id}`}
          className="text-blue-500 text-sm underline mb-4 inline-block"
        >
          ← Back to "{novel.title}"
        </Link>

        <h1 className="text-3xl font-bold mb-1">{chapter.title}</h1>
        <p className="text-gray-600 text-sm mb-6">
          by {novel.author} · Chapter {chapter.number}
        </p>

        <div className="text-base leading-relaxed whitespace-pre-line mb-8">
          {chapter.content}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => goToChapter("prev")}
            disabled={chapterIndex === 0}
            className={`px-4 py-2 rounded ${
              chapterIndex === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            ← Previous
          </button>

          <button
            onClick={() => goToChapter("next")}
            disabled={chapterIndex === novel.chapters.length - 1}
            className={`px-4 py-2 rounded ${
              chapterIndex === novel.chapters.length - 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Next →
          </button>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ChapterDetail;
