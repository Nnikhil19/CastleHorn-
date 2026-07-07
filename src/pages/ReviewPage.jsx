import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPlatformReviews, addPlatformReview } from "../lib/listings";
import { Logo } from "../components/icons";
import "./Sublets.css";

export default function ReviewPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    getPlatformReviews()
      .then((data) => active && setReviews(data))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !text.trim() || submitting) return;
    setSubmitting(true);
    try {
      const next = await addPlatformReview({ name: name.trim(), text: text.trim() });
      setReviews(next);
      setName("");
      setText("");
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sub-page">
      <nav className="sub-nav">
        <Link to="/" className="sub-brand">
          <span className="sub-brand-icon"><Logo width={22} height={22} /></span>
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
          <button className="ld-review-submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
        <div className="ld-review-list">
          {loading ? (
            <p className="sub-empty">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="sub-empty">No platform reviews yet.</p>
          ) : reviews.map((review) => (
            <article className="ld-review-item" key={review.id}>
              <p className="ld-review-author">{review.name}</p>
              <p className="ld-review-text">{review.text}</p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
