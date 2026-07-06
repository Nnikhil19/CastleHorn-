# CastleHorn Production Readiness

This is the launch checklist for making CastleHorn production ready and credible for investors.

## Critical Before Launch

- Firebase security rules: restrict listing writes to verified UT users, restrict admin mutations to approved admin emails/custom claims, restrict proof-of-occupancy files to admins and the listing owner, and validate file size/type.
- Server-side admin authorization: move approve/reject/delete behind Firebase Cloud Functions or custom claims. Client-side admin hiding is not sufficient security.
- Persistent profiles and reviews: move profiles, listing reviews, and platform reviews out of `localStorage` into Firestore so data follows users across devices.
- Email verification enforcement: keep the current client checks, then mirror them in Firestore/Storage rules.
- Content moderation: add report listing/profile, block user, review queue notes, rejection reason, and audit trail.
- Legal review: the app now has starter Terms, Privacy, and Safety pages, but counsel should review them before public launch.
- Production Firebase config: use environment variables for Firebase config and admin email allowlist; do not rely on hardcoded project settings for deploys.
- Error monitoring: add Sentry, LogRocket, Firebase Crashlytics for web, or equivalent.
- Analytics: add funnel events for search, listing view, contact reveal, listing submitted, listing approved, signup started, verification completed.
- Abuse/rate limiting: prevent spam listings, review spam, file upload abuse, and repeated auth attempts.

## Investor Demo Polish

- Seed the Firebase project with 5-10 real approved listings from consenting testers so the homepage, browse, and map do not look empty.
- Add a demo admin email to `VITE_ADMIN_EMAILS` before presenting admin controls.
- Use real apartment photos with permission; avoid stock or fake examples.
- Confirm Google Maps embeds load for every seeded address.
- Walk through a single polished story: UT signup, profile, listing submission, admin approval, renter search, contact reveal.

## Product Features Still Needed

- Saved listings and saved searches.
- Listing status dashboard for subletters.
- Admin notes, reviewer identity, rejection reason, and resubmission flow.
- Verified occupancy badge after approval.
- Better search ranking by distance to campus, price, and date overlap.
- Profile search/filter by roommate habits.
- Real review model tied to completed stays or verified interactions.
- Contact safety controls, including masked email or rate-limited contact reveal.
- Notifications for listing approved/rejected and new matching listings.
- Mobile QA pass for every route.

## Engineering Hardening

- Add unit tests for filtering, UT email validation, listing status transitions, and form validation.
- Add Playwright smoke tests for homepage, browse, create listing validation, listing detail, profile, reviews, and admin.
- Code split Firebase/admin routes to reduce the production bundle warning.
- Add loading skeletons and retry states for Firestore failures.
- Add image compression before upload.
- Add file size limits and client-side validation for photos/proof documents.
- Add CI with lint, build, and smoke tests.
- Add Firestore indexes for queries once server-side filtering expands.

## Current Known Gaps

- Admin UI now fails closed unless `VITE_ADMIN_EMAILS` is set, but true security still requires Firebase rules/custom claims.
- Profiles and reviews are still local-device data.
- Starter legal/safety pages exist, but they are not lawyer-reviewed production policies.
- Empty states are polished, but investor demos should use real approved data.
