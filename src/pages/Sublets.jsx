import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getListings, listingImage, listingImageFallback, TERM_LABELS, FEATURE_LABELS } from "../lib/listings";
import "./Sublets.css";

export default function Sublets() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTerm, setFilterTerm] = useState("all");
  const [maxBudget, setMaxBudget] = useState("");
  const [activeFeatures, setActiveFeatures] = useState([]);

  useEffect(() => {
    let active = true;
    getListings()
      .then((data) => active && setListings(data))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const toggleFeature = (f) =>
    setActiveFeatures((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );

  const filtered = useMemo(() => {
    const budget = parseInt(maxBudget, 10);
    return listings.filter((item) => {
      if (filterTerm !== "all" && item.term !== filterTerm) return false;
      if (!isNaN(budget) && item.price > budget) return false;
      if (activeFeatures.length > 0) {
        const itemFeatures = item.features ?? [];
        if (!activeFeatures.every((f) => itemFeatures.includes(f))) return false;
      }
      return true;
    });
  }, [listings, filterTerm, maxBudget, activeFeatures]);

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

              <label>Traits (match all selected)</label>
              <div className="sub-checks">
                {Object.entries(FEATURE_LABELS).map(([value, label]) => (
                  <label key={value} className="sub-check">
                    <input
                      type="checkbox"
                      checked={activeFeatures.includes(value)}
                      onChange={() => toggleFeature(value)}
                    />
                    {label}
                  </label>
                ))}
              </div>

              <label htmlFor="price">Max Budget ($)</label>
              <input id="price" type="number" placeholder="e.g. 1000"
                value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} />
            </div>
          </div>
        </aside>

        {/* ── Feed ── */}
        <main className="sub-feed">
          <h2 className="sub-feed-title">Available Sublets</h2>
          {loading ? (
            <p className="sub-empty">Loading listings…</p>
          ) : filtered.length === 0 ? (
            <p className="sub-empty">No verified matches found matching these parameters.</p>
          ) : (
            filtered.map((item) => (
              <div
                className="sub-card sub-card-clickable"
                key={item.id}
                onClick={() => navigate(`/sublets/${item.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") navigate(`/sublets/${item.id}`); }}
              >
                <img className="sub-card-img" src={listingImage(item)} alt={item.title} loading="lazy"
                  onError={(e) => { e.currentTarget.src = listingImageFallback(item); }} />
                <div className="sub-card-main">
                  <h3>{item.title}</h3>
                  <p className="sub-meta">📅 {item.dates}</p>
                  <p className="sub-meta">🏷️ {TERM_LABELS[item.term] ?? item.term}</p>
                  {item.features?.length > 0 && (
                    <div className="sub-tags">
                      {item.features.map((f) => (
                        <span className="sub-tag" key={f}>{FEATURE_LABELS[f] ?? f}</span>
                      ))}
                    </div>
                  )}
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
