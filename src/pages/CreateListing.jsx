import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addListing, FEATURE_LABELS, isVerifiedEmail, isAustinAddress } from "../lib/listings";
import { auth, storage } from "../config/firebase";
import { Logo } from "../components/icons";
import "./Sublets.css";

const MAX_PHOTO_MB = 8;
const MAX_PROOF_MB = 12;

const formatDate = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

async function uploadFiles(files, folder) {
  const uploads = Array.from(files).map(async (file) => {
    const safeName = file.name.replace(/[^a-z0-9._-]/gi, "_");
    const fileRef = ref(storage, `${folder}/${Date.now()}-${crypto.randomUUID()}-${safeName}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  });
  return Promise.all(uploads);
}

const fileSizeMb = (file) => file.size / (1024 * 1024);

export default function CreateListing() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    title: "",
    startDate: "",
    endDate: "",
    term: "weeks",
    monthlyRent: "",
    desc: "",
    name: "",
    location: "",
    address: "",
    phone: "",
    contact: "",
  });
  const [features, setFeatures] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [proof, setProof] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState({});

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (current) => {
      setUser(current);
      try {
        setProfile(JSON.parse(localStorage.getItem("ch_profileData") || "{}"));
      } catch {
        setProfile({});
      }
      if (current) {
        setForm((f) => ({
          ...f,
          name: f.name || current.displayName || "",
          contact: f.contact || current.email || "",
        }));
      }
    });
    return unsub;
  }, []);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleFeature = (f) =>
    setFeatures((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const price = parseInt(form.monthlyRent, 10);

    if (!user) {
      setError("Please create or log into an account before posting.");
      return;
    }
    if (!profile.username) {
      setError("Please complete your CastleHorn profile before posting a listing.");
      return;
    }
    if (!isVerifiedEmail(user.email) || !isVerifiedEmail(form.contact)) {
      setError("Listings must use a valid contact email.");
      return;
    }
    if (!form.title || !form.startDate || !form.endDate || !form.desc || !form.name || !form.address || isNaN(price)) {
      setError("Please fill in every required field with a valid monthly rent.");
      return;
    }
    if (!isAustinAddress(form.address)) {
      setError("Listings must be located in Austin, TX. Please enter a full Austin address.");
      return;
    }
    if (form.endDate < form.startDate) {
      setError("End date must be after the start date.");
      return;
    }
    if (photos.length === 0) {
      setError("Please upload at least one real photo of the space.");
      return;
    }
    if (Array.from(photos).some((file) => !file.type.startsWith("image/") || fileSizeMb(file) > MAX_PHOTO_MB)) {
      setError(`Photos must be image files under ${MAX_PHOTO_MB} MB each.`);
      return;
    }
    if (!proof) {
      setError("Please upload proof of occupancy so admins can review the listing.");
      return;
    }
    if (!(proof.type.startsWith("image/") || proof.type === "application/pdf") || fileSizeMb(proof) > MAX_PROOF_MB) {
      setError(`Proof of occupancy must be an image or PDF under ${MAX_PROOF_MB} MB.`);
      return;
    }
    if (!form.phone && !form.contact) {
      setError("Please include either a phone number or email for direct contact.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const listingId = crypto.randomUUID();
      const [photoUrls, proofUrls] = await Promise.all([
        uploadFiles(photos, `listing-photos/${listingId}`),
        uploadFiles([proof], `occupancy-proof/${listingId}`),
      ]);

      await addListing({
        title: form.title.trim(),
        location: form.location.trim() || "Austin, TX",
        address: form.address.trim(),
        dates: `${formatDate(form.startDate)} - ${formatDate(form.endDate)}`,
        startDate: form.startDate,
        endDate: form.endDate,
        term: form.term,
        features,
        price,
        monthlyRent: price,
        priceUnit: "per month",
        desc: form.desc.trim(),
        postedBy: form.name.trim(),
        posterEmail: form.contact.trim(),
        phone: form.phone.trim(),
        photos: photoUrls,
        proofOfOccupancy: proofUrls[0],
        ownerUid: user.uid,
        posterUsername: profile.username || "",
      });
      setNotice("Listing submitted for manual review. It will appear after admin approval.");
      setTimeout(() => navigate("/sublets"), 1200);
    } catch (err) {
      console.error(err);
      setError("Could not save your listing. Check Firebase Storage permissions and try again.");
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
        <Link to="/sublets" className="sub-back">Back to listings</Link>
      </nav>

      <div className="cl-wrap">
        <div className="sub-panel cl-panel">
          <h3>Create a Listing</h3>
          <p className="cl-sub">Every listing needs real photos, a full property address, proof of occupancy, and admin review.</p>

          {!user && (
            <p className="cl-error">You need to log in before posting.</p>
          )}

          <form onSubmit={handleSubmit} className="sub-form">
            <label htmlFor="new-title">Place Name *</label>
            <input id="new-title" type="text" required placeholder="Apartment room in West Campus"
              value={form.title} onChange={(e) => setField("title", e.target.value)} />

            <label htmlFor="new-location">Neighborhood / Area *</label>
            <input id="new-location" type="text" required placeholder="West Campus, Austin"
              value={form.location} onChange={(e) => setField("location", e.target.value)} />

            <label htmlFor="new-address">Full Property Address * <span className="cl-inline-hint">(must be in Austin, TX)</span></label>
            <input id="new-address" type="text" required placeholder="2200 Nueces St, Austin, TX 78705"
              value={form.address} onChange={(e) => setField("address", e.target.value)} />

            <label>Dates Available *</label>
            <div className="cl-date-row">
              <div>
                <label htmlFor="new-start-date" className="cl-date-sublabel">Start</label>
                <input id="new-start-date" type="date" required
                  value={form.startDate} onChange={(e) => setField("startDate", e.target.value)} />
              </div>
              <div>
                <label htmlFor="new-end-date" className="cl-date-sublabel">End</label>
                <input id="new-end-date" type="date" required min={form.startDate || undefined}
                  value={form.endDate} onChange={(e) => setField("endDate", e.target.value)} />
              </div>
            </div>

            <label htmlFor="new-term">Lease Term</label>
            <select id="new-term" value={form.term} onChange={(e) => setField("term", e.target.value)}>
              <option value="weeks">1-3 Weeks</option>
              <option value="summer">Summer (May-Aug)</option>
              <option value="winter">Winter (Dec-Jan)</option>
            </select>

            <label>Traits</label>
            <div className="sub-checks">
              {Object.entries(FEATURE_LABELS).map(([value, label]) => (
                <label key={value} className="sub-check">
                  <input type="checkbox" checked={features.includes(value)} onChange={() => toggleFeature(value)} />
                  {label}
                </label>
              ))}
            </div>

            <label htmlFor="new-price">Monthly Rent ($) *</label>
            <input id="new-price" type="number" required min="1" placeholder="850"
              value={form.monthlyRent} onChange={(e) => setField("monthlyRent", e.target.value)} />

            <label htmlFor="new-photos">Upload Photos *</label>
            <input id="new-photos" type="file" accept="image/*" multiple required
              onChange={(e) => setPhotos(e.target.files)} />

            <label htmlFor="new-proof">Proof of Occupancy *</label>
            <input id="new-proof" type="file" accept="image/*,.pdf" required
              onChange={(e) => setProof(e.target.files?.[0] || null)} />

            <label htmlFor="new-desc">Description *</label>
            <textarea id="new-desc" rows={4} required placeholder="Room details, roommates, utilities, move-in notes."
              value={form.desc} onChange={(e) => setField("desc", e.target.value)} />

            <label htmlFor="new-name">Your Name *</label>
            <input id="new-name" type="text" required placeholder="Jane Longhorn"
              value={form.name} onChange={(e) => setField("name", e.target.value)} />

            <label htmlFor="new-contact">Contact Email *</label>
            <input id="new-contact" type="email" required placeholder="you@example.com"
              value={form.contact} onChange={(e) => setField("contact", e.target.value)} />

            <label htmlFor="new-phone">Phone Number</label>
            <input id="new-phone" type="tel" placeholder="Phone number renters can call or text"
              value={form.phone} onChange={(e) => setField("phone", e.target.value)} />

            {error && <p className="cl-error">{error}</p>}
            {notice && <p className="cl-success">{notice}</p>}

            <button type="submit" className="sub-btn" disabled={submitting || !user}>
              {submitting ? "Submitting..." : "Submit for Review"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
