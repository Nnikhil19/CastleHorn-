import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import "./ProfileSetup.css";

const SURVEY_QUESTIONS = [
  {
    name: "cleanliness",
    label: "How clean do you keep shared spaces?",
    options: [
      { value: "very-clean", label: "Very clean" },
      { value: "tidy", label: "Generally tidy" },
      { value: "relaxed", label: "Relaxed" },
      { value: "messy", label: "Pretty messy" },
    ],
  },
  {
    name: "sleep",
    label: "What is your sleep schedule?",
    options: [
      { value: "early-bird", label: "Early bird" },
      { value: "average", label: "Average" },
      { value: "night-owl", label: "Night owl" },
      { value: "irregular", label: "Irregular" },
    ],
  },
  {
    name: "guests",
    label: "How often do you have guests over?",
    options: [
      { value: "never", label: "Rarely / never" },
      { value: "sometimes", label: "A few times a month" },
      { value: "often", label: "Most weekends" },
      { value: "very-often", label: "Very frequently" },
    ],
  },
  {
    name: "noise",
    label: "What is your noise level at home?",
    options: [
      { value: "silent", label: "I need quiet" },
      { value: "low", label: "Low background noise is fine" },
      { value: "moderate", label: "Music/TV on often" },
      { value: "loud", label: "Lively environment" },
    ],
  },
  {
    name: "dealbreaker",
    label: "Any dealbreakers?",
    options: [
      { value: "no-pets", label: "No pets" },
      { value: "no-smoking", label: "No smoking indoors" },
      { value: "no-couples", label: "No overnight partners" },
      { value: "none", label: "No dealbreakers" },
    ],
  },
];

const STORAGE_KEY = "ch_profileData";
const ALL_PROFILES_KEY = "ch_all_profiles";

const loadSaved = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

function saveProfile(patch) {
  const merged = { ...loadSaved(), ...patch };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  if (merged.username) {
    const all = JSON.parse(localStorage.getItem(ALL_PROFILES_KEY) || "[]");
    const withoutCurrent = all.filter((p) => p.username !== merged.username);
    localStorage.setItem(ALL_PROFILES_KEY, JSON.stringify([merged, ...withoutCurrent]));
  }
  return merged;
}

