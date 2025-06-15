import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Import pages
import Home from "../pages/Home";
import Genres from "../pages/Genres";
import TopUp from "../pages/TopUp";
import Bookmark from "../pages/Bookmark";
import Profile from "../pages/Profile";
import TransactionHistory from "../pages/profile/TransactionHistory";
import ChangePassword from "../pages/profile/ChangePassword";
import UpdateProfile from "../pages/profile/UpdateProfile";

// Import authentication page
import SignIn from "../pages/auth/SignIn";
import SignUp from "../pages/auth/SignUp";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ChangeProfilePicture from "../pages/profile/ChangeProfilePicture";
import Novel from "../pages/Novel";
import NovelDetail from "../pages/novel/NovelDetail";
import ChapterDetail from "../pages/novel/ChapterDetail";

const AppRouter = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/genres" element={<Genres />} />
        <Route path="/top-up" element={<TopUp />} />
        <Route path="/bookmarks" element={<Bookmark />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/transaction-history" element={<TransactionHistory />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/update-profile" element={<UpdateProfile />} />
        <Route
          path="change-profile-picture"
          element={<ChangeProfilePicture />}
        />
        <Route path="/novel" element={<Novel />} />
        <Route path="/novel/:id" element={<NovelDetail />} />
        <Route path="/novel/:novelId/chapter/:chapterNumber" element={<ChapterDetail />} />

        {/* Authentication */}
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRouter;
