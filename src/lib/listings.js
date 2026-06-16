const STORAGE_KEY = "ch_sublets";

export const TERM_LABELS = {
  weeks: "1–3 Weeks",
  summer: "Summer (May–Aug)",
  winter: "Winter (Dec–Jan)",
};

const SEED_LISTINGS = [
  {
    id: 1,
    title: "Apartment Room",
    dates: "Dec 15, 2026 – Jan 08, 2027",
    term: "weeks",
    price: 650,
    priceUnit: "per stay",
    desc: "One bedroom and private bathroom available while I am away for winter break.",
    postedBy: "Sarah M.",
  },
  {
    id: 2,
    title: "High-Rise Room",
    dates: "Jun 01, 2026 – Aug 12, 2026",
    term: "summer",
    price: 850,
    priceUnit: "per month",
    desc: "One bedroom available for the summer. The other roommates are UT students.",
    postedBy: "Alex R.",
  },
  {
    id: 3,
    title: "Condo Room",
    dates: "May 25, 2026 – Jul 31, 2026",
    term: "summer",
    price: 720,
    priceUnit: "per month",
    desc: "Large private bedroom available for the summer. Located right next to the UT bus stop.",
    postedBy: "Jordan K.",
  },
];

export function getListings() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return SEED_LISTINGS;
  try {
    return JSON.parse(raw);
  } catch {
    return SEED_LISTINGS;
  }
}

export function addListing(listing) {
  const current = getListings();
  const newListing = {
    ...listing,
    id: current.length ? Math.max(...current.map((l) => l.id)) + 1 : 1,
  };
  const updated = [newListing, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
