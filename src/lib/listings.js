import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { mergeDemoListings } from "./demoListings";

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

// Austin ZIP codes fall in the 786xx/787xx range (plus some 733xx PO boxes).
const AUSTIN_ZIP = /\b7(8[67]\d\d|33\d\d)\b/;

// Loose check that a posted address is actually in Austin, TX. Requires the
// city name plus either a TX/Texas indicator or a valid Austin ZIP.
export const isAustinAddress = (address = "") => {
  const a = String(address).toLowerCase();
  const hasCity = a.includes("austin");
  const hasState = /\b(tx|texas)\b/.test(a);
  const hasZip = AUSTIN_ZIP.test(a);
  return hasCity && (hasState || hasZip);
};

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
    const all = mergeDemoListings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    return includePending ? all : all.filter((l) => !l.underReview && l.status !== "rejected");
  } catch (err) {
    console.error("Failed to load listings from Firestore:", err);
    return mergeDemoListings([]);
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

// ── Peer reviews on a listing (shared via Firestore) ──
const listingReviewsCol = collection(db, "listingReviews");

const byNewest = (a, b) => (b.ts ?? 0) - (a.ts ?? 0);

const reviewTs = (data) => {
  const created = data.createdAt;
  if (created?.toMillis) return created.toMillis();
  return data.ts ?? 0;
};

export async function getReviews(listingId) {
  try {
    const snap = await getDocs(query(listingReviewsCol, where("listingId", "==", String(listingId))));
    return snap.docs
      .map((d) => {
        const data = d.data();
        return { id: d.id, reviewer: data.reviewer, text: data.text, ts: reviewTs(data) };
      })
      .sort(byNewest);
  } catch (err) {
    console.error("Failed to load listing reviews:", err);
    return [];
  }
}

export async function addReview(listingId, { reviewer, text }) {
  await addDoc(listingReviewsCol, {
    listingId: String(listingId),
    reviewer,
    text,
    createdAt: serverTimestamp(),
  });
  return getReviews(listingId);
}

// ── Platform-wide reviews (shared via Firestore) ──
const platformReviewsCol = collection(db, "platformReviews");

export async function getPlatformReviews() {
  try {
    const snap = await getDocs(query(platformReviewsCol, orderBy("createdAt", "desc")));
    return snap.docs.map((d) => {
      const data = d.data();
      return { id: d.id, name: data.name, text: data.text, ts: reviewTs(data) };
    });
  } catch (err) {
    console.error("Failed to load platform reviews:", err);
    return [];
  }
}

export async function addPlatformReview({ name, text }) {
  await addDoc(platformReviewsCol, {
    name,
    text,
    createdAt: serverTimestamp(),
  });
  return getPlatformReviews();
}
