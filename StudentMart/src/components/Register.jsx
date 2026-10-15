
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brand } from "./Login.jsx";

const API = "http://localhost:5002/api/auth";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ usn: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    const usn = form.usn.trim().toUpperCase();
    const email = form.email.trim().toLowerCase();

    if (!usn || !email || !form.password) {
      setError("Please complete all three fields.");
      return;
    }

    if (form.password.length < 6 || form.password.length > 72) {
      setError("Password must contain 6–72 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usn, email, password: form.password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed.");

      navigate("/login", {
        replace: true,
        state: { message: "Account created successfully! Please sign in." },
      });
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
          <span className="eyebrow">JOIN THE COMMUNITY</span>
          <h1>Create your account</h1>
          <p>Just three details to get started.</p>
        </header>

        <form className="auth-form" onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="usn">University Seat Number (USN)</label>
            <input id="usn" name="usn" placeholder="Enter your USN"
              value={form.usn} onChange={change} required />
          </div>

          <div className="form-group">
            <label htmlFor="register-email">Email address</label>
            <input id="register-email" name="email" type="email"
              placeholder="you@example.com" value={form.email}
              onChange={change} required />
          </div>

          <div className="form-group">
            <label htmlFor="register-password">Password</label>
            <input id="register-password" name="password" type="password"
              placeholder="At least 6 characters" value={form.password}
              onChange={change} minLength={6} maxLength={72} required />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button className="auth-button" disabled={loading}>
            {loading ? "Creating account..." : "Create Account →"}
          </button>
        </form>

        <p className="auth-footer">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;
