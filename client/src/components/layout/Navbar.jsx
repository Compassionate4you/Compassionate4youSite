// DT-622 DT-625 Sprint 8
// Preston Ball
// Navbar component dynamically displaying ordered pages with responsive priority-collapse dropdown, mobile hamburger menu, and protected logo scaling

import { useState, useEffect, useRef } from 'react'
import './styles/NavBar.css'
import logo from '../../assets/images/CompassionateLogo.jpeg'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { PageStorageService } from '../../services/pageStorageService'
import { useAuth } from '../../context/AuthContext'

function Navbar () {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  // DT-37: re render Navbar on route change so login check stays updated
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  )
  const navRef = useRef(null)
  const dropdownRef = useRef(null)

  // DT-622 Sprint 8 - Preston Ball: Subscribe to dynamic pages in database / storage
  const [pages, setPages] = useState(PageStorageService.getPages())

  useEffect(() => {
    let isMounted = true
    async function fetchPages () {
      const dbPages = await PageStorageService.loadFromDatabase()
      if (isMounted) setPages(dbPages)
    }
    fetchPages()

    const unsubscribe = PageStorageService.subscribe((updated) => {
      if (isMounted) setPages(updated)
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  // DT-625 Sprint 8 - Preston Ball: Track viewport/container width for dynamic priority collapse
  useEffect(() => {
    function updateWidth () {
      const measured = navRef.current?.offsetWidth || window.innerWidth
      setViewportWidth(measured || window.innerWidth)
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => {
      window.removeEventListener('resize', updateWidth)
    }
  }, [])

  // DT-625 Sprint 8 - Preston Ball: Close dropdown and mobile menu on outside click or Escape key
  useEffect(() => {
    function handleClickOutside (event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMobileMenuOpen(false)
      }
    }
    function handleKeyDown (event) {
      if (event.key === 'Escape') {
        setDropdownOpen(false)
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    setDropdownOpen(false)
    setMobileMenuOpen(false)
  }, [location.pathname])

  // DT-586: Remove NavBar from Admin Dashboard
  const isAdminPage = location.pathname.startsWith('/admin')
  if (isAdminPage) {
    return null
  }

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  // Log user out and send them back to login
  function handleLogout () {
    localStorage.removeItem('isLoggedIn')
    setDropdownOpen(false)
    setMobileMenuOpen(false)
    navigate('/login')
    logout()
  }

  // DT-622 DT-625 Sprint 8 - Preston Ball: Separate content pages (excluding landing) in configured order
  const contentPages = [...pages]
    .sort((a, b) => {
      const orderA = typeof a.content?.order === 'number' ? a.content.order : 999
      const orderB = typeof b.content?.order === 'number' ? b.content.order : 999
      return orderA - orderB
    })
    .filter((p) => p.id !== 'landing')

  // DT-625 Sprint 8 - Preston Ball: Calculate responsive thresholds
  const isMobile = viewportWidth < 720
  const collapseSecondaryToDropdown = viewportWidth >= 720 && viewportWidth < 900
  let maxVisibleContentPages = 4
  if (viewportWidth < 900) {
    maxVisibleContentPages = 1
  } else if (viewportWidth < 1150) {
    maxVisibleContentPages = 2
  }

  const visiblePages = contentPages.slice(0, maxVisibleContentPages)
  const overflowPages = contentPages.slice(maxVisibleContentPages)
  const showDropdown = !isMobile && (overflowPages.length > 0 || collapseSecondaryToDropdown)

  function getPageRoute (pageId) {
    if (pageId === 'homeHealth') return '/home-health'
    if (pageId === 'hospice') return '/hospice'
    // DT-622 Sprint 8 - Preston Ball: Temporary /content/:pageId routing scheme for dynamic pages
    return `/content/${pageId}`
  }

  const navAriaLabel = i18n.language.startsWith('es')
    ? 'Navegación principal'
    : i18n.language.startsWith('ur')
      ? 'مرکزی نیویگیشن'
      : i18n.language.startsWith('pa')
        ? 'ਮੁੱਖ ਨੈਵੀਗੇਸ਼ਨ'
        : 'Main navigation'

  return (
    <nav className="navbar" ref={navRef} aria-label={navAriaLabel}>
      <div className="logo">
        <Link to="/">
          {/* DT-625 Sprint 8 - Preston Ball: Preserve logo aspect ratio and prevent clipping */}
          <img
            src={logo}
            alt="Compassionate Home Health and Hospice logo"
            className="logo-img"
          />
        </Link>
      </div>

      {/* DT-625 Sprint 8 - Preston Ball: Mobile hamburger toggle on narrow viewports */}
      {isMobile ? (
        <div className="navbar-mobile-wrapper">
          <button
            type="button"
            className="navbar-mobile-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="navbar-mobile-menu"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            <span aria-hidden="true">{mobileMenuOpen ? '✕' : '☰'}</span>
            <span>{mobileMenuOpen ? (t('nav.close') || 'Close') : (t('nav.menu') || 'Menu')}</span>
          </button>

          {mobileMenuOpen && (
            <ul id="navbar-mobile-menu" className="navbar-mobile-menu" role="menu">
              <li role="none">
                <Link
                  to="/"
                  role="menuitem"
                  aria-current={location.pathname === '/' ? 'page' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.welcome')}
                </Link>
              </li>
              {contentPages.map((page) => {
                const route = getPageRoute(page.id)
                const isCurrent = location.pathname === route || location.pathname === `/${page.id}`
                return (
                  <li key={page.id} role="none">
                    <Link
                      to={route}
                      role="menuitem"
                      aria-current={isCurrent ? 'page' : undefined}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {page.content?.title || page.id}
                    </Link>
                  </li>
                )
              })}
              <li role="none">
                <Link
                  to="/schedule"
                  role="menuitem"
                  aria-current={location.pathname === '/schedule' ? 'page' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.schedule')}
                </Link>
              </li>
              {isLoggedIn ? (
                <>
                  <li role="none">
                    <Link
                      to="/portal"
                      role="menuitem"
                      aria-current={location.pathname === '/portal' ? 'page' : undefined}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.dashboard')}
                    </Link>
                  </li>
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className="nav-logout nav-logout--mobile"
                      onClick={handleLogout}
                    >
                      {t('nav.logout')}
                    </button>
                  </li>
                </>
              ) : (
                <li role="none">
                  <Link
                    to="/login"
                    role="menuitem"
                    aria-current={location.pathname === '/login' ? 'page' : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.login')}
                  </Link>
                </li>
              )}
            </ul>
          )}
        </div>
      ) : (
        <ul className="nav-links">
          <li>
            <Link to="/" aria-current={location.pathname === '/' ? 'page' : undefined}>
              {t('nav.welcome')}
            </Link>
          </li>

          {/* DT-622 DT-625 Sprint 8 - Preston Ball: Dynamically display visible content pages */}
          {visiblePages.map((page) => {
            const route = getPageRoute(page.id)
            const isCurrent = location.pathname === route || location.pathname === `/${page.id}`
            return (
              <li key={page.id}>
                <Link to={route} aria-current={isCurrent ? 'page' : undefined}>
                  {page.content?.title || page.id}
                </Link>
              </li>
            )
          })}

          {/* Static Schedule link */}
          <li>
            <Link to="/schedule" aria-current={location.pathname === '/schedule' ? 'page' : undefined}>
              {t('nav.schedule')}
            </Link>
          </li>

          {/* Primary portal/auth links when viewport >= 900px */}
          {!collapseSecondaryToDropdown && (
            isLoggedIn ? (
              <>
                <li>
                  <Link to="/portal" aria-current={location.pathname === '/portal' ? 'page' : undefined}>
                    {t('nav.dashboard')}
                  </Link>
                </li>
                <li>
                  <button type="button" className="nav-logout" onClick={handleLogout}>
                    {t('nav.logout')}
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link to="/login" aria-current={location.pathname === '/login' ? 'page' : undefined}>
                  {t('nav.login')}
                </Link>
              </li>
            )
          )}

          {/* DT-622 DT-625 Sprint 8 - Preston Ball: Dropdown for overflow content pages and secondary links */}
          {showDropdown && (
            <li className="nav-dropdown" ref={dropdownRef}>
              <button
                type="button"
                className="nav-dropdown-toggle"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <span>{t('nav.morePages') || 'More'}</span>
                <span aria-hidden="true">▾</span>
              </button>
              {dropdownOpen && (
                <ul className="nav-dropdown-menu" role="menu">
                  {overflowPages.map((page) => {
                    const route = getPageRoute(page.id)
                    const isCurrent = location.pathname === route || location.pathname === `/${page.id}`
                    return (
                      <li key={page.id} className="nav-dropdown-item" role="none">
                        <Link
                          to={route}
                          role="menuitem"
                          aria-current={isCurrent ? 'page' : undefined}
                          onClick={() => setDropdownOpen(false)}
                        >
                          {page.content?.title || page.id}
                        </Link>
                      </li>
                    )
                  })}
                  {collapseSecondaryToDropdown && (
                    isLoggedIn ? (
                      <>
                        <li className="nav-dropdown-item" role="none">
                          <Link
                            to="/portal"
                            role="menuitem"
                            aria-current={location.pathname === '/portal' ? 'page' : undefined}
                            onClick={() => setDropdownOpen(false)}
                          >
                            {t('nav.dashboard')}
                          </Link>
                        </li>
                        <li className="nav-dropdown-item" role="none">
                          <button
                            type="button"
                            role="menuitem"
                            className="nav-dropdown-action"
                            onClick={handleLogout}
                          >
                            {t('nav.logout')}
                          </button>
                        </li>
                      </>
                    ) : (
                      <li className="nav-dropdown-item" role="none">
                        <Link
                          to="/login"
                          role="menuitem"
                          aria-current={location.pathname === '/login' ? 'page' : undefined}
                          onClick={() => setDropdownOpen(false)}
                        >
                          {t('nav.login')}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              )}
            </li>
          )}
        </ul>
      )}
    </nav>
  )
}

export default Navbar
