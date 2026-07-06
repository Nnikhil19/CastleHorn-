import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { approveListing, getListings, rejectListing, removeListing } from "../lib/listings";
import "./Sublets.css";

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

function canAdmin(user) {
  if (!user?.email) return false;
  if (ADMIN_EMAILS.length === 0) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  const allowed = canAdmin(user);
  const pending = useMemo(() => listings.filter((l) => l.underReview || l.status === "pending"), [listings]);
  const approved = useMemo(() => listings.filter((l) => l.status === "approved"), [listings]);

  const load = () => {
    setLoading(true);
    getListings({ includePending: true })
      .then(setListings)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user]);

  const act = async (id, fn) => {
    setBusyId(id);
    try {
      await fn(id);
      await load();
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="sub-page">
      <nav className="sub-nav">
        <Link to="/" className="sub-brand">
          <span className="sub-brand-icon">C</span>
          <span className="sub-brand-text">Castle<span>Horn</span></span>
        </Link>
        <Link to="/sublets" className="sub-back">Browse listings</Link>
      </nav>

      <main className="simple-page admin-page">
        <p className="sub-browse-eyebrow">Admin</p>
        <h1>Listing controls</h1>
        {!user ? (
          <p className="sub-empty">Log in with an admin account to review listings.</p>
        ) : !allowed ? (
          <p className="sub-empty">This account is not allowed to use admin controls. Add approved admin emails to VITE_ADMIN_EMAILS.</p>
        ) : loading ? (
          <p className="sub-empty">Loading listings...</p>
        ) : (
          <>
            <section className="simple-section">
              <h2>Pending review ({pending.length})</h2>
              {pending.length === 0 ? <p className="sub-empty">No pending listings.</p> : pending.map((item) => (
                <article className="admin-listing" key={item.id}>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.address}</p>
                    <p>${item.price} {item.priceUnit} - {item.posterEmail}</p>
                    {item.proofOfOccupancy && <a href={item.proofOfOccupancy} target="_blank" rel="noreferrer">Open proof of occupancy</a>}
                  </div>
                  <div className="admin-actions">
                    <button disabled={busyId === item.id} onClick={() => act(item.id, approveListing)}>Approve</button>
                    <button disabled={busyId === item.id} onClick={() => act(item.id, rejectListing)}>Reject</button>
                    <button disabled={busyId === item.id} onClick={() => act(item.id, removeListing)}>Delete</button>
                  </div>
                </article>
              ))}
            </section>
            <section className="simple-section">
              <h2>Approved ({approved.length})</h2>
              {approved.length === 0 ? <p className="sub-empty">No approved listings.</p> : approved.map((item) => (
                <article className="admin-listing" key={item.id}>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.address}</p>
                  </div>
                  <div className="admin-actions">
                    <button disabled={busyId === item.id} onClick={() => act(item.id, rejectListing)}>Unpublish</button>
                    <button disabled={busyId === item.id} onClick={() => act(item.id, removeListing)}>Delete</button>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
