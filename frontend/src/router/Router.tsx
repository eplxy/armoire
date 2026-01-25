import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import Layout from "../components/Layout";
import { useAuthentication } from "../hooks/useAuthentication";
import ArticleView from "../views/ArticleView";
import ClothingView from "../views/ClothingView";
import IndexView from "../views/IndexView";
import LandingView from "../views/LandingView";
import LoginView from "../views/LoginView";
import NotFoundView from "../views/NotFoundView";
import OutfitsView from "../views/OutfitsView";
import RegisterView from "../views/RegisterView";

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
        <Route
          path="/clothing/:clothingId"
          element={
            isLoggedIn ? (
              <Layout unlockHeight>
                <ArticleView />
              </Layout>
            ) : (
              <Navigate to="/landing" />
            )
          }
        />

        <Route path="/login" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />

        <Route path="/landing" element={<LandingView />} />
        
        <Route path="*" element={<NotFoundView headerless/>} />
      </Routes>
    </BrowserRouter>
  );
}
