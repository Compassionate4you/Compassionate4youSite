// DT-622 Sprint 8
// Preston Ball
// Application routes preserving legacy routes alongside temporary /content/:pageId dynamic routes

import { Routes, Route } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'
import HomeHealthPage from '../pages/HomeHealthPage'
import HospicePage from '../pages/HospicePage'
import ContentPage from '../pages/ContentPage'
import AdminDashboard from '../pages/AdminDashboard'
import LocationsPage from '../pages/LocationsPage'
import PortalPage from '../pages/PortalPage'
import SchedulePage from '../pages/SchedulePage'
import LoginPage from '../pages/LoginPage'
import SignupPage from '../pages/SignupPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import ResetPasswordPage from '../pages/ResetPasswordPage'
import Scheduling from '../pages/AcuityScheduling'
import NotFoundPage from '../pages/NotFoundPage'
import RequireRole from '../components/RequireRole'
import ContentEditor from '../pages/ContentEditor'
import ClientSchedulingConfirmation from '../pages/ClientSchedulingConfirmation'
import ViewAppointmentDetailsPage from '../pages/ViewAppointmentDetailsPage'

function AppRoutes () {
  return (
    <Routes>
      {/* DT-622 Sprint 8 - Preston Ball: Root content route commented out so legacy routes remain accessible */}
      {/* <Route path='/' element={<ContentPage defaultPageId='landing' />} /> */}

      <Route path='/' element={<LandingPage />} />
      <Route path='/admin' element={<RequireRole role='admin'><AdminDashboard /></RequireRole>} />
      <Route path='/home-health' element={<HomeHealthPage />} />
      <Route path='/hospice' element={<HospicePage />} />
      <Route path='/locations' element={<LocationsPage />} />
      <Route path='/portal' element={<RequireRole role='customer'><PortalPage /></RequireRole>} />
      <Route path='/schedule' element={<SchedulePage />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/signup' element={<SignupPage />} />
      <Route path='/forgot-password' element={<ForgotPasswordPage />} />
      {/* DT-781: page linked from the password reset email */}
      <Route path='/reset-password' element={<ResetPasswordPage />} />
      <Route
        path='/AcuityScheduling'
        element={<Scheduling />}
      />
      <Route path='/admin/content-editor' element={<RequireRole role='admin'><ContentEditor /></RequireRole>} />
      <Route path='/schedule/confirmation' element={<ClientSchedulingConfirmation />} />
      <Route path='/confirmation' element={<ClientSchedulingConfirmation />} />
      <Route path='/appointment-details' element={<ViewAppointmentDetailsPage />} />

      {/* DT-622 Sprint 8 - Preston Ball: Dynamic content routes under /content/:pageId (root /:pageId commented out) */}
      <Route path='/content/:pageId' element={<ContentPage />} />
      {/* <Route path='/:pageId' element={<ContentPage />} /> */}

      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes

