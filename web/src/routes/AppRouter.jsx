import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Public pages
import Home from "../pages/Home";
import Genres from "../pages/Genres";
import TopUp from "../pages/TopUp";
import Bookmark from "../pages/Bookmark";
import Profile from "../pages/Profile";
import TransactionHistory from "../pages/profile/TransactionHistory";
import ChangePassword from "../pages/profile/ChangePassword";
import UpdateProfile from "../pages/profile/UpdateProfile";
import ChangeProfilePicture from "../pages/profile/ChangeProfilePicture";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Novel from "../pages/Novel";
import NovelDetail from "../pages/novel/NovelDetail";
import ChapterDetail from "../pages/novel/ChapterDetail";

// Auth
import SignIn from "../pages/auth/SignIn";
import SignUp from "../pages/auth/SignUp";

// Admin pages
import AdminLayout from "../pages/admin/AdminLayout";
import NovelList from "../pages/admin/NovelList";
import AddEditNovel from "../pages/admin/AddEditNovel";
import AddEditChapter from "../pages/admin/AddEditChapter"; // Tambahan
import Settings from "../pages/admin/Settings";
import NovelDetails from "../pages/admin/NovelDetail";
import Dashboard from "../pages/admin/Dashboard";
import AdminLogin from "../pages/admin/AdminLogin";



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
        <Route path="/change-profile-picture" element={<ChangeProfilePicture />} />
        <Route path="/novel" element={<Novel />} />
        <Route path="/novel/:id" element={<NovelDetail />} />
        <Route path="/novel/:novelId/chapter/:chapterNumber" element={<ChapterDetail />} />

        {/* Authentication */}
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="novels" element={<NovelList />} />
          <Route path="add-novel" element={<AddEditNovel />} />
          <Route path="edit-novel/:id" element={<AddEditNovel />} />

          <Route path="novels/:id" element={<NovelDetails />} />
          <Route path="novels/:id/add-chapter" element={<AddEditChapter />} />
          <Route path="novels/:id/edit-chapter/:number" element={<AddEditChapter />} />
          <Route path="settings" element={<Settings />} />
        </Route>


      </Routes>
    </AnimatePresence>
  );
};

export default AppRouter;
