import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { findDemoProfile } from "../lib/demoProfiles";
import "./ProfilePage.css";

const PROFILE_KEY = "ch_profileData";
const ALL_PROFILES_KEY = "ch_all_profiles";

const SURVEY_LABELS = {
  cleanliness: {
    label: "Cleanliness",
    values: {
      "very-clean": "Very clean",
      tidy: "Generally tidy",
      relaxed: "Relaxed",
      messy: "Pretty messy",
    },
  },
  sleep: {
    label: "Sleep Schedule",
    values: {
      "early-bird": "Early bird",
      average: "Average",
      "night-owl": "Night owl",
      irregular: "Irregular",
    },
  },
  guests: {
    label: "Guests",
    values: {
      never: "Rarely / never",
      sometimes: "A few times a month",
      often: "Most weekends",
      "very-often": "Very frequently",
    },
  },
  noise: {
    label: "Noise Level",
    values: {
      silent: "Needs quiet",
      low: "Low background OK",
      moderate: "Music/TV often",
      loud: "Lively environment",
    },
  },
  dealbreaker: {
    label: "Dealbreakers",
    values: {
      "no-pets": "No pets",
      "no-smoking": "No smoking indoors",
      "no-couples": "No overnight partners",
      none: "No dealbreakers",
    },
  },
};

function getAge(birthday) {
  if (!birthday) return null;
  const diff = Date.now() - new Date(birthday).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default function ProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const own = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
    if (own.username === username) {
      setProfile(own);
      return;
    }
    const all = JSON.parse(localStorage.getItem(ALL_PROFILES_KEY) || "[]");
    const found = all.find((p) => p.username === username);
    if (found) setProfile(found);
    else if (findDemoProfile(username)) setProfile(findDemoProfile(username));
    else setNotFound(true);
  }, [username]);

  if (notFound) {
    return (
      <div className="pp-page">
        <nav className="sub-nav">
          <Link to="/" className="sub-brand">
            <span className="sub-brand-icon">C</span>
            <span className="sub-brand-text">Castle<span>Horn</span></span>
          </Link>
          <Link to="/sublets" className="sub-back">Listings</Link>
        </nav>
        <div className="pp-not-found">
          <p>Profile not found for @{username}</p>
          <Link to="/sublets" className="pp-back-btn">Browse Listings</Link>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const age = getAge(profile.birthday);
  const initials = (profile.fullName || profile.username || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const survey = profile.survey || {};

  return (
    <div className="pp-page">
      <nav className="sub-nav">
        <Link to="/" className="sub-brand">
          <span className="sub-brand-icon">C</span>
          <span className="sub-brand-text">Castle<span>Horn</span></span>
        </Link>
        <Link to="/sublets" className="sub-back">Listings</Link>
      </nav>

      <div className="pp-wrap">
        <div className="pp-card">
          <div className="pp-avatar">{initials}</div>
          <div className="pp-identity">
            <h1 className="pp-name">{profile.fullName || profile.username}</h1>
            <p className="pp-username">@{profile.username}</p>
            {(profile.location || age || profile.gender) && (
              <p className="pp-meta">
                {profile.location && <span>{profile.location}</span>}
                {profile.location && (age || profile.gender) && <span className="pp-dot">·</span>}
                {age && <span>{age} years old</span>}
                {age && profile.gender && <span className="pp-dot">·</span>}
                {profile.gender && (
                  <span style={{ textTransform: "capitalize" }}>
                    {profile.gender === "nonbinary" ? "Non-binary" : profile.gender}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        {profile.bio && (
          <div className="pp-section">
            <p className="pp-bio">"{profile.bio}"</p>
          </div>
        )}

        {Object.keys(survey).length > 0 && (
          <div className="pp-section">
            <h2 className="pp-section-title">Renter Habits</h2>
            <div className="pp-habits">
              {profile.gender && (
                <div className="pp-habit-row">
                  <div className="pp-habit-info">
                    <span className="pp-habit-label">Gender</span>
                    <span className="pp-habit-value">
                      {profile.gender === "nonbinary"
                        ? "Non-binary"
                        : profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
                    </span>
                  </div>
                </div>
              )}
              {Object.entries(SURVEY_LABELS).map(([key, meta]) => {
                const val = survey[key];
                if (!val) return null;
                return (
                  <div className="pp-habit-row" key={key}>
                    <div className="pp-habit-info">
                      <span className="pp-habit-label">{meta.label}</span>
                      <span className="pp-habit-value">{meta.values[val] ?? val}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {profile.email && (
          <div className="pp-section">
            <h2 className="pp-section-title">Contact</h2>
            <a href={`mailto:${profile.email}`} className="pp-email">{profile.email}</a>
          </div>
        )}
      </div>
    </div>
  );
}
