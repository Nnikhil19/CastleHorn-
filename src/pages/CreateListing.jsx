import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addListing, FEATURE_LABELS } from "../lib/listings";
import "./Sublets.css";

const formatDate = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
};

export default function CreateListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", startDate: "", endDate: "", term: "weeks",
    price: "", unit: "per stay", desc: "", name: "",
    location: "", phone: "", contact: "",
  });
  const [features, setFeatures] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleFeature = (f) =>
    setFeatures((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const price = parseInt(form.price, 10);
    if (!form.title || !form.startDate || !form.endDate || !form.desc || !form.name || isNaN(price)) {
      setError("Please fill in all required fields with a valid price.");
      return;
    }
    if (form.endDate < form.startDate) {
      setError("End date must be after the start date.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await addListing({
        title: form.title,
        location: form.location || "Austin, TX",
        dates: `${formatDate(form.startDate)} – ${formatDate(form.endDate)}`,
        term: form.term,
        features,
        price,
        priceUnit: form.unit,
        desc: form.desc,
        postedBy: form.name,
        posterEmail: form.contact || "",
        phone: form.phone || "",
      });
      navigate("/sublets");
    } catch (err) {
      console.error(err);
      setError("Couldn't save your listing. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="sub-page">
      <nav className="sub-nav">
        <Link to="/" className="sub-brand">
          <span className="sub-brand-icon">C</span>
          <span className="sub-brand-text">Castle<span>Horn</span></span>
        </Link>
        <Link to="/sublets" className="sub-back">← Back to listings</Link>
      </nav>

      <div className="cl-wrap">
        <div className="sub-panel cl-panel">
          <h3>Create a Listing</h3>
          <p className="cl-sub">Post your sublet for fellow Longhorns to find.</p>

          <form onSubmit={handleSubmit} className="sub-form">
            <label htmlFor="new-title">Place Name *</label>
            <input id="new-title" type="text" required placeholder="e.g. Apartment Room"
              value={form.title} onChange={(e) => setField("title", e.target.value)} />

            <label htmlFor="new-location">Neighborhood / Area</label>
            <input id="new-location" type="text" placeholder="e.g. West Campus, Austin"
              value={form.location} onChange={(e) => setField("location", e.target.value)} />

            <label>Dates Available *</label>
            <div className="cl-date-row">
              <div>
                <label htmlFor="new-start-date" className="cl-date-sublabel">Start</label>
                <input id="new-start-date" type="date" required
                  value={form.startDate} onChange={(e) => setField("startDate", e.target.value)} />
              </div>
              <div>
                <label htmlFor="new-end-date" className="cl-date-sublabel">End</label>
                <input id="new-end-date" type="date" required
                  min={form.startDate || undefined}
                  value={form.endDate} onChange={(e) => setField("endDate", e.target.value)} />
              </div>
            </div>

            <label htmlFor="new-term">Lease Term</label>
            <select id="new-term" value={form.term} onChange={(e) => setField("term", e.target.value)}>
              <option value="weeks">1–3 Weeks</option>
              <option value="summer">Summer (May–Aug)</option>
              <option value="winter">Winter (Dec–Jan)</option>
            </select>

            <label>Traits (select all that apply)</label>
            <div className="sub-checks">
              {Object.entries(FEATURE_LABELS).map(([value, label]) => (
                <label key={value} className="sub-check">
                  <input
                    type="checkbox"
                    checked={features.includes(value)}
                    onChange={() => toggleFeature(value)}
                  />
                  {label}
                </label>
              ))}
            </div>

            <label htmlFor="new-price">Price ($) *</label>
            <input id="new-price" type="number" required placeholder="e.g. 650"
              value={form.price} onChange={(e) => setField("price", e.target.value)} />

            <label htmlFor="new-unit">Price Type</label>
            <select id="new-unit" value={form.unit} onChange={(e) => setField("unit", e.target.value)}>
              <option value="per stay">per stay</option>
              <option value="per month">per month</option>
            </select>

            <label htmlFor="new-desc">Description *</label>
            <textarea id="new-desc" rows={4} required placeholder="Short details…"
              value={form.desc} onChange={(e) => setField("desc", e.target.value)} />

            <label htmlFor="new-name">Your Name *</label>
            <input id="new-name" type="text" required placeholder="e.g. Sarah M."
              value={form.name} onChange={(e) => setField("name", e.target.value)} />

            <label htmlFor="new-contact">Contact Email (UT email gets a Verified badge)</label>
            <input id="new-contact" type="email" placeholder="you@utexas.edu"
              value={form.contact} onChange={(e) => setField("contact", e.target.value)} />

            <label htmlFor="new-phone">Phone Number</label>
            <input id="new-phone" type="tel" placeholder="(512) 555-0100"
              value={form.phone} onChange={(e) => setField("phone", e.target.value)} />

            {error && <p className="cl-error">{error}</p>}

            <button type="submit" className="sub-btn" disabled={submitting}>
              {submitting ? "Posting…" : "Post Listing"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
