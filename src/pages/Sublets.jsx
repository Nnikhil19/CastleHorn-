import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getListings, listingImage, TERM_LABELS, FEATURE_LABELS, isVerifiedEmail } from "../lib/listings";
import { Logo } from "../components/icons";
import "./Sublets.css";

const TERM_OPTS = [
  { value: "all", label: "All short-term" },
  { value: "weeks", label: "1-3 Weeks" },
  { value: "summer", label: "Summer (May-Aug)" },
  { value: "winter", label: "Semester" },
];

const overlaps = (item, start, end) => {
  if (!start && !end) return true;
  if (!item.startDate || !item.endDate) return true;
  const wantedStart = start || "0000-01-01";
  const wantedEnd = end || "9999-12-31";
  return item.startDate <= wantedEnd && item.endDate >= wantedStart;
};

export default function Sublets() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTerm, setFilterTerm] = useState(params.get("term") || "all");
  const [area, setArea] = useState(params.get("area") || "");
  const [startDate, setStartDate] = useState(params.get("start") || "");
  const [endDate, setEndDate] = useState(params.get("end") || "");
  const [maxBudget, setMaxBudget] = useState(params.get("budget") || "");
  const [activeFeatures, setActiveFeatures] = useState([]);

  useEffect(() => {
    let active = true;
    getListings()
      .then((data) => active && setListings(data))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const next = new URLSearchParams();
    if (filterTerm !== "all") next.set("term", filterTerm);
    if (area.trim()) next.set("area", area.trim());
    if (startDate) next.set("start", startDate);
    if (endDate) next.set("end", endDate);
    if (maxBudget) next.set("budget", maxBudget);
    setParams(next, { replace: true });
  }, [area, endDate, filterTerm, maxBudget, setParams, startDate]);

  const toggleFeature = (f) =>
    setActiveFeatures((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);

  const filtered = useMemo(() => {
    const budget = parseInt(maxBudget, 10);
    const areaNeedle = area.trim().toLowerCase();
    return listings.filter((item) => {
      if (filterTerm !== "all" && item.term !== filterTerm) return false;
      if (areaNeedle) {
        const haystack = `${item.location || ""} ${item.address || ""} ${item.title || ""}`.toLowerCase();
        if (!haystack.includes(areaNeedle)) return false;
      }
      if (!overlaps(item, startDate, endDate)) return false;
      if (!isNaN(budget) && Number(item.price) > budget) return false;
      if (activeFeatures.length > 0) {
        const itemFeatures = item.features ?? [];
        if (!activeFeatures.every((f) => itemFeatures.includes(f))) return false;
      }
      return true;
    });
  }, [activeFeatures, area, endDate, filterTerm, listings, maxBudget, startDate]);

  return (
    <div className="sub-page">
      <nav className="sub-nav">
        <Link to="/" className="sub-brand">
          <span className="sub-brand-icon"><Logo width={22} height={22} /></span>
          <span className="sub-brand-text">Castle<span>Horn</span></span>
        </Link>
        <div className="sub-nav-links">
          <Link to="/map" className="sub-back">Map view</Link>
          <Link to="/profiles" className="sub-back">Profiles</Link>
          <Link to="/" className="sub-back">Home</Link>
        </div>
      </nav>

      <div className="sub-layout">
        <aside className="sub-sidebar">
          <button className="sub-post-btn" onClick={() => navigate("/sublets/new")}>Post your place</button>
          <div className="sub-panel">
            <h3>Narrow it down</h3>

            <label className="sub-filter-label" htmlFor="filter-area">Area</label>
            <input id="filter-area" className="sub-budget-input" placeholder="West Campus"
              value={area} onChange={(e) => setArea(e.target.value)} />

            <label className="sub-filter-label">Dates</label>
            <div className="cl-date-row">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <input type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <label className="sub-filter-label">Lease term</label>
            <div className="sub-term-opts">
              {TERM_OPTS.map((t) => (
                <button key={t.value} className={`sub-term-btn ${filterTerm === t.value ? "active" : ""}`}
                  onClick={() => setFilterTerm(t.value)}>
                  {t.label}
                </button>
              ))}
            </div>

            <label className="sub-filter-label">What matters most</label>
            <div className="sub-checks">
              {Object.entries(FEATURE_LABELS).map(([value, label]) => (
                <label key={value} className="sub-check">
                  <input type="checkbox" checked={activeFeatures.includes(value)} onChange={() => toggleFeature(value)} />
                  {label}
                </label>
              ))}
            </div>

            <label className="sub-filter-label" htmlFor="filter-budget">Max monthly rent</label>
            <input id="filter-budget" type="number" placeholder="800"
              value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)}
              className="sub-budget-input" />
          </div>
        </aside>

        <main>
          <div className="sub-browse-header">
            <p className="sub-browse-eyebrow">Browse</p>
            <h1>Sublets near UT</h1>
          </div>

          <p className="sub-feed-count">{loading ? "Checking approved listings..." : `${filtered.length} places match`}</p>

          {loading ? (
            <p className="sub-empty">Loading listings...</p>
          ) : filtered.length === 0 ? (
            <p className="sub-empty">No approved matches found. New listings appear here after admin review.</p>
          ) : (
            filtered.map((item) => {
              const image = listingImage(item);
              return (
                <div className="sub-card" key={item.id}
                  onClick={() => navigate(`/sublets/${item.id}`)}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter") navigate(`/sublets/${item.id}`); }}>
                  {image ? (
                    <img className="sub-card-img" src={image} alt={item.title} loading="lazy" />
                  ) : (
                    <div className="sub-card-img sub-card-placeholder">Photo pending</div>
                  )}
                  <div className="sub-card-main">
                    <div className="sub-card-title-row">
                      <h3>{item.title}</h3>
                      <div className="sub-card-price-inline">
                        <span className="sub-price-big">${item.price}</span>{" "}
                        <span className="sub-priceunit-sm">{item.priceUnit}</span>
                      </div>
                    </div>
                    <p className="sub-meta">{item.location} - {item.dates}</p>
                    <div className="listing-badges">
                      {isVerifiedEmail(item.posterEmail) && <span className="listing-badge badge-verified">Email Verified</span>}
                      {item.status === "approved" && <span className="listing-badge badge-approved">Approved</span>}
                      {(item.underReview || item.status === "pending") && (
                        <span className="listing-badge badge-review">Awaiting approval — not yet verified</span>
                      )}
                    </div>
                    {item.features?.length > 0 && (
                      <div className="sub-tags">
                        {item.features.map((f) => <span className="sub-tag" key={f}>{FEATURE_LABELS[f] ?? f}</span>)}
                      </div>
                    )}
                    <p className="sub-desc">{item.desc}</p>
                    <p className="sub-postedby">Posted by {item.postedBy}</p>
                  </div>
                </div>
              );
            })
          )}
        </main>
      </div>
    </div>
  );
}
