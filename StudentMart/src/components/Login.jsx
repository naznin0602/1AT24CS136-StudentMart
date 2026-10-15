
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const API = "http://localhost:5002/api/auth";

function Login({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed.");

      onLogin(data);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Brand />
        <header className="auth-heading">
          <span className="eyebrow">WELCOME BACK</span>
          <h1>Welcome back!</h1>
          <p>Sign in to continue to your student portal.</p>
        </header>

        {location.state?.message && (
          <p className="success-message">{location.state.message}</p>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="Enter your password"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button className="auth-button" disabled={loading}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <p className="auth-footer">
          New to StudentMart? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}

export function Brand() {
  return (
    <div className="brand">
      <div className="brand-logo">S</div>
      <div className="brand-copy">
        <h2>StudentMart</h2>
        <p>Your student space</p>
      </div>
    </div>
  );
}

export default Login;
