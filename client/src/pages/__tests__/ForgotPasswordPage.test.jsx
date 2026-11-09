// DT-765 Sprint 8
// Gandhar Tare
// Forgot password page: email or phone, the shared-phone email confirmation,
// and error handling. The API is mocked, so nothing is sent.
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ForgotPasswordPage from '../ForgotPasswordPage'
import { apiForgotPassword } from '../../services/api'

vi.mock('../../services/api', () => ({
  apiForgotPassword: vi.fn()
}))

// Matches the shape of ApiError in services/api.js.
function apiError (status, field) {
  return Object.assign(new Error('server error'), { status, field })
}

function renderPage () {
  return render(
    <MemoryRouter>
      <ForgotPasswordPage />
    </MemoryRouter>
  )
}

const identifierInput = () => screen.getByLabelText('login.reset.emailOrPhone')
const submitButton = () => screen.getByRole('button', { name: 'login.reset.submit' })

beforeEach(() => {
  apiForgotPassword.mockResolvedValue({ success: true })
})

describe('ForgotPasswordPage', () => {
  it('sends an email address to the backend and shows the confirmation', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(identifierInput(), 'alice@example.com')
    await user.click(submitButton())

    expect(apiForgotPassword).toHaveBeenCalledWith('alice@example.com', undefined)
    expect(await screen.findByRole('status')).toHaveTextContent('login.reset.confirmation')
  })

  it('sends a phone number to the backend', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(identifierInput(), '(555) 123-4567')
    await user.click(submitButton())

    expect(apiForgotPassword).toHaveBeenCalledWith('(555) 123-4567', undefined)
    expect(await screen.findByText('login.reset.confirmation')).toBeInTheDocument()
  })

  it('shows an error and does not call the API when the field is empty', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(submitButton())

    expect(screen.getByRole('alert')).toHaveTextContent('login.reset.errors.required')
    expect(apiForgotPassword).not.toHaveBeenCalled()
  })

  it('rejects input that is neither an email nor a phone number', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(identifierInput(), 'hello')
    await user.click(submitButton())

    expect(screen.getByRole('alert')).toHaveTextContent('login.reset.errors.invalid')
    expect(identifierInput()).toHaveAttribute('aria-invalid', 'true')
    expect(apiForgotPassword).not.toHaveBeenCalled()
  })

  it('asks for the account email when the phone number is shared, then sends both', async () => {
    const user = userEvent.setup()
    apiForgotPassword.mockRejectedValueOnce(apiError(409, 'confirmEmail'))
    renderPage()

    await user.type(identifierInput(), '5551234567')
    await user.click(submitButton())

    // Second field appears with an explanation.
    const emailInput = await screen.findByLabelText('login.reset.confirmEmail')
    expect(screen.getByText('login.reset.confirmEmailPrompt')).toBeInTheDocument()
    expect(screen.queryByText('login.reset.confirmation')).not.toBeInTheDocument()

    await user.type(emailInput, 'bob@example.com')
    await user.click(submitButton())

    expect(apiForgotPassword).toHaveBeenLastCalledWith('5551234567', 'bob@example.com')
    expect(await screen.findByText('login.reset.confirmation')).toBeInTheDocument()
  })

  it('requires the confirmation email once it has been asked for', async () => {
    const user = userEvent.setup()
    apiForgotPassword.mockRejectedValueOnce(apiError(409, 'confirmEmail'))
    renderPage()

    await user.type(identifierInput(), '5551234567')
    await user.click(submitButton())
    await screen.findByLabelText('login.reset.confirmEmail')

    await user.click(submitButton())

    expect(screen.getByRole('alert')).toHaveTextContent('login.reset.errors.confirmEmailRequired')
    expect(apiForgotPassword).toHaveBeenCalledTimes(1)
  })

  it('rejects an invalid confirmation email without calling the API again', async () => {
    const user = userEvent.setup()
    apiForgotPassword.mockRejectedValueOnce(apiError(409, 'confirmEmail'))
    renderPage()

    await user.type(identifierInput(), '5551234567')
    await user.click(submitButton())
    await user.type(await screen.findByLabelText('login.reset.confirmEmail'), 'not-an-email')
    await user.click(submitButton())

    expect(screen.getByRole('alert')).toHaveTextContent('login.reset.errors.confirmEmailInvalid')
    expect(apiForgotPassword).toHaveBeenCalledTimes(1)
  })

  it('hides the confirmation email field again if the phone number is changed', async () => {
    const user = userEvent.setup()
    apiForgotPassword.mockRejectedValueOnce(apiError(409, 'confirmEmail'))
    renderPage()

    await user.type(identifierInput(), '5551234567')
    await user.click(submitButton())
    await screen.findByLabelText('login.reset.confirmEmail')

    await user.type(identifierInput(), '8')

    expect(screen.queryByLabelText('login.reset.confirmEmail')).not.toBeInTheDocument()
  })

  it('shows a network error when the server cannot be reached', async () => {
    const user = userEvent.setup()
    apiForgotPassword.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    renderPage()

    await user.type(identifierInput(), 'alice@example.com')
    await user.click(submitButton())

    expect(await screen.findByRole('alert')).toHaveTextContent('login.reset.errors.network')
  })

  it('disables the button while the request is in flight', async () => {
    const user = userEvent.setup()
    let finish
    apiForgotPassword.mockReturnValueOnce(new Promise((resolve) => { finish = resolve }))
    renderPage()

    await user.type(identifierInput(), 'alice@example.com')
    await user.click(submitButton())

    expect(screen.getByRole('button', { name: 'login.reset.sending' })).toBeDisabled()

    finish({ success: true })
    await waitFor(() => expect(screen.getByText('login.reset.confirmation')).toBeInTheDocument())
  })
})
