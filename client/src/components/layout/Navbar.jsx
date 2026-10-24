// DT-622 Sprint 8
// Preston Ball
// Navbar component dynamically displaying created pages with responsive dropdown overflow

import { useState, useEffect, useRef } from 'react'
import './styles/NavBar.css'
import logo from '../../assets/images/CompassionateLogo.jpeg'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { PageStorageService } from '../../services/pageStorageService'

const MAX_VISIBLE_CONTENT_PAGES = 3

function Navbar () {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
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

  // Close dropdown on outside click or navigation
  useEffect(() => {
    function handleClickOutside (event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    setDropdownOpen(false)
  }, [location.pathname])

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

  function handleLogout () {
    localStorage.removeItem('isLoggedIn')
    navigate('/login')
  }

  // DT-622 Sprint 8 - Preston Ball: Separate content pages (excluding landing) for navbar display
  const contentPages = pages.filter((p) => p.id !== 'landing')

  const showDropdown = contentPages.length > MAX_VISIBLE_CONTENT_PAGES
  const visiblePages = showDropdown ? contentPages.slice(0, MAX_VISIBLE_CONTENT_PAGES - 1) : contentPages
  const overflowPages = showDropdown ? contentPages.slice(MAX_VISIBLE_CONTENT_PAGES - 1) : []

  function getPageRoute (pageId) {
    if (pageId === 'homeHealth') return '/home-health'
    if (pageId === 'hospice') return '/hospice'
    return `/${pageId}`
  }

  return (
    <nav className='navbar' aria-label={i18n.language.startsWith('es') ? 'Navegación principal' : 'Main navigation'}>
      <div className='logo'>
        <Link to='/'>
          <img src={logo} alt='CompassionateLogo' className='logo-img' />
        </Link>
      </div>

      <ul className='nav-links'>
        <li>
          <Link to='/' aria-current={location.pathname === '/' ? 'page' : undefined}>
            {t('nav.welcome')}
          </Link>
        </li>

        {/* DT-622 Sprint 8 - Preston Ball: Dynamically display content pages */}
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

        {/* DT-622 Sprint 8 - Preston Ball: Dropdown for overflow content pages */}
        {showDropdown && (
          <li className='nav-dropdown' ref={dropdownRef}>
            <button
              type='button'
              className='nav-dropdown-toggle'
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
              aria-haspopup='true'
            >
              <span>{t('nav.morePages') || 'More'}</span>
              <span aria-hidden='true'>▾</span>
            </button>
            {dropdownOpen && (
              <ul className='nav-dropdown-menu' role='menu'>
                {overflowPages.map((page) => {
                  const route = getPageRoute(page.id)
                  const isCurrent = location.pathname === route || location.pathname === `/${page.id}`
                  return (
                    <li key={page.id} className='nav-dropdown-item' role='none'>
                      <Link
                        to={route}
                        role='menuitem'
                        aria-current={isCurrent ? 'page' : undefined}
                        onClick={() => setDropdownOpen(false)}
                      >
                        {page.content?.title || page.id}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </li>
        )}

        {/* Static core links */}
        <li>
          <Link to='/schedule' aria-current={location.pathname === '/schedule' ? 'page' : undefined}>
            {t('nav.schedule')}
          </Link>
        </li>

        {isLoggedIn ? (
          <>
            <li>
              <Link to='/portal' aria-current={location.pathname === '/portal' ? 'page' : undefined}>
                {t('nav.dashboard')}
              </Link>
            </li>
            <li>
              <button type='button' className='nav-logout' onClick={handleLogout}>
                {t('nav.logout')}
              </button>
            </li>
          </>
        ) : (
          <li>
            <Link to='/login' aria-current={location.pathname === '/login' ? 'page' : undefined}>
              {t('nav.login')}
            </Link>
          </li>
        )}
      </ul>
    </nav>
  )
}

export default Navbar
