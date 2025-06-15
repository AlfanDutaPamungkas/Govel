import React from "react";
import PageWrapper from "../components/PageWrapper";
import Navbar from "../components/Navbar";

const Bookmark = () => {
  return (
    <PageWrapper>
      <Navbar />
      <div className="pt-20">
        <h1 className="text-3xl font-bold text-center mt-10">Bookmarks</h1>
        <p className="text-center mt-4">Novel that ur love here.</p>
      </div>
    </PageWrapper>
  );
};

export default Bookmark;
