import React, { useEffect, useRef } from "react";
import { dummyNovels } from "../../data/novel";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listNovelsAPI } from "../../services/novels/novelServices";

const RecentlyUpdate = () => {
  const containerRef = useRef(null);

  const {data: updatedNovels} = useQuery({
    queryFn: listNovelsAPI,
    queryKey: ["list-updated-novels", "sort_by", "updated_at"]
  }); 

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.shiftKey) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div className="pt-24 px-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Update!</h1>

      <div
        ref={containerRef}
        className="flex gap-4 pb-4 overflow-x-auto scroll-smooth scroll-container"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>
          {`
            .scroll-container::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>

        {updatedNovels?.data?.map((novel) => {

          return (
            <Link
              to={`/novel/${novel.id}`}
              key={novel.id}
              className="relative min-w-[180px] sm:min-w-[200px] md:min-w-[250px] h-[280px] sm:h-[320px] md:h-[360px] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300 cursor-pointer group"
            >

              <img
                src={novel.image_url}
                alt={novel.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4 flex flex-col justify-end">
                <h2 className="text-white font-bold text-lg">{novel.title}</h2>
                <p className="text-gray-300 text-sm">{novel.author}</p>
                <p className="text-xs text-gray-300">
                  Updated:{" "}
                  {new Date(novel.updated_at).toLocaleDateString(
                    "en-GB",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default RecentlyUpdate;
