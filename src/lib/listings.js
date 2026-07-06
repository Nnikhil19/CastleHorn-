import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

const listingsCol = collection(db, "listings");
const FIRESTORE_TIMEOUT_MS = 5000;

export const TERM_LABELS = {
  weeks: "1-3 Weeks",
  summer: "Summer (May-Aug)",
  winter: "Winter (Dec-Jan)",
};

export const FEATURE_LABELS = {
  cleanliness: "Cleanliness",
  communication: "Communication",
  cheap: "Cheap Rent",
  maintenance: "Good Maintenance",
  security: "Security / Trust",
};

export const isVerifiedEmail = (email = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());

export function listingImage(listing) {
  return listing?.photos?.[0] || listing?.image || "";
}

export function listingImageFallback() {
  return "";
}

export async function getListings({ includePending = false } = {}) {
  try {
    const snap = await Promise.race([
      getDocs(query(listingsCol, orderBy("createdAt", "desc"))),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Listing request timed out")), FIRESTORE_TIMEOUT_MS)
      ),
    ]);
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return includePending ? all : all.filter((l) => !l.underReview && l.status !== "rejected");
  } catch (err) {
    console.error("Failed to load listings from Firestore:", err);
    return [];
  }
}

export async function getListingById(id) {
  const all = await getListings({ includePending: true });
  return all.find((l) => String(l.id) === String(id)) ?? null;
}

export async function addListing(listing) {
  await addDoc(listingsCol, {
    ...listing,
    underReview: true,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

export async function approveListing(id) {
  await updateDoc(doc(db, "listings", id), {
    underReview: false,
    status: "approved",
    reviewedAt: serverTimestamp(),
  });
}

export async function rejectListing(id) {
  await updateDoc(doc(db, "listings", id), {
    underReview: false,
    status: "rejected",
    reviewedAt: serverTimestamp(),
  });
}

export async function removeListing(id) {
  await deleteDoc(doc(db, "listings", id));
}

const reviewKey = (id) => `ch_reviews_${id}`;

export function getReviews(listingId) {
  try {
    return JSON.parse(localStorage.getItem(reviewKey(listingId)) || "[]");
  } catch {
    return [];
  }
}

export function addReview(listingId, { reviewer, text }) {
  const existing = getReviews(listingId);
  const updated = [{ reviewer, text, ts: Date.now() }, ...existing];
  localStorage.setItem(reviewKey(listingId), JSON.stringify(updated));
  return updated;
}
