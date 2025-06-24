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
import AddEditChapter from "../pages/admin/AddEditChapter"; // Tambahan
import Settings from "../pages/admin/Settings";
import NovelDetails from "../pages/admin/NovelDetail";
import Dashboard from "../pages/admin/Dashboard";
import GenreManager from "../pages/admin/GenreManager";
import AuthRoute from "../components/auth/AuthRoute";
import ConfirmationPage from "../pages/auth/ConfirmationPage";
import ResetPassword from "../pages/auth/ResetPassword";
import AdminRoute from "../components/auth/AdminRoute";
import AddNovel from "../pages/admin/AddNovel";
import EditNovel from "../pages/admin/EditNovel";
import ChangeNovelImage from "../pages/admin/ChangeNovelImage";
import TransactionUser from "../pages/admin/TransactionUser";

const AppRouter = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/genres" element={<Genres />} />
        <Route 
          path="/top-up" 
          element={
            <AuthRoute>
              <TopUp />
            </AuthRoute>
          } 
        />
        <Route 
          path="/bookmarks" 
          element={
            <AuthRoute>
              <Bookmark />
            </AuthRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <AuthRoute>
              <Profile />
            </AuthRoute>
          } 
        />
        <Route
          path="/transaction-history" 
          element={
            <AuthRoute>
              <TransactionHistory />
            </AuthRoute>
          } 
        />
        <Route 
          path="/change-password" 
          element={
            <AuthRoute>
              <ChangePassword />
            </AuthRoute>
          } 
        />
        <Route 
          path="/update-profile" 
          element={
            <AuthRoute>
              <UpdateProfile />
            </AuthRoute>
          } 
        />
        <Route 
          path="/change-profile-picture" 
          element={
            <AuthRoute>
              <ChangeProfilePicture />
            </AuthRoute>
          } 
        />

        <Route path="/novel" element={<Novel />} />
        <Route 
          path="/novel/:novelID" 
          element={
            <AuthRoute>
              <NovelDetail />
            </AuthRoute>
          } 
        />
        <Route 
          path="/novel/:novelID/chapter/:slug" 
          element={
            <AuthRoute>
              <ChapterDetail />
            </AuthRoute>
          } 
        />

        {/* Authentication */}
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/confirm/:token" element={<ConfirmationPage/>}/>
        <Route path="/reset/:token" element={<ResetPassword/>}/>

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="novels" element={<NovelList />} />
          <Route path="genres" element={<GenreManager />} />
          <Route path="add-novel" element={<AddNovel />} />
          <Route path="edit-novel/:novelID" element={<EditNovel />} />
          <Route path="edit-novel/:novelID/image" element={<ChangeNovelImage />} />

          <Route path="novels/:novelID" element={<NovelDetails />} />
          <Route path="novels/:novelID/add-chapter" element={<AddEditChapter />} />
          <Route path="novels/:novelID/edit-chapter/:slug" element={<AddEditChapter />} />
          <Route path="transactions" element={<TransactionUser/>}/>
          <Route path="settings" element={<Settings />} />
        </Route>


      </Routes>
    </AnimatePresence>
  );
};

export default AppRouter;
