import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { LangProvider } from "./lib/i18n";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import ResetPassword from "./pages/ResetPassword";
import Artists from "./pages/Artists";
import ArtistDetail from "./pages/ArtistDetail";

function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/reset" element={<ResetPassword />} />
          <Route path="/artistes" element={<Artists />} />
          <Route path="/artistes/:slug" element={<ArtistDetail />} />
        </Routes>
      </BrowserRouter>
      <Toaster theme="dark" position="bottom-right" />
    </LangProvider>
  );
}

export default App;
