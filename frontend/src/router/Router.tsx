import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import Layout from "../components/Layout";
import IndexView from "../views/IndexView";
import LoginView from "../views/LoginView";
import { useAuthentication } from "../hooks/useAuthentication";
import LandingView from "../views/LandingView";
import RegisterView from "../views/RegisterView";

export default function Router() {
  const { isLoggedIn } = useAuthentication();

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route
            index
            path="/"
            element={!isLoggedIn ? <Navigate to="/landing" /> : <IndexView />}
          />
        </Route>
        <Route path="/login" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />

        <Route path="/landing" element={<LandingView />} />
      </Routes>
    </BrowserRouter>
  );
}
