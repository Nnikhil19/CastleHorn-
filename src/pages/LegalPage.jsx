import { Link, useLocation } from "react-router-dom";
import "./Sublets.css";

const PAGES = {
  "/terms": {
    eyebrow: "Terms",
    title: "Terms of Use",
    sections: [
      {
        heading: "CastleHorn is a listing platform",
        body: "CastleHorn helps UT Austin students discover and share sublet listings. CastleHorn does not broker leases, collect rent, hold deposits, verify legal lease rights, or guarantee any rental agreement.",
      },
      {
        heading: "Users are responsible for agreements",
        body: "Subletters and renters are responsible for confirming lease permissions, roommate approval, payment terms, move-in details, and any written agreement before exchanging money or keys.",
      },
      {
        heading: "Listings may be reviewed or removed",
        body: "CastleHorn may review, reject, hide, or remove listings that appear inaccurate, unsafe, misleading, abusive, or outside the UT student community.",
      },
    ],
  },
  "/privacy": {
    eyebrow: "Privacy",
    title: "Privacy Policy",
    sections: [
      {
        heading: "Information collected",
        body: "CastleHorn uses account email, profile details, listing details, uploaded listing photos, proof-of-occupancy files, and contact information to operate the sublet marketplace.",
      },
      {
        heading: "What is public",
        body: "Approved listings may show photos, neighborhood, address, rent, dates, host name, host contact details, and profile information. Proof-of-occupancy files should be restricted to review workflows before launch.",
      },
      {
        heading: "Before production launch",
        body: "Production Firebase rules should limit access to private documents, uploaded proof files, admin actions, and user-owned profile data.",
      },
    ],
  },
  "/safety": {
    eyebrow: "Safety",
    title: "Sublet Safety Guide",
    sections: [
      {
        heading: "Verify before paying",
        body: "Confirm the address, lease dates, rent amount, utility costs, and the host's right to sublet. Avoid paying deposits before seeing documentation and speaking with the host.",
      },
      {
        heading: "Use UT identity signals",
        body: "Prefer UT email communication, compare profile information, and keep important agreements in writing. If anything feels rushed or inconsistent, slow down.",
      },
      {
        heading: "Report suspicious listings",
        body: "A production launch should include reporting and moderation controls. Until then, do not proceed with listings that ask for unusual payment methods or refuse basic verification.",
      },
    ],
  },
};

export default function LegalPage() {
  const { pathname } = useLocation();
  const page = PAGES[pathname] || PAGES["/terms"];

  return (
    <div className="sub-page">
      <nav className="sub-nav">
        <Link to="/" className="sub-brand">
          <span className="sub-brand-icon">C</span>
          <span className="sub-brand-text">Castle<span>Horn</span></span>
        </Link>
        <Link to="/sublets" className="sub-back">Browse listings</Link>
      </nav>

      <main className="simple-page">
        <p className="sub-browse-eyebrow">{page.eyebrow}</p>
        <h1>{page.title}</h1>
        {page.sections.map((section) => (
          <section className="simple-section" key={section.heading}>
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </main>
    </div>
  );
}
