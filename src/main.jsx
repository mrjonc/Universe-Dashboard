import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Calendar from "./pages/Calendar/Calendar.jsx";
import Roster from "./pages/Roster/Roster.jsx";
import Champions from "./pages/Champions/Champions.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Calendar />,
      },

      {
        path: "/roster",
        element: <Roster />,
      },

      {
        path: "/champions",
        element: <Champions />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
