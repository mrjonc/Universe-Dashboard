import styles from "./navbar.module.css";
import { Link } from "react-router-dom";

function NavBar() {
  return (
    <>
      <nav className={styles.navbar}>
        <img
          src="../../public/wwe_universe.png"
          alt="Logo do WWE 2K26"
          width="150px"
          className={styles.logo}
        />

        <div className={styles.btn}>
          <Link to="/">CALENDAR</Link>
          <Link to="/roster">ROSTER</Link>
          <Link to="/champions">CHAMPIONS</Link>
        </div>
      </nav>
    </>
  );
}

export default NavBar;
