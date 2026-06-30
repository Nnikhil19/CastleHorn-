import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { getListings, listingImage, listingImageFallback, TERM_LABELS } from "../lib/listings";
import { SearchIcon } from "../components/icons";
import "./Home.css";

const CATEGORIES = [
  { value: "all",    label: "All" },
  { value: "weeks",  label: "1–3 Weeks" },
  { value: "summer", label: "Summer" },
  { value: "winter", label: "Semester" },
];

const MARQUEE_ITEMS = [
  "No broker fees", "UT email verified", "Real students, real rooms", "Free to post",
  "No broker fees", "UT email verified", "Real students, real rooms", "Free to post",
];

const HOW_STEPS = [
  { n: "1", t: "Find your match", d: "Filter by term, neighborhood, and budget until you spot a room that actually fits your semester." },
  { n: "2", t: "Message the student", d: "Talk to the person who lives there. Ask the awkward questions before you commit to anything." },
  { n: "3", t: "Move in, no fuss", d: "Sort out dates and the handoff directly. No agents, no application fees, no surprises." },
];

const BLOGS = [
  { title: "How to tell a real sublet from a scam in 30 seconds", date: "Jul 25, 2026" },
  { title: "Subleasing 101 for first-time Longhorns", date: "Jul 22, 2026" },
  { title: "Which West Campus blocks are actually worth it", date: "Jul 18, 2026" },
  { title: "Splitting rent and utilities without the drama", date: "Jul 14, 2026" },
];

