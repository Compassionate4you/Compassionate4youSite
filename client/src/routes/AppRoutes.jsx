// DT-622 Sprint 8
// Preston Ball
// Application routes preserving legacy routes alongside temporary /content/:pageId dynamic routes

import { Routes, Route, Navigate } from 'react-router-dom'
import ContentPage from '../pages/ContentPage'
import AdminDashboard from '../pages/AdminDashboard'
import LocationsPage from '../pages/LocationsPage'
import PortalPage from '../pages/PortalPage'
import SchedulePage from '../pages/SchedulePage'
import LoginPage from '../pages/LoginPage'
import SignupPage from '../pages/SignupPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import ResetPasswordPage from '../pages/ResetPasswordPage'
import NotFoundPage from '../pages/NotFoundPage'
import RequireRole from '../components/RequireRole'
import ClientSchedulingConfirmation from '../pages/ClientSchedulingConfirmation'
import ViewAppointmentDetailsPage from '../pages/ViewAppointmentDetailsPage'

function AppRoutes () {
  return (
    <Routes>
      {/* DT-875 - Preston Ball Sprint 6: Route all content pages through content page.*/}
      <Route path='/:pageId' element={<ContentPage />} />
      <Route path='' element={<Navigate to='/welcome' replace/>} />

      <Route path='/admin' element={<RequireRole role='admin'><AdminDashboard /></RequireRole>} />
      <Route path='/locations' element={<LocationsPage />} />
      <Route path='/portal' element={<RequireRole role='customer'><PortalPage /></RequireRole>} />
      <Route path='/schedule' element={<SchedulePage />} />

      <Route path='/login' element={<LoginPage />} />
      <Route path='/signup' element={<SignupPage />} />
      <Route path='/forgot-password' element={<ForgotPasswordPage />} />
      {/* DT-781: page linked from the password reset email */}
      <Route path='/reset-password' element={<ResetPasswordPage />} />
      <Route path='/schedule/confirmation' element={<ClientSchedulingConfirmation />} />
      <Route path='/confirmation' element={<ClientSchedulingConfirmation />} />
      <Route path='/appointment-details' element={<ViewAppointmentDetailsPage />} />

      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes

