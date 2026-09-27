import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import LandingPage from "../pages/LandingPage";
import AdminDashboard from "../pages/AdminDashboard";
import HomeHealthPage from "../pages/HomeHealthPage";
import HospicePage from "../pages/HospicePage";
import LocationsPage from "../pages/LocationsPage";
import PortalPage from "../pages/PortalPage";
import SchedulePage from "../pages/SchedulePage";
import LoginPage from "../pages/LoginPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import Scheduling from "../pages/AcuityScheduling";

import ContentEditor from "../pages/ContentEditor";
import ClientSchedulingConfirmation from "../pages/ClientSchedulingConfirmation";
import ViewAppointmentDetailsPage from "../pages/ViewAppointmentDetailsPage";
function AppRoutes() {
    const location = useLocation();
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        // Move focus to the new page's main region after client-side navigation.
        // This gives keyboard and screen-reader users a clear starting point.
        document.getElementById("main-content")?.focus();
    }, [location.pathname]);

    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/home-health" element={<HomeHealthPage />} />
            <Route path="/hospice" element={<HospicePage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/portal" element={<PortalPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
                path="/AcuityScheduling"
                element={<Scheduling />}
            />
            <Route path="/admin/content-editor" element={<ContentEditor />} />
            <Route path="/schedule/confirmation" element={<ClientSchedulingConfirmation />} />
            {/* Keep the existing confirmation URL working as well. */}
            <Route path="/confirmation" element={<ClientSchedulingConfirmation />} />
            <Route path="/appointment-details" element={<ViewAppointmentDetailsPage />} />
        </Routes>
    );
}

export default AppRoutes;
