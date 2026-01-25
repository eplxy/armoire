import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import Layout from "../components/Layout";
import IndexView from "../views/IndexView";
import LoginView from "../views/LoginView";
import { useAuthentication } from "../hooks/useAuthentication";
import LandingView from "../views/LandingView";
import RegisterView from "../views/RegisterView";
import ClothingView from "../views/ClothingView";
import OutfitsView from "../views/OutfitsView";

export default function Router() {
  const { isLoggedIn } = useAuthentication();

  return (
    <BrowserRouter>
      <Routes>
        <Route element={isLoggedIn ? <Layout /> : <Navigate to="/landing" />}>
          <Route index path="/" element={<IndexView />} />
          <Route path="/outfits" element={<OutfitsView />} />
        </Route>
        <Route
          path="/clothing"
          element={
            isLoggedIn ? (
              <Layout unlockHeight>
                <ClothingView />
              </Layout>
            ) : (
              <Navigate to="/landing" />
            )
          }
        />

        <Route path="/login" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />

        <Route path="/landing" element={<LandingView />} />
      </Routes>
    </BrowserRouter>
  );
}
