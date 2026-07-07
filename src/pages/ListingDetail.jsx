import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getListingById,
  listingImage,
  TERM_LABELS,
  FEATURE_LABELS,
  getReviews,
  addReview,
  isVerifiedEmail,
} from "../lib/listings";
import { Logo } from "../components/icons";
import "./Sublets.css";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewText, setReviewText] = useState("");

  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    getListingById(id)
      .then((data) => { if (active) setListing(data); })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  // Reviews load independently so a slow reviews query never blocks the listing.
  useEffect(() => {
    if (!listing?.id) return;
    let active = true;
    getReviews(listing.id).then((loaded) => { if (active) setReviews(loaded); });
    return () => { active = false; };
  }, [listing?.id]);

  const handleReview = async (e) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewText.trim() || reviewSubmitting) return;
    setReviewSubmitting(true);
    try {
      const updated = await addReview(listing.id, { reviewer: reviewerName.trim(), text: reviewText.trim() });
      setReviews(updated);
      setReviewerName("");
      setReviewText("");
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const firstName = (listing?.postedBy ?? "the host").split(" ")[0];
  const image = listingImage(listing);
  const profileSlug = listing?.posterUsername;

  return (
    <div className="sub-page">
      <nav className="sub-nav">
        <Link to="/" className="sub-brand">
          <span className="sub-brand-icon"><Logo width={22} height={22} /></span>
          <span className="sub-brand-text">Castle<span>Horn</span></span>
        </Link>
        <Link to="/sublets" className="sub-back">Back to listings</Link>
      </nav>

      {loading ? (
        <p className="sub-empty ld-status">Loading...</p>
      ) : !listing ? (
        <div className="ld-status">
          <p className="sub-empty">Listing not found.</p>
          <Link to="/sublets" className="ld-cta-btn" style={{ marginTop: 16, display: "inline-flex" }}>Back to listings</Link>
        </div>
      ) : (
        <div className="ld-wrap">
          <button className="ld-back" onClick={() => navigate("/sublets")}>Back to listings</button>

          <div className="ld-hero">
            {image ? (
              <img className="ld-img" src={image} alt={listing.title} />
            ) : (
              <div className="ld-img ld-placeholder">Photo pending</div>
            )}
            <div className="ld-price-badge">
              <strong>${listing.price}</strong> <span>{listing.priceUnit}</span>
            </div>
          </div>

          <div className="ld-body">
            <div className="ld-title-row">
              <h1 className="ld-title">{listing.title}</h1>
              {isVerifiedEmail(listing.posterEmail) && <span className="listing-badge badge-verified">Email Verified</span>}
              {listing.status === "approved" && <span className="listing-badge badge-approved">Approved</span>}
              {listing.underReview && <span className="listing-badge badge-review">Under Review</span>}
            </div>

            <p className="ld-postedby">
              {listing.location ? `${listing.location} - ` : ""}
              Posted by {listing.postedBy}
            </p>

            {listing.underReview && (
              <div className="ld-under-review">This listing is visible by direct link only until admin review is complete.</div>
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
                <span className="ld-fact-label">Monthly rent</span>
                <span className="ld-fact-value">${listing.price} {listing.priceUnit}</span>
              </div>
              <div className="ld-fact">
                <span className="ld-fact-label">Address</span>
                <span className="ld-fact-value">{listing.address || "Address unavailable"}</span>
              </div>
            </div>

            {listing.address && (
              <div className="ld-section">
                <h3>Map</h3>
                <iframe
                  title="Listing location"
                  className="ld-map"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(listing.address)}&output=embed&z=15`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}

            {listing.features?.length > 0 && (
              <div className="ld-section">
                <h3>What people vouch for</h3>
                <div className="sub-tags">
                  {listing.features.map((f) => <span className="sub-tag" key={f}>{FEATURE_LABELS[f] ?? f}</span>)}
                </div>
              </div>
            )}

            <div className="ld-section">
              <h3>About this place</h3>
              <p className="ld-desc">{listing.desc}</p>
            </div>

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
                        <span>Email</span>
                        <a href={`mailto:${listing.posterEmail}`}>{listing.posterEmail}</a>
                      </div>
                    )}
                    {listing.phone && (
                      <div className="ld-contact-row">
                        <span>Phone</span>
                        <a href={`tel:${listing.phone}`}>{listing.phone}</a>
                      </div>
                    )}
                    {profileSlug && (
                      <button className="ld-review-submit" type="button" onClick={() => navigate(`/profile/${profileSlug}`)}>
                        View host profile
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="ld-section">
              <h3>Peer Reviews</h3>
              <div className="ld-review-list">
                {reviews.length === 0 ? (
                  <p className="ld-review-empty">No reviews yet.</p>
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
                <input type="text" placeholder="Your name" value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)} required />
                <textarea rows={3} placeholder="Share your experience with this listing."
                  value={reviewText} onChange={(e) => setReviewText(e.target.value)} required />
                <button type="submit" className="ld-review-submit" disabled={reviewSubmitting}>
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
