
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brand } from "./Login.jsx";

const API = "http://localhost:5002/api/auth";

function Dashboard({ token, user, onLogout }) {
  const navigate = useNavigate();
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

  function logout() {
    onLogout();
    navigate("/login", {
      replace: true,
      state: { message: "You have been logged out successfully." },
    });
  }

  return (
    <main className="portal">
      <aside className="sidebar">
        <Brand />
        <p className="sidebar-label">WORKSPACE</p>
        <Link className="side-link selected" to="/dashboard">▦ &nbsp; Dashboard</Link>
        <Link className="side-link" to="/profile">♙ &nbsp; My Profile</Link>
        <Link className="side-link" to="/edit">✎ &nbsp; Edit Profile</Link>
        <div className="sidebar-bottom">
          <button className="side-link side-logout" onClick={logout}>↪ &nbsp; Logout</button>
        </div>
      </aside>

      <section className="portal-main">
        <header className="portal-topbar">
          <div>
            <span className="eyebrow">STUDENT WORKSPACE</span>
            <h1>Dashboard</h1>
          </div>
          <button className="avatar" title="My profile" onClick={() => navigate("/profile")}>
            {(profile?.usn || "S").charAt(0)}
          </button>
        </header>

        <div className="welcome-banner">
          <div>
            <span className="banner-tag">YOUR SPACE. YOUR JOURNEY.</span>
            <h2>Hello, {profile?.usn || "Student"}! 👋</h2>
            <p>Everything you need to manage your student profile, all in one place.</p>
            <Link className="banner-button" to="/profile">View my profile →</Link>
          </div>
          <div className="banner-art" aria-hidden="true">✦</div>
        </div>

        {loading && <p className="muted">Loading your information...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          <>
            <h2 className="section-title">Your account overview</h2>
            <div className="overview-grid">
              <article className="overview-card">
                <div className="overview-icon blue">♙</div>
                <p>University Seat Number</p>
                <h3>{profile?.usn || "Not added"}</h3>
                <span>Student identification</span>
              </article>
              <article className="overview-card">
                <div className="overview-icon purple">✉</div>
                <p>Email address</p>
                <h3 className="email-value">{profile?.email || "Not added"}</h3>
                <span>Account contact</span>
              </article>
            </div>

            <h2 className="section-title">Quick actions</h2>
            <div className="quick-grid">
              <Link to="/profile" className="quick-card">
                <div className="quick-icon">♙</div>
                <h3>View Profile</h3>
                <p>See your saved student information.</p>
                <span>Open profile ↗</span>
              </Link>
              <Link to="/edit" className="quick-card">
                <div className="quick-icon">✎</div>
                <h3>Edit Details</h3>
                <p>Update your USN, email, phone or address.</p>
                <span>Make changes ↗</span>
              </Link>
              <Link to="/edit?mode=password" className="quick-card">
                <div className="quick-icon">♢</div>
                <h3>Security</h3>
                <p>Change your account password.</p>
                <span>Manage password ↗</span>
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default Dashboard;
