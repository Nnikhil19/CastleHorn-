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

// Curated room/interior photos (Unsplash) used as placeholders for now.
const ROOM_IMAGES = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=900&q=80&auto=format&fit=crop",
];

// Fallback if a curated image fails to load.
export function listingImageFallback(listing) {
  const seed = encodeURIComponent(String(listing.id ?? listing.title ?? "castlehorn"));
  return `https://picsum.photos/seed/${seed}/900/600`;
}

// Deterministic room image per listing (so each card looks distinct & stable).
export function listingImage(listing) {
  if (listing.image) return listing.image;
  const key = String(listing.id ?? listing.title ?? "castlehorn");
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return ROOM_IMAGES[hash % ROOM_IMAGES.length];
}

// Static demo listings shown beneath any user-created ones.
const SEED_LISTINGS = [
  {
    id: "seed-1",
    title: "Apartment Room",
    location: "West Campus, Austin",
    dates: "Dec 15, 2026 – Jan 08, 2027",
    term: "weeks",
    features: ["cleanliness", "communication"],
    rating: 4.7,
    price: 650,
    priceUnit: "per stay",
    desc: "One bedroom and private bathroom available while I am away for winter break. Looking for a clean, quiet, and considerate roommate.",
    postedBy: "Sarah M.",
  },
  {
    id: "seed-2",
    title: "High-Rise Room",
    location: "Rio Grande, Austin",
    dates: "Jun 01, 2026 – Aug 12, 2026",
    term: "summer",
    features: ["cheap", "communication"],
    rating: 4.9,
    price: 850,
    priceUnit: "per month",
    desc: "One bedroom available for the summer. Perfect balance of affordability and quality. The other roommates are UT students.",
    postedBy: "Alex R.",
  },
  {
    id: "seed-3",
    title: "Condo Room",
    location: "North Campus, Austin",
    dates: "May 25, 2026 – Jul 31, 2026",
    term: "summer",
    features: ["cleanliness", "maintenance"],
    rating: 4.5,
    price: 720,
    priceUnit: "per month",
    desc: "Large private bedroom available for the summer. Well built unit with few maintenance problems. Located right next to the UT bus stop.",
    postedBy: "Jordan K.",
  },
  {
    id: "seed-4",
    title: "Co-op Shared Space",
    location: "Hyde Park, Austin",
    dates: "Jan 10, 2026 – May 15, 2026",
    term: "winter",
    features: ["communication", "security"],
    rating: 4.6,
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
