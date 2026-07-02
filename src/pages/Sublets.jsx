import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getListings, listingImage, listingImageFallback, TERM_LABELS, FEATURE_LABELS } from "../lib/listings";
import "./Sublets.css";

const isUTVerified = (item) =>
  item.posterEmail?.endsWith("@utexas.edu") || item.posterEmail?.endsWith("@my.utexas.edu");

const TERM_OPTS = [
  { value: "all",    label: "All short-term" },
  { value: "weeks",  label: "1–3 Weeks" },
  { value: "summer", label: "Summer (May–Aug)" },
  { value: "winter", label: "Semester" },
];

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
        <Link to="/" className="sub-brand">
          <span className="sub-brand-icon">C</span>
          <span className="sub-brand-text">Castle<span>Horn</span></span>
        </Link>
        <Link to="/" className="sub-back">← Back home</Link>
      </nav>

      <div className="sub-layout">
        {/* ── Sidebar ── */}
        <aside className="sub-sidebar">
          <button className="sub-post-btn" onClick={() => navigate("/sublets/new")}>
            + Post your place
          </button>
          <div className="sub-panel">
            <h3>Narrow it down</h3>

            <label className="sub-filter-label">Lease term</label>
            <div className="sub-term-opts">
              {TERM_OPTS.map((t) => (
                <button key={t.value}
                  className={`sub-term-btn ${filterTerm === t.value ? "active" : ""}`}
                  onClick={() => setFilterTerm(t.value)}>
                  {t.label}
                </button>
              ))}
            </div>

            <label className="sub-filter-label">What matters most</label>
            <div className="sub-checks">
              {Object.entries(FEATURE_LABELS).map(([value, label]) => (
                <label key={value} className="sub-check">
                  <input type="checkbox"
                    checked={activeFeatures.includes(value)}
                    onChange={() => toggleFeature(value)} />
                  {label}
                </label>
              ))}
            </div>

            <label className="sub-filter-label">Max budget</label>
            <input type="number" placeholder="e.g. 800"
              value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)}
              className="sub-budget-input" />
          </div>
        </aside>

        {/* ── Feed ── */}
        <main>
          <div className="sub-browse-header">
            <p className="sub-browse-eyebrow">Browse</p>
            <h1>Every open sublet near UT</h1>
          </div>

          <p className="sub-feed-count">{filtered.length} places match</p>

          {loading ? (
            <p className="sub-empty">Loading listings…</p>
          ) : filtered.length === 0 ? (
            <p className="sub-empty">No verified matches found.</p>
          ) : (
            filtered.map((item) => (
              <div className="sub-card" key={item.id}
                onClick={() => navigate(`/sublets/${item.id}`)}
                role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") navigate(`/sublets/${item.id}`); }}>
                <img className="sub-card-img" src={listingImage(item)} alt={item.title} loading="lazy"
                  onError={(e) => { e.currentTarget.src = listingImageFallback(item); }} />
                <div className="sub-card-main">
                  <div className="sub-card-title-row">
                    <h3>{item.title}</h3>
                    <div className="sub-card-price-inline">
                      <span className="sub-price-big">${item.price}</span>{" "}
                      <span className="sub-priceunit-sm">{item.priceUnit}</span>
                    </div>
                  </div>
                  <p className="sub-meta">{item.location} · {item.dates}</p>
                  {(isUTVerified(item) || item.underReview) && (
                    <div className="listing-badges">
                      {isUTVerified(item) && (
                        <span className="listing-badge badge-verified">UT Verified</span>
                      )}
                      {item.underReview && (
                        <span className="listing-badge badge-review">Under Review</span>
                      )}
                    </div>
                  )}
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
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
}
