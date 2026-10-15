
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Brand } from "./Login.jsx";

const API = "http://localhost:5002/api/auth";

function Profile({ token, user }) {
  const [profile, setProfile] = useState(user);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch(`${API}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Could not load profile.");
        if (active) setProfile(data.user);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [token]);

  return (
    <main className="portal">
      <aside className="sidebar">
        <Brand />
        <p className="sidebar-label">WORKSPACE</p>
        <Link className="side-link" to="/dashboard">▦ &nbsp; Dashboard</Link>
        <Link className="side-link selected" to="/profile">♙ &nbsp; My Profile</Link>
        <Link className="side-link" to="/edit">✎ &nbsp; Edit Profile</Link>
        <div className="sidebar-bottom">
          <Link className="side-link side-logout" to="/logout">↪ &nbsp; Logout</Link>
        </div>
      </aside>

      <section className="portal-main">
        <header className="portal-topbar">
          <div>
            <span className="eyebrow">YOUR ACCOUNT</span>
            <h1>My Profile</h1>
          </div>
          <Link className="primary-small" to="/edit">✎ Edit Profile</Link>
        </header>

        {loading && <p className="muted">Loading profile...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          <div className="profile-layout">
            <section className="identity-card">
              <div className="large-avatar">{(profile?.usn || "S").charAt(0)}</div>
              <h2>{profile?.usn || "Student"}</h2>
              <p>{profile?.email}</p>
              <span className="status-pill">● Account active</span>
              <Link to="/edit" className="identity-edit">Edit your details →</Link>
            </section>

            <section className="details-card">
              <span className="eyebrow">PERSONAL INFORMATION</span>
              <h2>Account details</h2>
              <div className="info-row">
                <span>USN</span><strong>{profile?.usn || "Not added"}</strong>
              </div>
              <div className="info-row">
                <span>Email address</span><strong>{profile?.email || "Not added"}</strong>
              </div>
              <div className="info-row">
                <span>Phone number</span><strong>{profile?.phone || "Not added"}</strong>
              </div>
              <div className="info-row">
                <span>Address</span><strong>{profile?.address || "Not added"}</strong>
              </div>
              <Link to="/edit?mode=password" className="security-link">
                ♢ &nbsp; Change account password →
              </Link>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

export default Profile;
