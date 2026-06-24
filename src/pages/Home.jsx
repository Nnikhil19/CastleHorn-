import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { getListings, listingImage, listingImageFallback, TERM_LABELS } from "../lib/listings";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { SearchIcon, CalendarIcon } from "../components/icons";
import "./Home.css";

// Lazy so three.js is split into its own chunk, loaded only when the band renders.
const WebGLShader = lazy(() =>
  import("@/components/ui/web-gl-shader").then((m) => ({ default: m.WebGLShader }))
);

const CATEGORIES = [
  { value: "all", label: "All categories" },
  { value: "weeks", label: "1–3 Weeks" },
  { value: "summer", label: "Summer" },
  { value: "winter", label: "Winter" },
];

const BLOGS = [
  { title: "How to spot a trustworthy sublet near UT", date: "Jul 25, 2026" },
  { title: "Subleasing 101: what every Longhorn should know", date: "Jul 25, 2026" },
  { title: "Best West Campus neighborhoods for students", date: "Jul 25, 2026" },
  { title: "Splitting rent & utilities the fair way", date: "Jul 25, 2026" },
];

function RoomCard({ item, onClick }) {
  return (
    <div className="room-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onClick(); }}>
      <div className="room-card-imgwrap">
        <img
          className="room-card-img"
          src={listingImage(item)}
          alt={item.title}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = listingImageFallback(item); }}
        />
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

  const goRegister = () => navigate("/auth?mode=register");
  const goLogin    = () => navigate("/auth?mode=login");
  const handleLogout = () => signOut(auth);
  const scrollTo = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

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
        <div className="nav-brand">Castle<span>Horn</span></div>
        <ul className="nav-links">
          <li><a href="#home" onClick={scrollTo("home")}>Home</a></li>
          <li><a href="#rooms" onClick={scrollTo("rooms")}>Rooms</a></li>
          <li><a href="#blogs" onClick={scrollTo("blogs")}>Blogs</a></li>
          <li><a href="#about" onClick={scrollTo("about")}>About</a></li>
        </ul>
        <div className="nav-auth">
          {user ? (
            <>
              <span className="nav-user">Hi, {user.email?.split("@")[0]}</span>
              <button className="btn btn-ghost" onClick={handleLogout}>Log Out</button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={goLogin}>Log In</button>
              <button className="btn btn-primary" onClick={goRegister}>Sign Up</button>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero" id="home">
        <div className="hero-overlay" />
        <div className="hero-inner">
          <h1>Experience Unforgettable Stays<br />Near UT Austin</h1>
          <p className="hero-sub">
            Discover student-vetted sublets tailored just for you — whether it's a
            semester away, a summer internship, or winter break.
          </p>

          <div className="search-bar">
            <div className="search-field">
              <label>Where</label>
              <input type="text" placeholder="Add destination" id="search-where" />
            </div>
            <div className="search-field">
              <label>Check in</label>
              <input type="date" id="search-in" />
            </div>
            <div className="search-field">
              <label>Check out</label>
              <input type="date" id="search-out" />
            </div>
            <div className="search-field">
              <label>Who</label>
              <input type="text" placeholder="Add guests" id="search-who" />
            </div>
            <button className="search-btn" onClick={() => navigate("/sublets")} aria-label="Search">
              <SearchIcon width={18} height={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ── EXPLORE ROOMS ── */}
      <section id="rooms" className="rooms">
        <h2 className="rooms-title">Explore Available Sublets</h2>
        <div className="cat-tabs">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              className={`cat-tab ${category === c.value ? "active" : ""}`}
              onClick={() => setCategory(c.value)}
            >
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

        <div className="rooms-cta">
          <Link to="/sublets" className="btn btn-ghost btn-lg">View all listings</Link>
        </div>
      </section>

      {/* ── HOST CTA (live shader band) ── */}
      <section className="host-cta">
        <Suspense fallback={null}>
          <WebGLShader fixed={false} />
        </Suspense>
        <div className="host-cta-scrim" />
        <div className="host-cta-inner">
          <span className="badge">Got a place?</span>
          <h2>List your sublet in minutes.</h2>
          <p>
            Reach thousands of verified Longhorns looking for a short-term place near campus.
            Free to post, always.
          </p>
          <LiquidButton
            size="xl"
            className="text-white border border-white/30 rounded-full"
            onClick={() => navigate("/sublets/new")}
          >
            Post a Listing
          </LiquidButton>
        </div>
      </section>

      {/* ── BLOGS ── */}
      <section id="blogs" className="blogs">
        <h2 className="blogs-title">Tips &amp; Guides</h2>
        <div className="blogs-grid">
          <article className="blog-feature">
            <img
              src={listingImage({ id: "blog-hero" })}
              alt=""
              onError={(e) => { e.currentTarget.src = listingImageFallback({ id: "blog-hero" }); }}
            />
            <div className="blog-feature-body">
              <h3>The complete guide to subleasing as a UT student</h3>
              <p>
                Everything from vetting roommates to splitting deposits — a practical
                walkthrough so your next sublet goes smoothly.
              </p>
              <span className="blog-date"><CalendarIcon width={13} height={13} /> Jul 25, 2026</span>
            </div>
          </article>

          <div className="blog-list">
            {BLOGS.map((b, i) => (
              <article className="blog-item" key={b.title}>
                <img
                  src={listingImage({ id: `blog-${i}` })}
                  alt=""
                  onError={(e) => { e.currentTarget.src = listingImageFallback({ id: `blog-${i}` }); }}
                />
                <div className="blog-item-body">
                  <h4>{b.title}</h4>
                  <span className="blog-date"><CalendarIcon width={13} height={13} /> {b.date}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="about">
        <div className="about-text">
          <span className="badge">About CastleHorn</span>
          <h2>Built by Interns, for Students</h2>
          <p>
            CastleHorn is a project by <strong>City of Austin interns</strong> who were once
            in your shoes. We built the resource we wish we had — a single platform that bridges
            UT campus life with the broader Austin community.
          </p>
          <p>
            Our team spans engineering, design, and public policy, all united by one goal:
            make Austin more accessible for every Longhorn.
          </p>
          <button className="btn btn-primary" onClick={goRegister}>Join the Community</button>
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
      <footer id="contact" className="footer">
        <div className="footer-cols">
          <div className="footer-brand-col">
            <div className="footer-brand">Castle<span>Horn</span></div>
            <p>A City of Austin Intern Project — made with ♥ for UT students.</p>
          </div>
          <div className="footer-col">
            <h4>Programs</h4>
            <a href="#rooms" onClick={scrollTo("rooms")}>Browse Sublets</a>
            <Link to="/sublets/new">Post a Listing</Link>
            <Link to="/auth?mode=register">Create Account</Link>
          </div>
          <div className="footer-col">
            <h4>Help &amp; Support</h4>
            <a href="#blogs" onClick={scrollTo("blogs")}>Tips &amp; Guides</a>
            <a href="mailto:nikhilsyt.2010@gmail.com">Contact Us</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Terms &amp; Privacy</a>
          </div>
          <div className="footer-col">
            <h4>Follow Us</h4>
            <a href="#" onClick={(e) => e.preventDefault()}>Instagram</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Twitter / X</a>
            <a href="#" onClick={(e) => e.preventDefault()}>YouTube</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 CastleHorn. Hook 'Em! 🤘</p>
        </div>
      </footer>

    </div>
  );
}
