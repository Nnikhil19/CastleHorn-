export const DEMO_PROFILES = [
  {
    fullName: "Maya Patel",
    username: "mayapatel",
    email: "maya.demo@example.com",
    location: "West Campus, Austin",
    birthday: "2004-02-18",
    gender: "female",
    bio: "Quiet engineering student looking for clean, low-drama housing near campus.",
    survey: {
      cleanliness: "very-clean",
      sleep: "average",
      guests: "sometimes",
      noise: "low",
      dealbreaker: "no-smoking",
    },
    demo: true,
  },
  {
    fullName: "Jordan Lee",
    username: "jordanlee",
    email: "jordan.demo@example.com",
    location: "North Campus, Austin",
    birthday: "2003-09-07",
    gender: "nonbinary",
    bio: "Design major, early riser, and very clear communicator about shared spaces.",
    survey: {
      cleanliness: "tidy",
      sleep: "early-bird",
      guests: "never",
      noise: "silent",
      dealbreaker: "no-pets",
    },
    demo: true,
  },
  {
    fullName: "Alex Nguyen",
    username: "alexnguyen",
    email: "alex.demo@example.com",
    location: "Hyde Park, Austin",
    birthday: "2002-12-11",
    gender: "male",
    bio: "CS student subletting for internships and looking for straightforward handoffs.",
    survey: {
      cleanliness: "tidy",
      sleep: "night-owl",
      guests: "often",
      noise: "moderate",
      dealbreaker: "none",
    },
    demo: true,
  },
  {
    fullName: "Sofia Ramirez",
    username: "sofiaramirez",
    email: "sofia.demo@example.com",
    location: "Riverside, Austin",
    birthday: "2004-06-24",
    gender: "female",
    bio: "Pre-med student who values tidy kitchens, responsive hosts, and clear move-in plans.",
    survey: {
      cleanliness: "very-clean",
      sleep: "average",
      guests: "sometimes",
      noise: "low",
      dealbreaker: "no-smoking",
    },
    demo: true,
  },
];

export function mergeDemoProfiles(profiles) {
  const seen = new Set(profiles.map((profile) => profile.username));
  return [...profiles, ...DEMO_PROFILES.filter((profile) => !seen.has(profile.username))];
}

export function findDemoProfile(username) {
  return DEMO_PROFILES.find((profile) => profile.username === username);
}
