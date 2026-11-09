// DT-567 / DT-568 / DT-569: contact form component tests.
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../services/api', () => ({
  apiSubmitContactForm: vi.fn()
}))

import ContactForm from '../modular/sections/ContactFormSection'
import { apiSubmitContactForm } from '../../services/api'

const VALID = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  message: 'I would like to ask about home health services for my mother.'
}

function fields () {
  return {
    name: screen.getByLabelText(/landing\.contactFormName/),
    email: screen.getByLabelText(/landing\.contactFormEmail/),
    message: screen.getByLabelText(/landing\.contactFormMessage/)
  }
}

async function fillForm (user, overrides = {}) {
  const values = { ...VALID, ...overrides }
  const f = fields()
  if (values.name) await user.type(f.name, values.name)
  if (values.email) await user.type(f.email, values.email)
  if (values.message) await user.type(f.message, values.message)
  return values
}

function submitButton () {
  return screen.getByRole('button', { name: /contactForm(Button|Sending)/ })
}

beforeEach(() => {
  vi.clearAllMocks()
  apiSubmitContactForm.mockResolvedValue({
    success: true,
    message: 'Thank you for reaching out.'
  })
})

describe('A. Rendering', () => {
  it('A1: renders all three fields', () => {
    render(<ContactForm />)
    const f = fields()
    expect(f.name).toBeInTheDocument()
    expect(f.email).toBeInTheDocument()
    expect(f.message).toBeInTheDocument()
  })

  it('A2: renders a submit button', () => {
    render(<ContactForm />)
    expect(submitButton()).toBeInTheDocument()
  })

  it('A3: marks every field as required for assistive tech (DT-569)', () => {
    render(<ContactForm />)
    const f = fields()
    expect(f.name).toHaveAttribute('aria-required', 'true')
    expect(f.email).toHaveAttribute('aria-required', 'true')
    expect(f.message).toHaveAttribute('aria-required', 'true')
  })

  it('A4: shows a note saying the fields are required', () => {
    render(<ContactForm />)
    expect(screen.getByText(/contactFormRequiredNote/)).toBeInTheDocument()
  })

  it('A5: starts with no error messages', () => {
    render(<ContactForm />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('B. Happy path (DT-567)', () => {
  it('B1: submits the filled form once', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await fillForm(user)
    await user.click(submitButton())

    await waitFor(() => expect(apiSubmitContactForm).toHaveBeenCalledTimes(1))
  })

  it('B2: sends the values the server expects', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await fillForm(user)
    await user.click(submitButton())

    await waitFor(() =>
      expect(apiSubmitContactForm).toHaveBeenCalledWith({
        name: VALID.name,
        email: VALID.email,
        message: VALID.message
      })
    )
  })

  it('B3: trims surrounding whitespace', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await fillForm(user, { name: '  Jane Doe  ' })
    await user.click(submitButton())

    await waitFor(() =>
      expect(apiSubmitContactForm).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Jane Doe' })
      )
    )
  })

  it('B4: shows a success message afterwards', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await fillForm(user)
    await user.click(submitButton())

    expect(await screen.findByRole('status')).toBeInTheDocument()
  })

  it('B5: clears the form after a successful send', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await fillForm(user)
    await user.click(submitButton())

    await waitFor(() => expect(fields().name).toHaveValue(''))
    expect(fields().email).toHaveValue('')
    expect(fields().message).toHaveValue('')
  })
})

describe('C. Validation (DT-568)', () => {
  it('C1: blocks an empty form and sends nothing', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await user.click(submitButton())

    expect(await screen.findAllByRole('alert')).toHaveLength(3)
    expect(apiSubmitContactForm).not.toHaveBeenCalled()
  })

  it.each([
    ['C2: name', { name: '' }],
    ['C3: email', { email: '' }],
    ['C4: message', { message: '' }]
  ])('%s missing blocks submission', async (_label, overrides) => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await fillForm(user, overrides)
    await user.click(submitButton())

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(apiSubmitContactForm).not.toHaveBeenCalled()
  })

  it('C5: rejects a malformed email address', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await fillForm(user, { email: 'not-an-email' })
    await user.click(submitButton())

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(apiSubmitContactForm).not.toHaveBeenCalled()
  })

  it('C6: rejects a message that is too short', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await fillForm(user, { message: 'hi' })
    await user.click(submitButton())

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(apiSubmitContactForm).not.toHaveBeenCalled()
  })

  it('C7: treats a whitespace-only name as missing', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await fillForm(user, { name: '   ' })
    await user.click(submitButton())

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(apiSubmitContactForm).not.toHaveBeenCalled()
  })

  it('C8: marks the offending field with aria-invalid (DT-569)', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await user.click(submitButton())

    await waitFor(() =>
      expect(fields().name).toHaveAttribute('aria-invalid', 'true')
    )
  })

  it('C9: clears a field error once the person starts fixing it', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)
    await user.click(submitButton())
    await screen.findAllByRole('alert')

    await user.type(fields().name, 'J')

    await waitFor(() =>
      expect(fields().name).toHaveAttribute('aria-invalid', 'false')
    )
  })
})

describe('D. Edge cases and errors (DT-569)', () => {
  it('D1: shows a field error the server reports', async () => {
    apiSubmitContactForm.mockRejectedValue(
      Object.assign(new Error('That email is not accepted.'), { field: 'email' })
    )

    const user = userEvent.setup()
    render(<ContactForm />)
    await fillForm(user)
    await user.click(submitButton())

    expect(await screen.findByRole('alert')).toHaveTextContent(/not accepted/i)
  })

  it('D2: shows a general error when the server gives no field', async () => {
    apiSubmitContactForm.mockRejectedValue(new Error('Service unavailable'))

    const user = userEvent.setup()
    render(<ContactForm />)
    await fillForm(user)
    await user.click(submitButton())

    expect(await screen.findByRole('status')).toHaveTextContent(/unavailable/i)
  })

  it('D3: keeps what was typed when the send fails', async () => {
    apiSubmitContactForm.mockRejectedValue(new Error('Network down'))

    const user = userEvent.setup()
    render(<ContactForm />)
    await fillForm(user)
    await user.click(submitButton())

    await screen.findByRole('status')
    expect(fields().name).toHaveValue(VALID.name)
  })

  it('D4: ignores a second click while the first is in flight', async () => {
    let resolveSend
    apiSubmitContactForm.mockImplementation(
      () => new Promise((resolve) => { resolveSend = resolve })
    )

    const user = userEvent.setup()
    render(<ContactForm />)
    await fillForm(user)

    const button = submitButton()
    await user.click(button)
    await user.click(button)

    expect(apiSubmitContactForm).toHaveBeenCalledTimes(1)
    resolveSend({ success: true })
  })

  it('D5: disables the button while sending', async () => {
    let resolveSend
    apiSubmitContactForm.mockImplementation(
      () => new Promise((resolve) => { resolveSend = resolve })
    )

    const user = userEvent.setup()
    render(<ContactForm />)
    await fillForm(user)
    await user.click(submitButton())

    await waitFor(() => expect(submitButton()).toBeDisabled())
    resolveSend({ success: true })
  })

  it('D6: accepts a very long message', async () => {
    const longMessage = 'a'.repeat(500)
    const user = userEvent.setup()
    render(<ContactForm />)
    await fillForm(user, { message: longMessage })
    await user.click(submitButton())

    await waitFor(() =>
      expect(apiSubmitContactForm).toHaveBeenCalledWith(
        expect.objectContaining({ message: longMessage })
      )
    )
  })
})
