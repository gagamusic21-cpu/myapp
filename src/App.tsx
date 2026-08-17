import React, { useEffect } from "react";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import { StoreProvider } from "./lib/store";
import { ContentProvider } from "./data/content";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchOverlay from "./components/SearchOverlay";
import { Toasts } from "./components/ui";
import Home from "./pages/Home";
import CampusPage from "./pages/CampusPage";
import DepartmentPage from "./pages/DepartmentPage";
import SubjectPage from "./pages/SubjectPage";
import { ExplainedIndex, ExplainedDetail } from "./pages/ExplainedPages";
import AdminPage from "./pages/AdminPage";
import { AnnouncementsPage, ChatPage, NotFoundPage, ProfilePage } from "./pages/UtilityPages";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);
  return null;
}

function Shell() {
  return (
    <div className="min-h-screen flex flex-col ambient">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/campus/:campusId" element={<CampusPage />} />
          <Route path="/campus/freshman/subject/:subjectId" element={<SubjectPage />} />
          <Route path="/campus/:campusId/dept/:deptId" element={<DepartmentPage />} />
          <Route path="/explained" element={<ExplainedIndex />} />
          <Route path="/explained/:deptId" element={<ExplainedDetail />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <SearchOverlay />
      <Toasts />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <ContentProvider>
        <HashRouter>
          <Shell />
        </HashRouter>
      </ContentProvider>
    </StoreProvider>
  );
}
