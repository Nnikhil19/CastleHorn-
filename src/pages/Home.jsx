import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { getListings, listingImage, TERM_LABELS } from "../lib/listings";
import { SearchIcon } from "../components/icons";
import "./Home.css";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "weeks", label: "1-3 Weeks" },
  { value: "summer", label: "Summer" },
  { value: "winter", label: "Semester" },
];

const MARQUEE_ITEMS = [
  "No broker fees",
  "UT email verified",
  "Manual review",
  "Direct renter contact",
  "No broker fees",
  "UT email verified",
  "Manual review",
  "Direct renter contact",
];

const HOW_STEPS = [
  { n: "1", t: "Search approved listings", d: "Filter by date, area, lease term, and rent until you find a place that fits." },
  { n: "2", t: "Check the details", d: "Review real photos, the address, rent, profile info, and the public review section." },
  { n: "3", t: "Contact directly", d: "Use the host's UT email or phone number to ask questions and arrange the handoff." },
];

function RoomCard({ item, onClick }) {
  const image = listingImage(item);
  return (
    <div className="room-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onClick(); }}>
      <div className="room-card-imgwrap">
        {image ? (
          <img className="room-card-img" src={image} alt={item.title} loading="lazy" />
        ) : (
          <div className="room-card-placeholder">Photo pending</div>
        )}
        {item.term && <span className="room-card-term">{TERM_LABELS[item.term] ?? item.term}</span>}
      </div>
      <div className="room-card-body">
        <div className="room-card-row">
          <h3>{item.location || item.title}</h3>
          <span className="room-card-rating">{item.status === "approved" ? "Verified" : "New"}</span>
        </div>
        <p className="room-card-dates">{item.dates}</p>
        <p className="room-card-price"><strong>${item.price}</strong> {item.priceUnit}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState({ area: "", start: "", end: "" });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  useEffect(() => {
    let active = true;
    getListings()
      .then((data) => active && setListings(data))
      .finally(() => active && setLoadingListings(false));
    return () => { active = false; };
  }, []);

  const shown = useMemo(() => {
    const list = category === "all" ? listings : listings.filter((l) => l.term === category);
    return list.slice(0, 6);
  }, [listings, category]);

  const runSearch = () => {
    const params = new URLSearchParams();
    if (search.area.trim()) params.set("area", search.area.trim());
    if (search.start) params.set("start", search.start);
    if (search.end) params.set("end", search.end);
    navigate(`/sublets?${params.toString()}`);
  };

  const goToPost = () => navigate(user ? "/sublets/new" : "/auth?mode=register");

  return (
    <div className="home">
      <nav className="nav">
        <button className="nav-brand" onClick={() => navigate("/")}>
          <span className="nav-brand-icon">C</span>
          <span className="nav-brand-text">Castle<span>Horn</span></span>
        </button>
        <ul className="nav-links">
          <li><button onClick={() => navigate("/sublets")}>Browse</button></li>
          <li><button onClick={() => navigate("/map")}>Map</button></li>
          <li><button onClick={() => navigate("/profiles")}>Profiles</button></li>
          <li><button onClick={() => navigate("/blog")}>How it works</button></li>
          <li><button onClick={() => navigate("/reviews")}>Reviews</button></li>
        </ul>
        <div className="nav-auth">
          {user ? (
            <>
              <span className="nav-user">Hi, {user.email?.split("@")[0]}</span>
              <button className="nav-logout" onClick={() => signOut(auth)}>Log out</button>
            </>
          ) : (
            <>
              <button className="nav-login" onClick={() => navigate("/auth?mode=login")}>Log in</button>
              <button className="nav-signup" onClick={() => navigate("/auth?mode=register")}>Sign up</button>
            </>
          )}
        </div>
      </nav>

      <section className="hero">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          <span>UT-only sublets with manual review</span>
        </div>
        <h1>Sublets near campus, <span className="hero-italic">minus the stress.</span></h1>
        <p className="hero-sub">
          Search approved UT student listings with real photos, addresses, proof-of-occupancy review, and direct contact info.
        </p>
        <div className="search-bar">
          <div className="search-field">
            <label>Where</label>
            <input placeholder="West Campus, Hyde Park" value={search.area}
              onChange={(e) => setSearch((s) => ({ ...s, area: e.target.value }))} />
          </div>
          <div className="search-field">
            <label>Move in</label>
            <input type="date" value={search.start}
              onChange={(e) => setSearch((s) => ({ ...s, start: e.target.value }))} />
          </div>
          <div className="search-field">
            <label>Move out</label>
            <input type="date" value={search.end}
              onChange={(e) => setSearch((s) => ({ ...s, end: e.target.value }))} />
          </div>
          <button className="search-btn" onClick={runSearch}>
            <SearchIcon width={17} height={17} />
            Search
          </button>
        </div>
      </section>

      <div className="marquee-strip">
        <div className="marquee-inner">
          {MARQUEE_ITEMS.map((t, i) => (
            <span key={i} className="marquee-item"><span className="marquee-item-star">*</span> {t}</span>
          ))}
        </div>
      </div>

      <section className="how-section" id="how">
        <div className="how-header">
          <div>
            <p className="how-eyebrow">How it works</p>
            <h2>Find a UT sublet without guessing.</h2>
          </div>
        </div>
        <div className="how-grid">
          {HOW_STEPS.map((s) => (
            <div className="how-card" key={s.n}>
              <span className="how-num">{s.n}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rooms">
        <div className="rooms-header">
          <h2>Open right now</h2>
          <button className="rooms-see-all" onClick={() => navigate("/sublets")}>See all listings</button>
        </div>
        <div className="cat-tabs">
          {CATEGORIES.map((c) => (
            <button key={c.value} className={`cat-tab ${category === c.value ? "active" : ""}`}
              onClick={() => setCategory(c.value)}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="rooms-grid">
          {loadingListings ? (
            <p className="rooms-empty">Checking approved listings...</p>
          ) : shown.length === 0 ? (
            <p className="rooms-empty">No approved listings yet. Check back after admin review or post a place.</p>
          ) : (
            shown.map((item) => <RoomCard key={item.id} item={item} onClick={() => navigate(`/sublets/${item.id}`)} />)
          )}
        </div>
      </section>

      <section className="host-cta">
        <div className="host-cta-inner">
          <div className="host-cta-scrim" />
          <div className="host-cta-content">
            <span className="host-cta-badge">Got a place sitting empty?</span>
            <h2>Submit it for review.</h2>
            <p>Listings require a UT account, full address, monthly rent, real photos, and proof of occupancy before they go public.</p>
            <button className="host-cta-btn" onClick={goToPost}>Post a listing</button>
          </div>
        </div>
      </section>

      <section className="blogs">
        <h2 className="blogs-title">How CastleHorn works</h2>
        <div className="blog-single">
          <p>CastleHorn is a UT-only sublet board. Create an account with a UT email, complete a profile, and browse approved listings by area, dates, rent, and roommate traits.</p>
          <p>Subletters upload real photos, a full property address, monthly rent, and proof of occupancy. Admins review listings before they become public. Renters contact hosts directly by UT email or phone.</p>
          <button className="rooms-see-all" onClick={() => navigate("/blog")}>Read the guide</button>
        </div>
      </section>

      <section className="about" id="about">
        <div className="about-text">
          <span className="about-eyebrow">About CastleHorn</span>
          <h2>Built for Longhorn sublets.</h2>
          <p>CastleHorn keeps the workflow focused: verified UT accounts, real listing evidence, public reviews, map search, profile pages, and direct contact instead of in-app DMs.</p>
          <button className="btn btn-dark" style={{ marginTop: 12 }} onClick={() => navigate("/auth?mode=register")}>
            Join the community
          </button>
        </div>
        <div className="about-photos about-photos-text">
          <div className="about-photo-copy p1">UT-only accounts</div>
          <div className="about-photo-copy p2">Manual listing review</div>
          <div className="about-photo-copy p3">Direct renter contact</div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-cols">
          <div className="footer-brand-col">
            <div className="footer-brand">Castle<span>Horn</span></div>
            <p>A UT-focused sublet board for verified students and manually reviewed listings.</p>
          </div>
          <div className="footer-col">
            <h4>Listings</h4>
            <button onClick={() => navigate("/sublets")}>Browse sublets</button>
            <button onClick={goToPost}>Post a listing</button>
            <button onClick={() => navigate("/map")}>Map view</button>
          </div>
          <div className="footer-col">
            <h4>Community</h4>
            <button onClick={() => navigate("/profiles")}>Profiles</button>
            <button onClick={() => navigate("/reviews")}>Reviews</button>
            <button onClick={() => navigate("/blog")}>How it works</button>
          </div>
          <div className="footer-col">
            <h4>Staff</h4>
            <button onClick={() => navigate("/admin")}>Admin controls</button>
            <button onClick={() => navigate("/safety")}>Safety guide</button>
            <button onClick={() => navigate("/privacy")}>Privacy</button>
            <button onClick={() => navigate("/terms")}>Terms</button>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 CastleHorn</span>
          <span>Made for UT Austin students</span>
        </div>
      </footer>
    </div>
  );
}
