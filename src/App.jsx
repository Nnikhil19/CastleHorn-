import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import ProfileSetup from "./pages/ProfileSetup";
import Sublets from "./pages/Sublets";
import CreateListing from "./pages/CreateListing";
import ListingDetail from "./pages/ListingDetail";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/profile-setup" element={<ProfileSetup />} />
      <Route path="/sublets" element={<Sublets />} />
      <Route path="/sublets/new" element={<CreateListing />} />
      <Route path="/sublets/:id" element={<ListingDetail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
