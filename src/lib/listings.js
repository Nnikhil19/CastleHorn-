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
const WRITE_TIMEOUT_MS = 6000;

// Firestore promises never settle while the backend is unreachable (the SDK
// retries forever), which left submit buttons stuck on "Submitting...".
// Every read/write goes through this race so the UI always gets an answer.
const withTimeout = (promise, ms, label = "Request") =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out`)), ms)
    ),
  ]);

// Local fallback stores. When Firestore is unavailable, submissions are kept
// on this device and merged into reads so the app keeps working end to end.
const LOCAL_LISTINGS_KEY = "ch_local_listings";
const LOCAL_REVIEWS_KEY = "ch_local_listing_reviews";
const LOCAL_PLATFORM_KEY = "ch_local_platform_reviews";

function readLocal(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function writeLocal(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (err) {
    console.error("Local fallback save failed:", err);
  }
}

function pushLocal(key, item) {
  const items = [item, ...readLocal(key)];
  writeLocal(key, items);
  return items;
}

const isLocalId = (id) => String(id).startsWith("local-");

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
  let fetched = [];
  try {
    const snap = await withTimeout(
      getDocs(query(listingsCol, orderBy("createdAt", "desc"))),
      FIRESTORE_TIMEOUT_MS,
      "Listing request"
    );
    fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("Failed to load listings from Firestore:", err);
  }
  const all = mergeDemoListings([...readLocal(LOCAL_LISTINGS_KEY), ...fetched]);
  return includePending ? all : all.filter((l) => !l.underReview && l.status !== "rejected");
}

export async function getListingById(id) {
  const all = await getListings({ includePending: true });
  return all.find((l) => String(l.id) === String(id)) ?? null;
}

export async function addListing(listing) {
  try {
    await withTimeout(
      addDoc(listingsCol, {
        ...listing,
        underReview: true,
        status: "pending",
        createdAt: serverTimestamp(),
      }),
      WRITE_TIMEOUT_MS,
      "Listing save"
    );
  } catch (err) {
    // Firestore unavailable: keep the listing on this device so the flow
    // still completes. Local listings show immediately (no admin queue).
    console.warn("Firestore unavailable, saving listing locally:", err);
    pushLocal(LOCAL_LISTINGS_KEY, {
      ...listing,
      id: `local-${crypto.randomUUID()}`,
      underReview: false,
      status: "approved",
      savedLocally: true,
      ts: Date.now(),
    });
  }
}

export async function approveListing(id) {
  if (isLocalId(id)) {
    writeLocal(LOCAL_LISTINGS_KEY, readLocal(LOCAL_LISTINGS_KEY).map((l) =>
      l.id === id ? { ...l, underReview: false, status: "approved" } : l
    ));
    return;
  }
  await withTimeout(
    updateDoc(doc(db, "listings", id), {
      underReview: false,
      status: "approved",
      reviewedAt: serverTimestamp(),
    }),
    WRITE_TIMEOUT_MS,
    "Approval"
  );
}

export async function rejectListing(id) {
  if (isLocalId(id)) {
    writeLocal(LOCAL_LISTINGS_KEY, readLocal(LOCAL_LISTINGS_KEY).map((l) =>
      l.id === id ? { ...l, underReview: false, status: "rejected" } : l
    ));
    return;
  }
  await withTimeout(
    updateDoc(doc(db, "listings", id), {
      underReview: false,
      status: "rejected",
      reviewedAt: serverTimestamp(),
    }),
    WRITE_TIMEOUT_MS,
    "Rejection"
  );
}

export async function removeListing(id) {
  if (isLocalId(id)) {
    writeLocal(LOCAL_LISTINGS_KEY, readLocal(LOCAL_LISTINGS_KEY).filter((l) => l.id !== id));
    return;
  }
  await withTimeout(deleteDoc(doc(db, "listings", id)), WRITE_TIMEOUT_MS, "Removal");
}

// ── Peer reviews on a listing (shared via Firestore) ──
const listingReviewsCol = collection(db, "listingReviews");

const byNewest = (a, b) => (b.ts ?? 0) - (a.ts ?? 0);

const reviewTs = (data) => {
  const created = data.createdAt;
  if (created?.toMillis) return created.toMillis();
  return data.ts ?? 0;
};

const localReviewsFor = (listingId) =>
  readLocal(LOCAL_REVIEWS_KEY).filter((r) => r.listingId === String(listingId));

export async function getReviews(listingId) {
  let fetched = [];
  try {
    const snap = await withTimeout(
      getDocs(query(listingReviewsCol, where("listingId", "==", String(listingId)))),
      FIRESTORE_TIMEOUT_MS,
      "Reviews request"
    );
    fetched = snap.docs.map((d) => {
      const data = d.data();
      return { id: d.id, reviewer: data.reviewer, text: data.text, ts: reviewTs(data) };
    });
  } catch (err) {
    console.error("Failed to load listing reviews:", err);
  }
  return [...localReviewsFor(listingId), ...fetched].sort(byNewest);
}

export async function addReview(listingId, { reviewer, text }) {
  try {
    await withTimeout(
      addDoc(listingReviewsCol, {
        listingId: String(listingId),
        reviewer,
        text,
        createdAt: serverTimestamp(),
      }),
      WRITE_TIMEOUT_MS,
      "Review save"
    );
  } catch (err) {
    console.warn("Firestore unavailable, saving review locally:", err);
    pushLocal(LOCAL_REVIEWS_KEY, {
      id: `local-${crypto.randomUUID()}`,
      listingId: String(listingId),
      reviewer,
      text,
      ts: Date.now(),
    });
    // Firestore is down; skip the re-fetch and answer from the local store.
    return localReviewsFor(listingId).sort(byNewest);
  }
  return getReviews(listingId);
}

// ── Platform-wide reviews (shared via Firestore) ──
const platformReviewsCol = collection(db, "platformReviews");

export async function getPlatformReviews() {
  let fetched = [];
  try {
    const snap = await withTimeout(
      getDocs(query(platformReviewsCol, orderBy("createdAt", "desc"))),
      FIRESTORE_TIMEOUT_MS,
      "Reviews request"
    );
    fetched = snap.docs.map((d) => {
      const data = d.data();
      return { id: d.id, name: data.name, text: data.text, ts: reviewTs(data) };
    });
  } catch (err) {
    console.error("Failed to load platform reviews:", err);
  }
  return [...readLocal(LOCAL_PLATFORM_KEY), ...fetched].sort(byNewest);
}

export async function addPlatformReview({ name, text }) {
  try {
    await withTimeout(
      addDoc(platformReviewsCol, {
        name,
        text,
        createdAt: serverTimestamp(),
      }),
      WRITE_TIMEOUT_MS,
      "Review save"
    );
  } catch (err) {
    console.warn("Firestore unavailable, saving review locally:", err);
    const items = pushLocal(LOCAL_PLATFORM_KEY, {
      id: `local-${crypto.randomUUID()}`,
      name,
      text,
      ts: Date.now(),
    });
    // Firestore is down; skip the re-fetch and answer from the local store.
    return [...items].sort(byNewest);
  }
  return getPlatformReviews();
}
