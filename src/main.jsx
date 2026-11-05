import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import ProtectedRoute from "./components/ProtectedRouter.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import {
  CalendarPage,
  ChampionsPage,
  LoginPage,
  RegisterPage,
  RosterPage,
} from "./routePages.jsx";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
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
        element: <CalendarPage />,
      },
      {
        path: "/roster",
        element: <RosterPage />,
      },
      {
        path: "/champions",
        element: <ChampionsPage />,
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
