import { useState } from "react";
import { auth, googleProvider } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";

export const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const signInWithGoogle = async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: "80px auto", fontFamily: "sans-serif" }}>
      <h2>{isRegistering ? "Create Account" : "Welcome Back"}</h2>
      <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        {error && <p style={{ color: "red", fontSize: 13 }}>{error}</p>}
        <button type="submit">{isRegistering ? "Sign Up" : "Log In"}</button>
      </form>

      <button onClick={signInWithGoogle} style={{ marginTop: 12, width: "100%" }}>
        Sign in with Google
      </button>

      <p style={{ marginTop: 16, fontSize: 13 }}>
        {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          onClick={() => { setIsRegistering(!isRegistering); setError(""); }}
          style={{ background: "none", border: "none", color: "blue", cursor: "pointer" }}
        >
          {isRegistering ? "Log in" : "Sign up"}
        </button>
      </p>

      {auth.currentUser && (
        <div style={{ marginTop: 24 }}>
          <p>Signed in as: {auth.currentUser.email}</p>
          <button onClick={logout}>Log Out</button>
        </div>
      )}
    </div>
  );
};
