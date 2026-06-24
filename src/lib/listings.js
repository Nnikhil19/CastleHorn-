import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const listingsCol = collection(db, "listings");

export const TERM_LABELS = {
  weeks: "1–3 Weeks",
  summer: "Summer (May–Aug)",
  winter: "Winter (Dec–Jan)",
};

export const FEATURE_LABELS = {
  cleanliness: "Cleanliness",
  communication: "Communication",
  cheap: "Cheap Rent",
  maintenance: "Good Maintenance",
  security: "Security / Trust",
};

// Deterministic placeholder image per listing (so each card looks distinct).
export function listingImage(listing) {
  if (listing.image) return listing.image;
  const seed = encodeURIComponent(String(listing.id ?? listing.title ?? "castlehorn"));
  return `https://picsum.photos/seed/${seed}/800/500`;
}

// Static demo listings shown beneath any user-created ones.
const SEED_LISTINGS = [
  {
    id: "seed-1",
    title: "Apartment Room",
    dates: "Dec 15, 2026 – Jan 08, 2027",
    term: "weeks",
    features: ["cleanliness", "communication"],
    price: 650,
    priceUnit: "per stay",
    desc: "One bedroom and private bathroom available while I am away for winter break. Looking for a clean, quiet, and considerate roommate.",
    postedBy: "Sarah M.",
  },
  {
    id: "seed-2",
    title: "High-Rise Room",
    dates: "Jun 01, 2026 – Aug 12, 2026",
    term: "summer",
    features: ["cheap", "communication"],
    price: 850,
    priceUnit: "per month",
    desc: "One bedroom available for the summer. Perfect balance of affordability and quality. The other roommates are UT students.",
    postedBy: "Alex R.",
  },
  {
    id: "seed-3",
    title: "Condo Room",
    dates: "May 25, 2026 – Jul 31, 2026",
    term: "summer",
    features: ["cleanliness", "maintenance"],
    price: 720,
    priceUnit: "per month",
    desc: "Large private bedroom available for the summer. Well built unit with few maintenance problems. Located right next to the UT bus stop.",
    postedBy: "Jordan K.",
  },
  {
    id: "seed-4",
    title: "Co-op Shared Space",
    dates: "Jan 10, 2026 – May 15, 2026",
    term: "winter",
    features: ["communication", "security"],
    price: 500,
    priceUnit: "per month",
    desc: "Great community environment. Focus on strong communication, respect for boundaries, and mutual trust.",
    postedBy: "Taylor P.",
  },
];

// Fetch all user-created listings from Firestore (newest first),
// followed by the static demo listings. Falls back to demos on error.
export async function getListings() {
  try {
    const snap = await getDocs(query(listingsCol, orderBy("createdAt", "desc")));
    const userListings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return [...userListings, ...SEED_LISTINGS];
  } catch (err) {
    console.error("Failed to load listings from Firestore:", err);
    return SEED_LISTINGS;
  }
}

// Look up a single listing by id (Firestore doc id or seed id).
export async function getListingById(id) {
  const all = await getListings();
  return all.find((l) => String(l.id) === String(id)) ?? null;
}

// Persist a new listing to Firestore so every user sees it.
export async function addListing(listing) {
  await addDoc(listingsCol, { ...listing, createdAt: serverTimestamp() });
}
