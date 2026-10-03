import { BrowserRouter, Routes, Route } from "react-router-dom";
import MarketingLayout from "./pages/MarketingLayout";
import Home from "./pages/Home";
import { Toaster } from "sonner";

import MainLayout from "./pages/MainLayout";
import Learn from "./pages/Learn";
import Courses from "./pages/Courses";
import Leaderboard from "./pages/Leaderboard";
import Shop from "./pages/Shop";
import Account from "./pages/Account";
import Lesson from "./pages/Lesson";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public Marketing Routes */}
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<Home />} />
          </Route>

          {/* Protected Main Routes */}
          <Route path="/lesson" element={<Lesson />} />
          <Route path="/lesson/:lessonId" element={<Lesson />} />

          <Route element={<MainLayout />}>
            <Route path="/learn" element={<Learn />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/account" element={<Account />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
