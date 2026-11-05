import NavBar from "./components/navbar/NavBar.jsx";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <>
      <a className="skipLink" href="#app-main">
        Skip to content
      </a>
      <NavBar />
      <main id="app-main" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  );
}

export default App;
