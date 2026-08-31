import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Calendar from "./pages/Calendar/Calendar.jsx";
import Roster from "./pages/Roster/Roster.jsx";
import Champions from "./pages/Champions/Champions.jsx";
import Login from "./pages/login_register/Login.jsx";
import ProtectedRoute from "./components/ProtectedRouter.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import Register from "./pages/login_register/Register.jsx";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
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
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);
