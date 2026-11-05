import { lazy, Suspense } from "react";
import LoadingSpinner from "./components/animations/LoadingSpinner.jsx";

const Calendar = lazy(() => import("./pages/Calendar/Calendar.jsx"));
const Roster = lazy(() => import("./pages/Roster/Roster.jsx"));
const Champions = lazy(() => import("./pages/Champions/Champions.jsx"));
const Login = lazy(() => import("./pages/login_register/Login.jsx"));
const Register = lazy(() => import("./pages/login_register/Register.jsx"));

function withLoading(Page) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Page />
    </Suspense>
  );
}

export function CalendarPage() {
  return withLoading(Calendar);
}

export function RosterPage() {
  return withLoading(Roster);
}

export function ChampionsPage() {
  return withLoading(Champions);
}

export function LoginPage() {
  return withLoading(Login);
}

export function RegisterPage() {
  return withLoading(Register);
}
