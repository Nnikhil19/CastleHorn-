import { Link } from "react-router-dom";
import "./Sublets.css";

export default function BlogPage() {
  return (
    <div className="sub-page">
      <nav className="sub-nav">
        <Link to="/" className="sub-brand">
          <span className="sub-brand-icon">C</span>
          <span className="sub-brand-text">Castle<span>Horn</span></span>
        </Link>
        <Link to="/sublets" className="sub-back">Browse listings</Link>
      </nav>

      <main className="simple-page">
        <p className="sub-browse-eyebrow">Guide</p>
        <h1>How CastleHorn works</h1>
        <section className="simple-section">
          <h2>For renters</h2>
          <p>Search approved listings by neighborhood, dates, rent, term, and roommate traits. Open a listing to see photos, map location, rent, address, host info, and peer reviews.</p>
          <p>CastleHorn does not process payments or leases. Use the host's email or phone number to ask questions, tour the space, confirm details, and arrange the handoff yourself.</p>
        </section>
        <section className="simple-section">
          <h2>For subletters</h2>
          <p>Create an account with any valid email while the app is in testing mode, complete your profile, then submit a listing with the full property address, monthly rent, photos, contact info, and proof of occupancy.</p>
          <p>New listings go into manual admin review first. Once approved, they appear on the homepage, browse page, and map page.</p>
        </section>
        <section className="simple-section">
          <h2>Safety checklist</h2>
          <p>Use a verified email, verify the address, compare rent with the lease, avoid paying before seeing proof, and keep important agreements in writing.</p>
        </section>
      </main>
    </div>
  );
}
