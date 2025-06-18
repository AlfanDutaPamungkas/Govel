import PageWrapper from "../components/PageWrapper";
import RecentlyUpdate from "../components/homepage/RecentlyUpdate";
import AllNovel from "../components/homepage/AllNovel"; // import komponen baru
import HeroSection from "../components/homepage/HeroSection";

const HomePage = () => {
  return (
    <PageWrapper>
      <HeroSection />
      <RecentlyUpdate />
      <AllNovel />
    </PageWrapper>
  );
};

export default HomePage;
