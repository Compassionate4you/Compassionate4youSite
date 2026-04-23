import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import AdminDashboard from "../pages/AdminDashboard";
import HomeHealthPage from "../pages/HomeHealthPage";
import LocationsPage from "../pages/LocationsPage";
import PortalPage from "../pages/PortalPage";
import SchedulePage from "../pages/SchedulePage";
import LoginPage from "../pages/LoginPage";
import ContentEditor from "../pages/ContentEditor";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/home-health" element={<HomeHealthPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/portal" element={<PortalPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/content-editor" element={<ContentEditor />} />
        </Routes>
    );
}

export default AppRoutes;