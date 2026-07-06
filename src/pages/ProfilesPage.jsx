import { Link, useNavigate } from "react-router-dom";
import "./ProfilePage.css";
import "./Sublets.css";

const PROFILE_KEY = "ch_profileData";
const ALL_PROFILES_KEY = "ch_all_profiles";

function loadProfiles() {
  const own = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
  const all = JSON.parse(localStorage.getItem(ALL_PROFILES_KEY) || "[]");
  const merged = own.username ? [own, ...all.filter((p) => p.username !== own.username)] : all;
  return merged.filter((p) => p.username);
}

export default function ProfilesPage() {
  const navigate = useNavigate();
  const profiles = loadProfiles();

  return (
    <div className="pp-page">
      <nav className="sub-nav">
        <Link to="/" className="sub-brand">
          <span className="sub-brand-icon">C</span>
          <span className="sub-brand-text">Castle<span>Horn</span></span>
        </Link>
        <Link to="/profile-setup" className="sub-back">Edit my profile</Link>
      </nav>

      <main className="profiles-wrap">
        <p className="sub-browse-eyebrow">Profiles</p>
        <h1 className="pp-name">CastleHorn profiles</h1>
        {profiles.length === 0 ? (
          <p className="sub-empty">No profiles have been created on this device yet.</p>
        ) : (
          <div className="profiles-grid">
            {profiles.map((profile) => {
              const initials = (profile.fullName || profile.username)
                .split(" ")
                .map((w) => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              return (
                <button className="profile-tile" key={profile.username}
                  onClick={() => navigate(`/profile/${profile.username}`)}>
                  <span className="pp-avatar">{initials}</span>
                  <span className="profile-tile-name">{profile.fullName || profile.username}</span>
                  <span className="profile-tile-user">@{profile.username}</span>
                  {profile.location && <span className="profile-tile-meta">{profile.location}</span>}
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
