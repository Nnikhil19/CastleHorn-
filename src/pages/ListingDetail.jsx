import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getListingById, listingImage, listingImageFallback, TERM_LABELS, FEATURE_LABELS } from "../lib/listings";
import "./Sublets.css";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getListingById(id)
      .then((data) => active && setListing(data))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  const firstName = (listing?.postedBy ?? "them").split(" ")[0];

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
            <h1 className="ld-title">{listing.title}</h1>
            <p className="ld-postedby">
              {listing.location ? `${listing.location} · ` : ""}
              Posted by {listing.postedBy}
              {listing.rating ? ` · ★ ${listing.rating}` : ""}
            </p>

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

            <button className="ld-cta-btn" onClick={() => navigate("/auth?mode=register")}>
              Message {firstName} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
