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

// Static demo listings shown beneath any user-created ones.
const SEED_LISTINGS = [
  {
    id: "seed-1",
    title: "Apartment Room",
    dates: "Dec 15, 2026 – Jan 08, 2027",
    term: "weeks",
    price: 650,
    priceUnit: "per stay",
    desc: "One bedroom and private bathroom available while I am away for winter break.",
    postedBy: "Sarah M.",
  },
  {
    id: "seed-2",
    title: "High-Rise Room",
    dates: "Jun 01, 2026 – Aug 12, 2026",
    term: "summer",
    price: 850,
    priceUnit: "per month",
    desc: "One bedroom available for the summer. The other roommates are UT students.",
    postedBy: "Alex R.",
  },
  {
    id: "seed-3",
    title: "Condo Room",
    dates: "May 25, 2026 – Jul 31, 2026",
    term: "summer",
    price: 720,
    priceUnit: "per month",
    desc: "Large private bedroom available for the summer. Located right next to the UT bus stop.",
    postedBy: "Jordan K.",
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

// Persist a new listing to Firestore so every user sees it.
export async function addListing(listing) {
  await addDoc(listingsCol, { ...listing, createdAt: serverTimestamp() });
}
