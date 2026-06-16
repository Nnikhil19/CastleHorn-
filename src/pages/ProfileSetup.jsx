import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./ProfileSetup.css";

const SURVEY_QUESTIONS = [
  {
    name: "cleanliness",
    label: "🧹 How clean do you keep shared spaces?",
    options: [
      { value: "very-clean", label: "Very clean" },
      { value: "tidy", label: "Generally tidy" },
      { value: "relaxed", label: "Relaxed" },
      { value: "messy", label: "Pretty messy" },
    ],
  },
  {
    name: "sleep",
    label: "🌙 What's your sleep schedule?",
    options: [
      { value: "early-bird", label: "Early bird (before 10pm)" },
      { value: "average", label: "Average (10pm–midnight)" },
      { value: "night-owl", label: "Night owl (after midnight)" },
      { value: "irregular", label: "Irregular" },
    ],
  },
  {
    name: "guests",
    label: "🎉 How often do you have guests over?",
    options: [
      { value: "never", label: "Rarely / never" },
      { value: "sometimes", label: "A few times a month" },
      { value: "often", label: "Most weekends" },
      { value: "very-often", label: "Very frequently" },
    ],
  },
  {
    name: "noise",
    label: "🔊 What's your noise level at home?",
    options: [
      { value: "silent", label: "Silent, I need quiet" },
      { value: "low", label: "Low background noise is fine" },
      { value: "moderate", label: "Moderate, music/TV on often" },
      { value: "loud", label: "Loud, I like a lively place" },
    ],
  },
  {
    name: "dealbreaker",
    label: "🐾 Any dealbreakers?",
    options: [
      { value: "no-pets", label: "No pets" },
      { value: "no-smoking", label: "No smoking indoors" },
      { value: "no-couples", label: "No overnight partners" },
      { value: "none", label: "No dealbreakers" },
    ],
  },
];

const STORAGE_KEY = "ch_profileData";
const loadSaved = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
const save = (patch) => {
  const merged = { ...loadSaved(), ...patch };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
};

