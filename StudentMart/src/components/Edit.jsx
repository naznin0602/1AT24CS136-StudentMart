
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Brand } from "./Login.jsx";

const API = "http://localhost:5002/api/auth";

function Edit({ token, user, onUserUpdate }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "password" ? "password" : "profile";

  const [form, setForm] = useState({
    usn: user?.usn || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch(`${API}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Could not load profile.");

        if (active) {
          setForm({
            usn: data.user.usn || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            address: data.user.address || "",
          });
          onUserUpdate(data.user);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [token]);

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function saveProfile(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const response = await fetch(`${API}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          usn: form.usn,
          email: form.email,
          phone: form.phone,
          address: form.address,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not update profile.");

      setForm({
        usn: data.user.usn || "",
        email: data.user.email || "",
        phone: data.user.phone || "",
        address: data.user.address || "",
      });
      onUserUpdate(data.user);
      setMessage("Your profile has been updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 6 || newPassword.length > 72) {
      setError("Password must contain 6–72 characters.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API}/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not change password.");

      setMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="portal">
      <aside className="sidebar">
        <Brand />
        <p className="sidebar-label">WORKSPACE</p>
        <Link className="side-link" to="/dashboard">▦ &nbsp; Dashboard</Link>
        <Link className="side-link" to="/profile">♙ &nbsp; My Profile</Link>
        <Link className="side-link selected" to="/edit">✎ &nbsp; Edit Profile</Link>
        <div className="sidebar-bottom">
          <Link className="side-link side-logout" to="/logout">↪ &nbsp; Logout</Link>
        </div>
      </aside>

      <section className="portal-main">
        <header className="portal-topbar">
          <div>
            <span className="eyebrow">ACCOUNT SETTINGS</span>
            <h1>{mode === "password" ? "Password & Security" : "Edit Profile"}</h1>
          </div>
          <Link className="primary-small" to="/profile">View Profile</Link>
        </header>

        {loading && <p className="muted">Loading your information...</p>}

        {!loading && (
          <section className="edit-card">
            <div className="edit-tabs">
              <button
                type="button"
                className={mode === "profile" ? "edit-tab active" : "edit-tab"}
                onClick={() => {
                  setSearchParams({});
                  setError("");
                  setMessage("");
                }}
              >
                ✎ Profile Details
              </button>
              <button
                type="button"
                className={mode === "password" ? "edit-tab active" : "edit-tab"}
                onClick={() => {
                  setSearchParams({ mode: "password" });
                  setError("");
                  setMessage("");
                }}
              >
                ♢ Change Password
              </button>
            </div>

            <p className="edit-intro">
              {mode === "password"
                ? "Choose a new password to keep your account secure."
                : "Keep your student information accurate and up to date."}
            </p>

            {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>}

            {mode === "profile" ? (
              <form className="auth-form edit-form" onSubmit={saveProfile}>
                <div className="form-group">
                  <label htmlFor="edit-usn">University Seat Number (USN)</label>
                  <input id="edit-usn" name="usn" value={form.usn}
                    onChange={change} required />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-email">Email address</label>
                  <input id="edit-email" name="email" type="email"
                    value={form.email} onChange={change} required />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-phone">Phone number (optional)</label>
                  <input id="edit-phone" name="phone" type="tel"
                    placeholder="Add your phone number" value={form.phone}
                    onChange={change} />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-address">Address (optional)</label>
                  <textarea id="edit-address" name="address" rows={3}
                    placeholder="Add your address" value={form.address}
                    onChange={change} />
                </div>

                <button className="auth-button" disabled={saving}>
                  {saving ? "Saving changes..." : "Save Changes →"}
                </button>
              </form>
            ) : (
              <form className="auth-form edit-form" onSubmit={changePassword}>
                <div className="form-group">
                  <label htmlFor="current-password">Current password</label>
                  <input id="current-password" type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    autoComplete="current-password" required />
                </div>

                <div className="form-group">
                  <label htmlFor="new-password">New password</label>
                  <input id="new-password" type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    minLength={6} maxLength={72}
                    autoComplete="new-password" required />
                </div>

                <button className="auth-button" disabled={saving}>
                  {saving ? "Updating password..." : "Update Password →"}
                </button>
              </form>
            )}
          </section>
        )}
      </section>
    </main>
  );
}

export default Edit;