function Stepper({ step }) {
  return (
    <div className="ps-progress">
      {[1, 2, 3].map((n) => (
        <span key={n} style={{ display: "flex", alignItems: "center", flex: n === 3 ? "0 0 auto" : 1 }}>
          <span className={`ps-dot ${n < step ? "done" : n === step ? "active" : "inactive"}`}>
            {n < step ? "✓" : n}
          </span>
          {n !== 3 && <span className={`ps-line ${n < step ? "done" : ""}`} />}
        </span>
      ))}
    </div>
  );
}

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState(loadSaved);
  const [errors, setErrors] = useState({});
  const [answers, setAnswers] = useState(loadSaved().survey || {});
  const [surveyErr, setSurveyErr] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/auth?mode=register");
        return;
      }
      setData((d) => ({
        ...d,
        fullName: d.fullName || user.displayName || "",
        email: d.email || user.email || "",
      }));
    });
    return unsub;
  }, [navigate]);

  const update = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const submitStep1 = (e) => {
    e.preventDefault();
    const fullName = (data.fullName || "").trim();
    const username = (data.username || "").trim();
    const email = (data.email || "").trim();
    const next = {
      fullName: fullName.length >= 2,
      username: /^[a-zA-Z0-9_]{3,20}$/.test(username),
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    };
    setErrors(next);
    if (Object.values(next).every(Boolean)) {
      saveProfile({ fullName, username, email });
      setStep(2);
    }
  };

  const submitStep2 = (e) => {
    e.preventDefault();
    saveProfile({
      bio: (data.bio || "").trim(),
      location: (data.location || "").trim(),
      birthday: data.birthday || "",
      gender: data.gender || "",
    });
    setStep(3);
  };

  const submitStep3 = (e) => {
    e.preventDefault();
    const allAnswered = SURVEY_QUESTIONS.every((q) => answers[q.name]);
    setSurveyErr(!allAnswered);
    if (!allAnswered) return;
    const final = saveProfile({ survey: answers });
    setData(final);
    setDone(true);
  };

  const bioLen = (data.bio || "").length;

  return (
    <div className="ps-page">
      <Link to="/" className="ps-back">Back to CastleHorn</Link>
      <div className="ps-card">
        <Stepper step={step} />

        {step === 1 && (
          <>
            <h1>Set up your profile</h1>
            <p className="ps-subtitle">Your login is already created. Add the basics people will see.</p>
            <form onSubmit={submitStep1} noValidate>
              <label htmlFor="fullName">Full Name</label>
              <input id="fullName" type="text" placeholder="Jane Longhorn" autoComplete="name"
                value={data.fullName || ""} onChange={(e) => update("fullName", e.target.value)}
                className={errors.fullName === false ? "error" : ""} />
              {errors.fullName === false && <p className="ps-error visible">Please enter your full name.</p>}

              <label htmlFor="username">Username</label>
              <input id="username" type="text" placeholder="janelonghorn" autoComplete="username"
                value={data.username || ""} onChange={(e) => update("username", e.target.value)}
                className={errors.username === false ? "error" : ""} />
              {errors.username === false && (
                <p className="ps-error visible">Username must be 3-20 characters, letters/numbers/underscores only.</p>
              )}

              <label htmlFor="email">Verified Email</label>
              <input id="email" type="email" readOnly placeholder="you@example.com" autoComplete="email"
                value={data.email || ""} className={errors.email === false ? "error" : ""} />
              {errors.email === false && <p className="ps-error visible">Please use a valid email address.</p>}

              <button type="submit" className="ps-btn">Continue</button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h1>About you</h1>
            <p className="ps-subtitle">Add a little context for future roommates.</p>
            <form onSubmit={submitStep2} noValidate>
              <label htmlFor="bio">Bio</label>
              <textarea id="bio" placeholder="Tell people a little about yourself." maxLength={160}
                value={data.bio || ""} onChange={(e) => update("bio", e.target.value)} />
              <p className={`ps-charcount ${bioLen >= 160 ? "over" : ""}`}>{bioLen} / 160</p>

              <div className="ps-row">
                <div>
                  <label htmlFor="location">Location</label>
                  <input id="location" type="text" placeholder="Austin, TX"
                    value={data.location || ""} onChange={(e) => update("location", e.target.value)} />
                </div>
                <div>
                  <label htmlFor="birthday">Birthday</label>
                  <input id="birthday" type="date"
                    value={data.birthday || ""} onChange={(e) => update("birthday", e.target.value)} />
                </div>
              </div>

              <label htmlFor="gender">Gender <span className="ps-optional">(optional)</span></label>
              <select id="gender" value={data.gender || ""} onChange={(e) => update("gender", e.target.value)}>
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="nonbinary">Non-binary</option>
                <option value="other">Other</option>
              </select>

              <div className="ps-btn-group">
                <button type="button" className="ps-btn-back" onClick={() => setStep(1)}>Back</button>
                <button type="submit" className="ps-btn">Continue</button>
              </div>
            </form>
          </>
        )}

        {step === 3 && !done && (
          <>
            <h1>Roommate habits</h1>
            <p className="ps-subtitle">These answers help people decide whether a sublet is a good fit.</p>
            <form onSubmit={submitStep3} noValidate>
              {SURVEY_QUESTIONS.map((q) => (
                <div className="ps-survey-question" key={q.name}>
                  <label>{q.label}</label>
                  <div className="ps-options">
                    {q.options.map((opt) => (
                      <button type="button" key={opt.value}
                        className={answers[q.name] === opt.value ? "selected" : ""}
                        onClick={() => setAnswers((a) => ({ ...a, [q.name]: opt.value }))}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {surveyErr && <p className="ps-error visible">Please answer all questions before continuing.</p>}

              <div className="ps-btn-group">
                <button type="button" className="ps-btn-back" onClick={() => setStep(2)}>Back</button>
                <button type="submit" className="ps-btn">Create Profile</button>
              </div>
            </form>
          </>
        )}

        <p className="ps-step-label">Step <span>{Math.min(step, 3)}</span> of 3</p>
      </div>

      {done && (
        <div className="ps-success-overlay visible">
          <div className="ps-success-box">
            <div className="ps-success-icon">✓</div>
            <h2>Profile Created</h2>
            <p>Welcome, {data.fullName}. Your profile (@{data.username}) has been saved.</p>
            <div className="ps-success-actions">
              <button className="ps-btn" onClick={() => navigate(`/profile/${data.username}`)}>View Profile</button>
              <button className="ps-btn-restart" onClick={() => navigate("/")}>Go Home</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
