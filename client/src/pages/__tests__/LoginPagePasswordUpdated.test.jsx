// DT-781 Sprint 8
// Gandhar Tare
// Login page after a password reset: shows the confirmation and pre-fills
// the email so the user can try the new password.
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import LoginPage from '../LoginPage'

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ login: vi.fn(), user: null, isLoading: false })
}))

// The benefits panel reads a translated list, which the test translator
// returns as a plain key. It is not part of this feature.
vi.mock('../../components/AccountBenefits', () => ({
  default: () => null
}))

function renderLogin (state) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/login', state }]}>
      <LoginPage />
    </MemoryRouter>
  )
}

describe('LoginPage after a password reset', () => {
  it('shows the password updated message and pre-fills the email', () => {
    renderLogin({ passwordUpdated: true, email: 'alice@example.com' })

    expect(screen.getByRole('status')).toHaveTextContent('login.passwordUpdated')
    expect(screen.getByLabelText('login.email')).toHaveValue('alice@example.com')
    expect(screen.getByLabelText('login.password')).toHaveValue('')
  })

  it('shows no message on a normal visit', () => {
    renderLogin(undefined)

    expect(screen.queryByText('login.passwordUpdated')).not.toBeInTheDocument()
    expect(screen.getByLabelText('login.email')).toHaveValue('')
  })
})
