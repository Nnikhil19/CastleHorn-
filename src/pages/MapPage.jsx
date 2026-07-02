import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getListings, TERM_LABELS, listingImage, listingImageFallback } from "../lib/listings";
import "./MapPage.css";

export default function MapPage() {
  const [listings, setListings] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let active = true;
    getListings().then((all) => {
      if (!active) return;
      const withAddr = all.filter((l) => l.address);
      setListings(withAddr);
      if (withAddr.length > 0) setSelected(withAddr[0]);
    });
    return () => { active = false; };
  }, []);

  const googleSearchUrl = selected
    ? `https://maps.google.com/maps?q=${encodeURIComponent(selected.address)}&output=embed&z=15`
    : `https://maps.google.com/maps?q=UT+Austin+Texas&output=embed&z=14`;

  return (
    <div className="map-page">
      <nav className="sub-nav">
        <Link to="/" className="sub-brand">
          <span className="sub-brand-icon">C</span>
          <span className="sub-brand-text">Castle<span>Horn</span></span>
        </Link>
        <div className="map-nav-links">
          <Link to="/sublets" className="sub-back">View Listings</Link>
          <Link to="/" className="sub-back">← Home</Link>
        </div>
      </nav>

      <div className="map-layout">
        <aside className="map-sidebar">
          <h2 className="map-sidebar-title">Listings Near You</h2>
          {listings.length === 0 ? (
            <p className="map-empty">No listings with addresses yet. <Link to="/sublets/new">Post one!</Link></p>
          ) : (
            listings.map((item) => (
              <div
                key={item.id}
                className={`map-listing-card ${selected?.id === item.id ? "map-listing-card--active" : ""}`}
                onClick={() => setSelected(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setSelected(item)}
              >
                <div className="map-card-img">
                  <img src={listingImage(item)} alt={item.title}
                    onError={(e) => { e.currentTarget.src = listingImageFallback(item); }} />
                </div>
                <div className="map-card-info">
                  <h3>{item.title}</h3>
                  <p className="map-card-address">📍 {item.address}</p>
                  <p className="map-card-meta">📅 {item.dates}</p>
                  <p className="map-card-meta">🏷️ {TERM_LABELS[item.term] ?? item.term}</p>
                  <div className="map-card-footer">
                    <span className="map-card-price">${item.price}</span>
                    <span className="map-card-unit">{item.priceUnit}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </aside>

        <div className="map-container">
          {selected && (
            <div className="map-selected-banner">
              <strong>{selected.title}</strong> — {selected.address}
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(selected.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="map-open-google"
              >
                Open in Google Maps ↗
              </a>
            </div>
          )}
          <iframe
            title="Listing Map"
            className="map-iframe"
            src={googleSearchUrl}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
