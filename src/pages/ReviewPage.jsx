import { useState } from "react";
import { Link } from "react-router-dom";
import "./Sublets.css";

const REVIEWS_KEY = "ch_platform_reviews";

function loadReviews() {
  return JSON.parse(localStorage.getItem(REVIEWS_KEY) || "[]");
}

export default function ReviewPage() {
  const [reviews, setReviews] = useState(loadReviews);
  const [name, setName] = useState("");
  const [text, setText] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    const next = [{ name: name.trim(), text: text.trim(), ts: Date.now() }, ...reviews];
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(next));
    setReviews(next);
    setName("");
    setText("");
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

      <main className="simple-page">
        <p className="sub-browse-eyebrow">Reviews</p>
        <h1>CastleHorn review page</h1>
        <form className="ld-review-form review-page-form" onSubmit={submit}>
          <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
          <textarea rows={4} placeholder="Leave feedback about CastleHorn or your sublet experience."
            value={text} onChange={(e) => setText(e.target.value)} required />
          <button className="ld-review-submit">Submit Review</button>
        </form>
        <div className="ld-review-list">
          {reviews.length === 0 ? (
            <p className="sub-empty">No platform reviews yet.</p>
          ) : reviews.map((review) => (
            <article className="ld-review-item" key={review.ts}>
              <p className="ld-review-author">{review.name}</p>
              <p className="ld-review-text">{review.text}</p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
