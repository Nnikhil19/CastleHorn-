import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
  onAuthStateChanged,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import { isUTEmail } from "../lib/listings";
import "./AuthPage.css";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
    <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
  </svg>
);

export default function AuthPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode]         = useState(params.get("mode") === "register" ? "register" : "login");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) navigate("/");
    });
    return unsub;
  }, [navigate]);

  const clearError = () => setError("");

  const friendlyError = (code) => {
    const map = {
      "auth/email-already-in-use":  "An account with this email already exists.",
      "auth/invalid-email":          "Please enter a valid email address.",
      "auth/weak-password":          "Password must be at least 6 characters.",
      "auth/user-not-found":         "No account found with this email.",
      "auth/wrong-password":         "Incorrect password. Please try again.",
      "auth/too-many-requests":      "Too many attempts. Please try again later.",
      "auth/popup-closed-by-user":   "Sign-in popup was closed. Please try again.",
    };
    return map[code] ?? "Something went wrong. Please try again.";
  };

  const requireUTEmail = (value) => {
    if (!isUTEmail(value)) {
      throw new Error("CastleHorn accounts require a @utexas.edu or @my.utexas.edu email.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setLoading(true);
    try {
      requireUTEmail(email);
      if (mode === "register") {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
          await updateProfile(user, { displayName: name.trim() });
        }
        await sendEmailVerification(user);
        await signOut(auth);
        setError("Verification link sent. Verify your UT email, then log in to finish your profile.");
      } else {
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        requireUTEmail(user.email);
        if (!user.emailVerified) {
          sendEmailVerification(user).catch(() => {});
          setError("Please verify your UT email. We sent a new verification link.");
          return;
        }
        navigate("/");
      }
    } catch (err) {
      setError(err.code ? friendlyError(err.code) : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    clearError();
    setLoading(true);
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      if (!isUTEmail(user.email)) {
        await signOut(auth);
        setError("Please use a UT Austin Google account ending in @utexas.edu or @my.utexas.edu.");
        return;
      }
      navigate("/profile-setup");
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Animated blob background */}
      <div className="auth-blobs">
        <div className="auth-blob-a" />
        <div className="auth-blob-b" />
        <div className="auth-blob-c" />
      </div>

      <Link to="/" className="auth-back">Back to CastleHorn</Link>

      <div className="auth-card">
        <div className="auth-logo">Castle<span>Horn</span></div>

        <div className="auth-tabs">
          <button className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => { setMode("login"); clearError(); }}>
            Log in
          </button>
          <button className={`auth-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => { setMode("register"); clearError(); }}>
            Sign up
          </button>
        </div>

        <h2 className="auth-title">
          {mode === "login" ? "Welcome back" : "Make an account"}
        </h2>
        <p className="auth-sub">
          {mode === "login"
            ? "Log in with your verified UT email to post or contact hosts."
            : "Use a UT Austin email so every account can be verified."}
        </p>

        <button className="google-btn" onClick={handleGoogle} disabled={loading}>
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="divider"><span>or use your UT email</span></div>

        <form onSubmit={handleSubmit} noValidate>
          {mode === "register" && (
            <div className="field">
              <label htmlFor="auth-name">Full name</label>
              <input id="auth-name" type="text" placeholder="Jane Longhorn"
                value={name} onChange={(e) => setName(e.target.value)}
                required autoComplete="name" />
            </div>
          )}
          <div className="field">
            <label htmlFor="auth-email">Email</label>
            <input id="auth-email" type="email" placeholder="you@utexas.edu"
              value={email} onChange={(e) => setEmail(e.target.value)}
              required autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="auth-password">
              Password
              {mode === "register" && <span className="hint"> (min 6 characters)</span>}
            </label>
            <input id="auth-password" type="password" placeholder="Password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              required minLength={6}
              autoComplete={mode === "register" ? "new-password" : "current-password"} />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <button className="link-btn"
            onClick={() => { setMode(mode === "login" ? "register" : "login"); clearError(); }}>
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}