function Stepper({ step }) {
  return (
    <div className="ps-progress">
      {[1, 2, 3].map((n, i) => (
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

  const update = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const submitStep1 = (e) => {
    e.preventDefault();
    const fullName = (data.fullName || "").trim();
    const username = (data.username || "").trim();
    const email = (data.email || "").trim();
    const password = data.password || "";
    const confirmPassword = data.confirmPassword || "";

    const next = {
      fullName: fullName.length >= 2,
      username: /^[a-zA-Z0-9_]{3,20}$/.test(username),
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      password: password.length >= 6,
      confirmPassword: password === confirmPassword,
    };
    setErrors(next);
    if (Object.values(next).every(Boolean)) {
      save({ fullName, username, email });
      setStep(2);
    }
  };

  const submitStep2 = (e) => {
    e.preventDefault();
    save({
      bio: (data.bio || "").trim(),
      location: (data.location || "").trim(),
      birthday: data.birthday || "",
      gender: data.gender || "",
    });
    setStep(3);
  };

  const pickAnswer = (name, value) => setAnswers((a) => ({ ...a, [name]: value }));

  const submitStep3 = (e) => {
    e.preventDefault();
    const allAnswered = SURVEY_QUESTIONS.every((q) => answers[q.name]);
    setSurveyErr(!allAnswered);
    if (!allAnswered) return;
    const final = save({ survey: answers });
    setData(final);
    setDone(true);
  };

  const restart = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData({});
    setAnswers({});
    setErrors({});
    setDone(false);
    setStep(1);
  };

  const bioLen = (data.bio || "").length;

  return (
    <div className="ps-page">
      <Link to="/" className="ps-back">← Back to CastleHorn</Link>
      <div className="ps-card">
        <Stepper step={step} />

        {step === 1 && (
          <>
            <h1>Let's get started</h1>
            <p className="ps-subtitle">First, tell us the basics about you.</p>
            <form onSubmit={submitStep1} noValidate>
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName" type="text" placeholder="e.g. Jane Longhorn" autoComplete="name"
                value={data.fullName || ""} onChange={(e) => update("fullName", e.target.value)}
                className={errors.fullName === false ? "error" : ""}
              />
              {errors.fullName === false && <p className="ps-error visible">Please enter your full name.</p>}

              <label htmlFor="username">Username</label>
              <input
                id="username" type="text" placeholder="e.g. janelonghorn" autoComplete="username"
                value={data.username || ""} onChange={(e) => update("username", e.target.value)}
                className={errors.username === false ? "error" : ""}
              />
              {errors.username === false && (
                <p className="ps-error visible">Username must be 3–20 characters, letters/numbers/underscores only.</p>
              )}

              <label htmlFor="email">Email Address</label>
              <input
                id="email" type="email" placeholder="you@utexas.edu" autoComplete="email"
                value={data.email || ""} onChange={(e) => update("email", e.target.value)}
                className={errors.email === false ? "error" : ""}
              />
              {errors.email === false && <p className="ps-error visible">Please enter a valid email address.</p>}

              <label htmlFor="password">Password</label>
              <input
                id="password" type="password" placeholder="At least 6 characters" autoComplete="new-password"
                value={data.password || ""} onChange={(e) => update("password", e.target.value)}
                className={errors.password === false ? "error" : ""}
              />
              {errors.password === false && <p className="ps-error visible">Password must be at least 6 characters.</p>}

              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword" type="password" placeholder="Re-enter your password" autoComplete="new-password"
                value={data.confirmPassword || ""} onChange={(e) => update("confirmPassword", e.target.value)}
                className={errors.confirmPassword === false ? "error" : ""}
              />
              {errors.confirmPassword === false && <p className="ps-error visible">Passwords do not match.</p>}

              <button type="submit" className="ps-btn">Continue →</button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h1>About you</h1>
            <p className="ps-subtitle">Add some personality to your profile.</p>
            <form onSubmit={submitStep2} noValidate>
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio" placeholder="Tell the world a little about yourself…" maxLength={160}
                value={data.bio || ""} onChange={(e) => update("bio", e.target.value)}
              />
              <p className={`ps-charcount ${bioLen >= 160 ? "over" : ""}`}>{bioLen} / 160</p>

              <div className="ps-row">
                <div>
                  <label htmlFor="location">Location</label>
                  <input
                    id="location" type="text" placeholder="e.g. Austin, TX"
                    value={data.location || ""} onChange={(e) => update("location", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="birthday">Birthday</label>
                  <input
                    id="birthday" type="date"
                    value={data.birthday || ""} onChange={(e) => update("birthday", e.target.value)}
                  />
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
                <button type="button" className="ps-btn-back" onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className="ps-btn">Continue →</button>
              </div>
            </form>
          </>
        )}

        {step === 3 && !done && (
          <>
            <h1>Roommate habits</h1>
            <p className="ps-subtitle">Answer honestly, this helps others find a good match.</p>
            <form onSubmit={submitStep3} noValidate>
              {SURVEY_QUESTIONS.map((q) => (
                <div className="ps-survey-question" key={q.name}>
                  <label>{q.label}</label>
                  <div className="ps-options">
                    {q.options.map((opt) => (
                      <button
                        type="button"
                        key={opt.value}
                        className={answers[q.name] === opt.value ? "selected" : ""}
                        onClick={() => pickAnswer(q.name, opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {surveyErr && <p className="ps-error visible">Please answer all questions before continuing.</p>}

              <div className="ps-btn-group">
                <button type="button" className="ps-btn-back" onClick={() => setStep(2)}>← Back</button>
                <button type="submit" className="ps-btn">🎉 Create Profile</button>
              </div>
            </form>
          </>
        )}

        {step !== 3 || done ? null : null}
        <p className="ps-step-label">Step <span>{Math.min(step, 3)}</span> of 3</p>
      </div>

      {done && (
        <div className="ps-success-overlay visible">
          <div className="ps-success-box">
            <div className="ps-success-icon">🎉</div>
            <h2>Profile Created!</h2>
            <p>Welcome, {data.fullName}! Your profile (@{data.username}) has been saved.</p>
            <div className="ps-success-actions">
              <button className="ps-btn" onClick={() => navigate("/")}>Go to CastleHorn</button>
              <button className="ps-btn-restart" onClick={restart}>Create Another Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
