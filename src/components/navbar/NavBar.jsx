import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/useAuth.js";
import styles from "./navbar.module.css";

function NavBar() {
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const handleLogout = async () => {
    setLogoutError("");
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to log out:", error.message);
      setLogoutError("Could not log out. Please try again.");
    }
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className={styles.navbar} aria-label="Main navigation">
      <img
        src="/wwe_universe.png"
        alt="WWE Universe logo"
        width="150"
        className={styles.logo}
      />

      <button
        type="button"
        className={styles.menuToggle}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        aria-controls="primary-navigation"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      <div
        id="primary-navigation"
        className={`${styles.btn} ${isOpen ? styles.active : ""}`}
      >
        {logoutError && <p role="alert">{logoutError}</p>}
        <NavLink to="/" end onClick={closeMenu}>
          CALENDAR
        </NavLink>
        <NavLink to="/roster" onClick={closeMenu}>
          ROSTER
        </NavLink>
        <NavLink to="/champions" onClick={closeMenu}>
          CHAMPIONS
        </NavLink>

        {user && (
          <button
            type="button"
            onClick={handleLogout}
            className={styles.logoutBtn}
          >
            LOG OUT
          </button>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
