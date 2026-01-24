import { BrowserRouter, Route, Routes } from "react-router";
import Layout from "../components/Layout";
import IndexView from "../views/IndexView";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index path="/" element={<IndexView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
