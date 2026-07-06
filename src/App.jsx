import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import ProfileSetup from "./pages/ProfileSetup";
import ProfilePage from "./pages/ProfilePage";
import Sublets from "./pages/Sublets";
import CreateListing from "./pages/CreateListing";
import ListingDetail from "./pages/ListingDetail";
import MapPage from "./pages/MapPage";
import BlogPage from "./pages/BlogPage";
import ProfilesPage from "./pages/ProfilesPage";
import ReviewPage from "./pages/ReviewPage";
import AdminPage from "./pages/AdminPage";
import LegalPage from "./pages/LegalPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/profile-setup" element={<ProfileSetup />} />
      <Route path="/profiles" element={<ProfilesPage />} />
      <Route path="/profile/:username" element={<ProfilePage />} />
      <Route path="/sublets" element={<Sublets />} />
      <Route path="/sublets/new" element={<CreateListing />} />
      <Route path="/sublets/:id" element={<ListingDetail />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/reviews" element={<ReviewPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/terms" element={<LegalPage />} />
      <Route path="/privacy" element={<LegalPage />} />
      <Route path="/safety" element={<LegalPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
