import { useState } from "react";
import NavBar from "./components/navbar/NavBar.jsx";
import { Outlet } from "react-router-dom";

import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <NavBar />
      <Outlet />
      
    </>
  );
}

export default App;
