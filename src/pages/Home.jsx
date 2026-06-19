import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import "./Home.css";

const FEATURES = [
  { icon: "🏘️", title: "Housing Finder",   desc: "Browse affordable, student-vetted sublets near UT campus.", link: "/sublets" },
  { icon: "🚌", title: "Transit Guide",    desc: "CapMetro routes, passes, and real-time schedules for Longhorns." },
  { icon: "💼", title: "Internship Board", desc: "City of Austin and local internships curated for UT students." },
  { icon: "🎟️", title: "Events & Culture", desc: "Free and discounted Austin events, concerts, and campus happenings." },
  { icon: "🍔", title: "Food Resources",   desc: "Food pantries, free meals, and student discount dining near campus." },
  { icon: "🩺", title: "Health & Wellness",desc: "Low-cost clinics, mental health services, and UT health resources." },
];

const STATS = [
  { num: "50K+",  label: "UT Students" },
  { num: "200+",  label: "Resources Listed" },
  { num: "100%",  label: "Free to Use" },
  { num: "6",     label: "Categories" },
];

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
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

  return (
    <div className="home">

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="nav-brand">Castle<span>Horn</span></div>
        <ul className="nav-links">
          <li><a href="#features" onClick={scrollTo("features")}>Features</a></li>
          <li><a href="#about" onClick={scrollTo("about")}>About</a></li>
          <li><Link to="/sublets">Listings</Link></li>
          <li><a href="#contact" onClick={scrollTo("contact")}>Contact</a></li>
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
      <section className="hero">
        <div className="hero-content">
          <span className="badge">Built for Longhorns 🤘</span>
          <h1>
            Your Campus.<br />
            Your City.<br />
            <span className="accent">Your Resource.</span>
          </h1>
          <p className="hero-sub">
            CastleHorn connects UT Austin students with city services, opportunities,
            and tools — built by City of Austin interns who know exactly what you need.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={goRegister}>
              Get Started Free
            </button>
            <Link to="/sublets" className="btn btn-ghost btn-lg">View Listings</Link>
            <a href="#features" onClick={scrollTo("features")} className="btn btn-ghost btn-lg">Learn More</a>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="tower-wrap">
            <div className="tower-spire" />
            <div className="tower-body" />
            <div className="tower-base" />
            <div className="tower-arch" />
          </div>
          <div className="hero-glow" />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="features">
        <div className="section-header">
          <span className="badge">What We Offer</span>
          <h2>Everything You Need, One Place</h2>
          <p className="section-sub">
            From housing to transit, internships to events — CastleHorn has you covered.
          </p>
        </div>
        <div className="cards">
          {FEATURES.map(({ icon, title, desc, link }) => (
            <div
              className={`card ${link ? "card-clickable" : ""}`}
              key={title}
              onClick={link ? () => navigate(link) : undefined}
              role={link ? "button" : undefined}
              tabIndex={link ? 0 : undefined}
            >
              <div className="card-icon">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
              {link && <span className="card-link">Explore →</span>}
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="about">
        <div className="about-text">
          <span className="badge">Our Story</span>
          <h2>Built by Interns,<br />for Students</h2>
          <p>
            CastleHorn is a project by <strong>City of Austin interns</strong> who were once
            in your shoes. We built the resource we wish we had — a single platform that bridges
            UT campus life with the broader Austin community.
          </p>
          <p>
            Our team spans engineering, design, and public policy, all united by one goal:
            make Austin more accessible for every Longhorn.
          </p>
          <button className="btn btn-primary" onClick={goRegister}>
            Join the Community
          </button>
        </div>
        <div className="about-stats">
          {STATS.map(({ num, label }) => (
            <div className="stat" key={label}>
              <span className="stat-num">{num}</span>
              <span className="stat-label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2>Ready to Explore Austin?</h2>
          <p>Join thousands of UT students already using CastleHorn. It's completely free.</p>
          <button className="btn btn-white btn-lg" onClick={goRegister}>
            Create Free Account
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="contact" className="footer">
        <div className="footer-top">
          <div className="footer-brand">Castle<span>Horn</span></div>
          <nav className="footer-links">
            <a href="#features" onClick={scrollTo("features")}>Features</a>
            <a href="#about" onClick={scrollTo("about")}>About</a>
            <a href="mailto:nikhilsyt.2010@gmail.com">Contact</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Privacy</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Terms</a>
          </nav>
        </div>
        <div className="footer-bottom">
          <p>A City of Austin Intern Project — Made with ♥ for UT Students</p>
          <p className="footer-copy">© 2026 CastleHorn. Hook 'Em! 🤘</p>
        </div>
      </footer>

    </div>
  );
}
