// DT-622 Sprint 8
// Preston Ball
// Application routes directing content pages dynamically to ContentPage

import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import ContentPage from '../pages/ContentPage'
import AdminDashboard from '../pages/AdminDashboard'
import LocationsPage from '../pages/LocationsPage'
import PortalPage from '../pages/PortalPage'
import SchedulePage from '../pages/SchedulePage'
import LoginPage from '../pages/LoginPage'
import SignupPage from '../pages/SignupPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import Scheduling from '../pages/AcuityScheduling'
import NotFoundPage from '../pages/NotFoundPage'
import ContentEditor from '../pages/ContentEditor'
import ClientSchedulingConfirmation from '../pages/ClientSchedulingConfirmation'
import ViewAppointmentDetailsPage from '../pages/ViewAppointmentDetailsPage'

function AppRoutes () {
  const location = useLocation()
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }

    // Move focus to the new page's main region after client-side navigation.
    // This gives keyboard and screen-reader users a clear starting point.
    document.getElementById('main-content')?.focus()
  }, [location.pathname])

  return (
    <Routes>
      {/* DT-622 Sprint 8 - Preston Ball: Root content route loads default landing page from database */}
      <Route path='/' element={<ContentPage defaultPageId='landing' />} />

      {/* Static Admin & Auth Routes */}
      <Route path='/admin' element={<AdminDashboard />} />
      <Route path='/admin/content-editor' element={<ContentEditor />} />
      <Route path='/portal' element={<PortalPage />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/signup' element={<SignupPage />} />
      <Route path='/forgot-password' element={<ForgotPasswordPage />} />

      {/* Static Scheduling & Locations Routes */}
      <Route path='/schedule' element={<SchedulePage />} />
      <Route path='/locations' element={<LocationsPage />} />
      <Route path='/AcuityScheduling' element={<Scheduling />} />
      <Route path='/schedule/confirmation' element={<ClientSchedulingConfirmation />} />
      <Route path='/confirmation' element={<ClientSchedulingConfirmation />} />
      <Route path='/appointment-details' element={<ViewAppointmentDetailsPage />} />

      {/* DT-622 Sprint 8 - Preston Ball: Explicit and dynamic root content routes */}
      <Route path='/content/:pageId' element={<ContentPage />} />
      <Route path='/:pageId' element={<ContentPage />} />

      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes
