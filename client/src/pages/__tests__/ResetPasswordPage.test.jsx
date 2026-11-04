// DT-781 Sprint 8
// Gandhar Tare
// Reset password page: link checking, showing the account, validation, and
// the redirect to the login page. The API is mocked.
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ResetPasswordPage, { meetsPasswordRules } from '../ResetPasswordPage'
import { apiResetPassword, apiVerifyResetToken } from '../../services/api'

vi.mock('../../services/api', () => ({
  apiResetPassword: vi.fn(),
  apiVerifyResetToken: vi.fn()
}))

function apiError (status, field) {
  return Object.assign(new Error('server error'), { status, field })
}

// Stand-in login page that prints the router state it was given.
function LoginStub () {
  const location = useLocation()
  return <div data-testid='login-page'>{JSON.stringify(location.state)}</div>
}

function renderAt (url) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path='/reset-password' element={<ResetPasswordPage />} />
        <Route path='/login' element={<LoginStub />} />
      </Routes>
    </MemoryRouter>
  )
}

const newPasswordInput = () => screen.getByLabelText('login.resetPage.newPassword')
const confirmInput = () => screen.getByLabelText('login.resetPage.confirmPassword')
const submitButton = () => screen.getByRole('button', { name: 'login.resetPage.submit' })

beforeEach(() => {
  apiVerifyResetToken.mockResolvedValue({
    success: true,
    user: { name: 'Alice Smith', email: 'alice@example.com' }
  })
  apiResetPassword.mockResolvedValue({ success: true, email: 'alice@example.com' })
})

describe('meetsPasswordRules', () => {
  it('matches the server password rules', () => {
    expect(meetsPasswordRules('NewPass1!')).toBe(true)
    expect(meetsPasswordRules('short1!A')).toBe(true)
    expect(meetsPasswordRules('Sh1!')).toBe(false)
    expect(meetsPasswordRules('alllower1!')).toBe(false)
    expect(meetsPasswordRules('ALLUPPER1!')).toBe(false)
    expect(meetsPasswordRules('NoNumber!!')).toBe(false)
    expect(meetsPasswordRules('NoSpecial11')).toBe(false)
  })
})

describe('ResetPasswordPage', () => {
  it('checks the token from the link and shows the account email', async () => {
    renderAt('/reset-password?token=abc123')

    expect(screen.getByRole('status')).toHaveTextContent('login.resetPage.checking')
    expect(await screen.findByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('login.resetPage.accountFor')).toBeInTheDocument()
    expect(apiVerifyResetToken).toHaveBeenCalledWith('abc123')
  })

  it('shows the expired message when the link is not valid', async () => {
    apiVerifyResetToken.mockRejectedValueOnce(apiError(400, 'token'))
    renderAt('/reset-password?token=old')

    expect(await screen.findByText('login.resetPage.invalidTitle')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'login.resetPage.requestNew' })).toHaveAttribute('href', '/forgot-password')
    expect(screen.queryByLabelText('login.resetPage.newPassword')).not.toBeInTheDocument()
  })

  it('shows the expired message without calling the API when there is no token', () => {
    renderAt('/reset-password')

    expect(screen.getByText('login.resetPage.invalidTitle')).toBeInTheDocument()
    expect(apiVerifyResetToken).not.toHaveBeenCalled()
  })

  it('updates the password and sends the user to login with a confirmation', async () => {
    const user = userEvent.setup()
    renderAt('/reset-password?token=abc123')

    await user.type(await screen.findByLabelText('login.resetPage.newPassword'), 'NewPass1!')
    await user.type(confirmInput(), 'NewPass1!')
    await user.click(submitButton())

    expect(apiResetPassword).toHaveBeenCalledWith('abc123', 'NewPass1!')
    const login = await screen.findByTestId('login-page')
    expect(JSON.parse(login.textContent)).toEqual({ passwordUpdated: true, email: 'alice@example.com' })
  })

  it('requires both password fields', async () => {
    const user = userEvent.setup()
    renderAt('/reset-password?token=abc123')

    await user.type(await screen.findByLabelText('login.resetPage.newPassword'), 'NewPass1!')
    await user.click(submitButton())

    expect(screen.getByRole('alert')).toHaveTextContent('login.resetPage.errors.required')
    expect(confirmInput()).toHaveAttribute('aria-invalid', 'true')
    expect(apiResetPassword).not.toHaveBeenCalled()
  })

  it('rejects a weak password before calling the API', async () => {
    const user = userEvent.setup()
    renderAt('/reset-password?token=abc123')

    await user.type(await screen.findByLabelText('login.resetPage.newPassword'), 'weak')
    await user.type(confirmInput(), 'weak')
    await user.click(submitButton())

    expect(screen.getByRole('alert')).toHaveTextContent('login.resetPage.errors.weak')
    expect(newPasswordInput()).toHaveAttribute('aria-invalid', 'true')
    expect(apiResetPassword).not.toHaveBeenCalled()
  })

  it('rejects passwords that do not match', async () => {
    const user = userEvent.setup()
    renderAt('/reset-password?token=abc123')

    await user.type(await screen.findByLabelText('login.resetPage.newPassword'), 'NewPass1!')
    await user.type(confirmInput(), 'NewPass2!')
    await user.click(submitButton())

    expect(screen.getByRole('alert')).toHaveTextContent('login.resetPage.errors.mismatch')
    expect(apiResetPassword).not.toHaveBeenCalled()
  })

  it('switches to the expired message if the link runs out before submitting', async () => {
    const user = userEvent.setup()
    apiResetPassword.mockRejectedValueOnce(apiError(400, 'token'))
    renderAt('/reset-password?token=abc123')

    await user.type(await screen.findByLabelText('login.resetPage.newPassword'), 'NewPass1!')
    await user.type(confirmInput(), 'NewPass1!')
    await user.click(submitButton())

    expect(await screen.findByText('login.resetPage.invalidTitle')).toBeInTheDocument()
  })

  it('shows a network error and stays on the page when the server is unreachable', async () => {
    const user = userEvent.setup()
    apiResetPassword.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    renderAt('/reset-password?token=abc123')

    await user.type(await screen.findByLabelText('login.resetPage.newPassword'), 'NewPass1!')
    await user.type(confirmInput(), 'NewPass1!')
    await user.click(submitButton())

    expect(await screen.findByRole('alert')).toHaveTextContent('login.resetPage.errors.network')
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument()
  })
})
