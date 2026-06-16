import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getListings, TERM_LABELS } from "../lib/listings";
import "./Sublets.css";

export default function Sublets() {
  const [listings, setListings] = useState([]);
  const [filterTerm, setFilterTerm] = useState("all");
  const [maxBudget, setMaxBudget] = useState("");

  useEffect(() => {
    setListings(getListings());
  }, []);

  const filtered = useMemo(() => {
    const budget = parseInt(maxBudget, 10);
    return listings.filter((item) => {
      if (filterTerm !== "all" && item.term !== filterTerm) return false;
      if (!isNaN(budget) && item.price > budget) return false;
      return true;
    });
  }, [listings, filterTerm, maxBudget]);

  return (
    <div className="sub-page">
      <nav className="sub-nav">
        <Link to="/" className="sub-brand">Castle<span>Horn</span></Link>
        <Link to="/" className="sub-back">← Back home</Link>
      </nav>

      <div className="sub-layout">
        {/* ── Sidebar ── */}
        <aside className="sub-sidebar">
          <div className="sub-panel">
            <Link to="/sublets/new" className="sub-btn sub-btn-link">+ Create a Listing</Link>
          </div>

          <div className="sub-panel">
            <h3>Filter Sublets</h3>
            <div className="sub-form">
              <label htmlFor="term">Lease Term</label>
              <select id="term" value={filterTerm} onChange={(e) => setFilterTerm(e.target.value)}>
                <option value="all">All Short Term</option>
                <option value="weeks">1–3 Weeks</option>
                <option value="summer">Summer (May–Aug)</option>
                <option value="winter">Winter (Dec–Jan)</option>
              </select>

              <label htmlFor="price">Max Budget ($)</label>
              <input id="price" type="number" placeholder="e.g. 1000"
                value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} />
            </div>
          </div>
        </aside>

        {/* ── Feed ── */}
        <main className="sub-feed">
          <h2 className="sub-feed-title">Available Sublets</h2>
          {filtered.length === 0 ? (
            <p className="sub-empty">No verified matches found matching these parameters.</p>
          ) : (
            filtered.map((item) => (
              <div className="sub-card" key={item.id}>
                <div className="sub-card-main">
                  <h3>{item.title}</h3>
                  <p className="sub-meta">📅 {item.dates}</p>
                  <p className="sub-meta">🏷️ {TERM_LABELS[item.term] ?? item.term}</p>
                  <p className="sub-desc">{item.desc}</p>
                  <p className="sub-postedby">Posted by {item.postedBy}</p>
                </div>
                <div className="sub-card-price">
                  <span className="sub-price">${item.price}</span>
                  <span className="sub-priceunit">{item.priceUnit}</span>
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
}
