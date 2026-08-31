import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import styles from "./navbar.module.css";

function NavBar() {
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error("Erro ao fazer logout:", error.message);
    }
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      <img
        src="/wwe_universe.png"
        alt="Logo do WWE 2K26"
        width="150px"
        className={styles.logo}
      />

      <button
        className={styles.menuToggle}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      <div className={`${styles.btn} ${isOpen ? styles.active : ""}`}>
        <Link to="/" onClick={closeMenu}>
          CALENDAR
        </Link>
        <Link to="/roster" onClick={closeMenu}>
          ROSTER
        </Link>
        <Link to="/champions" onClick={closeMenu}>
          CHAMPIONS
        </Link>

        {user && (
          <button onClick={handleLogout} className={styles.logoutBtn}>
            SAIR
          </button>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