function RoomCard({ item, onClick }) {
  return (
    <div className="room-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onClick(); }}>
      <div className="room-card-imgwrap">
        <img className="room-card-img" src={listingImage(item)} alt={item.title} loading="lazy"
          onError={(e) => { e.currentTarget.src = listingImageFallback(item); }} />
        {item.term && (
          <span className="room-card-term">{TERM_LABELS[item.term] ?? item.term}</span>
        )}
      </div>
      <div className="room-card-body">
        <div className="room-card-row">
          <h3>{item.location || item.title}</h3>
          <span className="room-card-rating">★ {item.rating ?? "New"}</span>
        </div>
        <p className="room-card-dates">{item.dates}</p>
        <p className="room-card-price">
          <strong>${item.price}</strong> {item.priceUnit}
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [category, setCategory] = useState("all");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  useEffect(() => {
    let active = true;
    getListings().then((data) => active && setListings(data));
    return () => { active = false; };
  }, []);

  const shown = useMemo(() => {
    const list = category === "all" ? listings : listings.filter((l) => l.term === category);
    return list.slice(0, 6);
  }, [listings, category]);

  return (
    <div className="home">

      {/* ── NAV ── */}
      <nav className="nav">
        <button className="nav-brand" onClick={() => navigate("/")}>
          <span className="nav-brand-icon">C</span>
          <span className="nav-brand-text">Castle<span>Horn</span></span>
        </button>
        <ul className="nav-links">
          <li><button onClick={() => navigate("/")}>Home</button></li>
          <li><button onClick={() => navigate("/sublets")}>Browse</button></li>
          <li><button onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>How it works</button></li>
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

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          <span>Built by City of Austin interns · free to post</span>
        </div>
        <h1>
          Sublets near campus,{" "}
          <span className="hero-italic">minus the stress.</span>
        </h1>
        <p className="hero-sub">
          Summer, winter-break, and a-few-weeks stays, posted by other Longhorns. No brokers,
          no fees, no Craigslist guessing games — just students handing off a room they already love.
        </p>
        <div className="search-bar">
          <div className="search-field">
            <label>Where</label>
            <input placeholder="West Campus, Hyde Park…" />
          </div>
          <div className="search-field">
            <label>Move in</label>
            <input type="date" />
          </div>
          <div className="search-field">
            <label>Move out</label>
            <input type="date" />
          </div>
          <button className="search-btn" onClick={() => navigate("/sublets")}>
            <SearchIcon width={17} height={17} />
            Search
          </button>
        </div>
      </section>

      {/* ── TRUST MARQUEE ── */}
      <div className="marquee-strip">
        <div className="marquee-inner">
          {MARQUEE_ITEMS.map((t, i) => (
            <span key={i} className="marquee-item">
              <span className="marquee-item-star">✦</span> {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="how-section" id="how">
        <div className="how-header">
          <div>
            <p className="how-eyebrow">How it works</p>
            <h2>Three steps. No paperwork, no middlemen.</h2>
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

      {/* ── LISTINGS ── */}
      <section className="rooms">
        <div className="rooms-header">
          <h2>Open right now</h2>
          <button className="rooms-see-all" onClick={() => navigate("/sublets")}>See all listings →</button>
        </div>
        <div className="cat-tabs">
          {CATEGORIES.map((c) => (
            <button key={c.value}
              className={`cat-tab ${category === c.value ? "active" : ""}`}
              onClick={() => setCategory(c.value)}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="rooms-grid">
          {shown.length === 0 ? (
            <p className="rooms-empty">No sublets in this category yet.</p>
          ) : (
            shown.map((item) => (
              <RoomCard key={item.id} item={item} onClick={() => navigate(`/sublets/${item.id}`)} />
            ))
          )}
        </div>
      </section>

      {/* ── HOST CTA ── */}
      <section className="host-cta">
        <div className="host-cta-inner">
          <div className="host-cta-blobs">
            <div className="host-cta-blob-a" />
            <div className="host-cta-blob-b" />
            <div className="host-cta-blob-c" />
          </div>
          <div className="host-cta-scrim" />
          <div className="host-cta-content">
            <span className="host-cta-badge">Got a place sitting empty?</span>
            <h2>List it in about five minutes.</h2>
            <p>
              Heading home for the summer or studying abroad? Put your room in front of Longhorns
              who actually need it. Posting is free, and you pick who you hand the keys to.
            </p>
            <button className="host-cta-btn" onClick={() => navigate("/auth?mode=register")}>
              Post a listing →
            </button>
          </div>
        </div>
      </section>

      {/* ── TIPS ── */}
      <section className="blogs">
        <h2 className="blogs-title">Figure it out faster</h2>
        <div className="blogs-grid">
          <article className="blog-feature">
            <img src={listingImage({ id: "blog-hero" })} alt=""
              onError={(e) => { e.currentTarget.src = listingImageFallback({ id: "blog-hero" }); }} />
            <div className="blog-feature-body">
              <span className="blog-eyebrow">Guide</span>
              <h3>The whole subleasing thing, explained without the legalese</h3>
              <p>From sniffing out roommates to splitting the deposit fairly — the stuff nobody tells you until you've already signed.</p>
            </div>
          </article>
          <div className="blog-list">
            {BLOGS.map((b, i) => (
              <article className="blog-item" key={b.title}>
                <img src={listingImage({ id: `blog-${i}` })} alt=""
                  onError={(e) => { e.currentTarget.src = listingImageFallback({ id: `blog-${i}` }); }} />
                <div className="blog-item-body">
                  <h4>{b.title}</h4>
                  <span className="blog-date">{b.date}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="about" id="about">
        <div className="about-text">
          <span className="about-eyebrow">About CastleHorn</span>
          <h2>We made the thing we wish we'd had.</h2>
          <p>
            CastleHorn started as a side project among{" "}
            <strong>City of Austin interns</strong> who'd all been burned by the summer-sublet
            scramble at least once. We wanted one honest place to find a room near UT — without
            the spam DMs and ghost listings.
          </p>
          <p>
            We're engineers, designers, and policy nerds who think finding a place to crash in
            Austin shouldn't be this hard. So we're fixing it, one listing at a time.
          </p>
          <button className="btn btn-dark" style={{ marginTop: 12 }}
            onClick={() => navigate("/auth?mode=register")}>
            Join the community
          </button>
        </div>
        <div className="about-photos">
          <img className="about-photo p1" src={listingImage({ id: "about-1" })} alt=""
            onError={(e) => { e.currentTarget.src = listingImageFallback({ id: "about-1" }); }} />
          <img className="about-photo p2" src={listingImage({ id: "about-2" })} alt=""
            onError={(e) => { e.currentTarget.src = listingImageFallback({ id: "about-2" }); }} />
          <img className="about-photo p3" src={listingImage({ id: "about-3" })} alt=""
            onError={(e) => { e.currentTarget.src = listingImageFallback({ id: "about-3" }); }} />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-cols">
          <div className="footer-brand-col">
            <div className="footer-brand">Castle<span>Horn</span></div>
            <p>A City of Austin intern project. Made for Longhorns, by Longhorns who've slept on enough air mattresses.</p>
          </div>
          <div className="footer-col">
            <h4>Get a place</h4>
            <button onClick={() => navigate("/sublets")}>Browse sublets</button>
            <button onClick={() => navigate("/auth?mode=register")}>Post a listing</button>
            <button onClick={() => navigate("/auth?mode=register")}>Create account</button>
          </div>
          <div className="footer-col">
            <h4>Help</h4>
            <button onClick={() => {}}>Tips &amp; guides</button>
            <button onClick={() => {}}>Contact us</button>
            <button onClick={() => {}}>Terms &amp; privacy</button>
          </div>
          <div className="footer-col">
            <h4>Follow</h4>
            <button onClick={() => {}}>Instagram</button>
            <button onClick={() => {}}>Twitter / X</button>
            <button onClick={() => {}}>YouTube</button>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 CastleHorn</span>
          <span>Hook 'em 🤘</span>
        </div>
      </footer>

    </div>
  );
}
