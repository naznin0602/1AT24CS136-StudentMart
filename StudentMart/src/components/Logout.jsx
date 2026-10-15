
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout({ onLogout }) {
  const navigate = useNavigate();

  useEffect(() => {
    onLogout();
    navigate("/login", {
      replace: true,
      state: { message: "You have been logged out successfully." },
    });
  }, []);

  return (
    <main className="auth-page">
      <section className="auth-card logout-card">
        <div className="loading-orb">✓</div>
        <h1>Signing you out</h1>
        <p>Your StudentMart session is being closed securely.</p>
      </section>
    </main>
  );
}

export default Logout;
