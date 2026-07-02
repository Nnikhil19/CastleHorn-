import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getListingById, listingImage, listingImageFallback,
  TERM_LABELS, FEATURE_LABELS, getReviews, addReview,
} from "../lib/listings";
import "./Sublets.css";

const isUTEmail = (email) =>
  email?.endsWith("@utexas.edu") || email?.endsWith("@my.utexas.edu");

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    let active = true;
    getListingById(id).then((data) => {
      if (!active) return;
      setListing(data);
      if (data) setReviews(getReviews(data.id));
    }).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  const handleReview = (e) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewText.trim()) return;
    const updated = addReview(listing.id, { reviewer: reviewerName.trim(), text: reviewText.trim() });
    setReviews(updated);
    setReviewerName("");
    setReviewText("");
  };

  const firstName = (listing?.postedBy ?? "them").split(" ")[0];
  const verified = isUTEmail(listing?.posterEmail);

  return (
    <div className="sub-page">
      <nav className="sub-nav">
        <Link to="/" className="sub-brand">
          <span className="sub-brand-icon">C</span>
          <span className="sub-brand-text">Castle<span>Horn</span></span>
        </Link>
        <Link to="/sublets" className="sub-back">← Back to listings</Link>
      </nav>

      {loading ? (
        <p className="sub-empty ld-status">Loading…</p>
      ) : !listing ? (
        <div className="ld-status">
          <p className="sub-empty">Listing not found.</p>
          <Link to="/sublets" className="ld-cta-btn" style={{ marginTop: 16, display: "inline-flex" }}>
            Back to listings
          </Link>
        </div>
      ) : (
        <div className="ld-wrap">
          <button className="ld-back" onClick={() => navigate("/sublets")}>← Back to listings</button>

          <div className="ld-hero">
            <img className="ld-img" src={listingImage(listing)} alt={listing.title}
              onError={(e) => { e.currentTarget.src = listingImageFallback(listing); }} />
            <div className="ld-price-badge">
              <strong>${listing.price}</strong>{" "}
              <span>{listing.priceUnit}</span>
            </div>
          </div>

          <div className="ld-body">
            <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "10px", marginBottom: "6px" }}>
              <h1 className="ld-title" style={{ margin: 0 }}>{listing.title}</h1>
              {verified && (
                <span className="listing-badge badge-verified">UT Verified</span>
              )}
              {listing.underReview && (
                <span className="listing-badge badge-review">Under Review</span>
              )}
            </div>

            <p className="ld-postedby">
              {listing.location ? `${listing.location} · ` : ""}
              Posted by {listing.postedBy}
              {listing.rating ? ` · ★ ${listing.rating}` : ""}
            </p>

            {listing.underReview && (
              <div className="ld-under-review">
                ⏳ This listing is pending review — contact info is shown below for your convenience.
              </div>
            )}

            <div className="ld-facts">
              <div className="ld-fact">
                <span className="ld-fact-label">Dates available</span>
                <span className="ld-fact-value">{listing.dates}</span>
              </div>
              <div className="ld-fact">
                <span className="ld-fact-label">Lease term</span>
                <span className="ld-fact-value">{TERM_LABELS[listing.term] ?? listing.term}</span>
              </div>
              <div className="ld-fact">
                <span className="ld-fact-label">Price</span>
                <span className="ld-fact-value">${listing.price} {listing.priceUnit}</span>
              </div>
            </div>

            {listing.features?.length > 0 && (
              <div className="ld-section">
                <h3>What people vouch for</h3>
                <div className="sub-tags">
                  {listing.features.map((f) => (
                    <span className="sub-tag" key={f}>{FEATURE_LABELS[f] ?? f}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="ld-section">
              <h3>About this place</h3>
              <p className="ld-desc">{listing.desc}</p>
            </div>

            {/* ── Contact ── */}
            {(listing.posterEmail || listing.phone) && (
              <div className="ld-section">
                <h3>Contact {firstName}</h3>
                <button className="ld-contact-toggle" onClick={() => setShowContact((v) => !v)}>
                  {showContact ? "Hide contact info" : "Show contact info"}
                </button>
                {showContact && (
                  <div className="ld-contact-panel">
                    {listing.posterEmail && (
                      <div className="ld-contact-row">
                        <span>📧</span>
                        <a href={`mailto:${listing.posterEmail}`}>{listing.posterEmail}</a>
                      </div>
                    )}
                    {listing.phone && (
                      <div className="ld-contact-row">
                        <span>📞</span>
                        <a href={`tel:${listing.phone}`}>{listing.phone}</a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Peer Reviews ── */}
            <div className="ld-section">
              <h3>Peer Reviews</h3>
              <div className="ld-review-list">
                {reviews.length === 0 ? (
                  <p className="ld-review-empty">No reviews yet — be the first!</p>
                ) : (
                  reviews.map((r, i) => (
                    <div className="ld-review-item" key={i}>
                      <p className="ld-review-author">{r.reviewer}</p>
                      <p className="ld-review-text">{r.text}</p>
                    </div>
                  ))
                )}
              </div>
              <form className="ld-review-form" onSubmit={handleReview}>
                <input
                  type="text" placeholder="Your name"
                  value={reviewerName} onChange={(e) => setReviewerName(e.target.value)}
                  required
                />
                <textarea
                  rows={3} placeholder="Share your experience with this listing…"
                  value={reviewText} onChange={(e) => setReviewText(e.target.value)}
                  required
                />
                <button type="submit" className="ld-review-submit">Submit Review</button>
              </form>
            </div>

            <button className="ld-cta-btn" onClick={() => navigate("/auth?mode=register")}>
              Message {firstName} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
