const request = require('supertest')
const express = require('express')

// Keep the real template, but never actually send.
jest.mock('../../services/notificationService', () => ({
  sendEmail: jest.fn().mockResolvedValue({ delivered: true, channel: 'email' })
}))

const { sendEmail } = require('../../services/notificationService')
const contactRoutes = require('../../routes/contactRoutes')

process.env.CONTACT_FORM_RECIPIENT = 'test@example.com'

function makeApp () {
  const app = express()
  app.use(express.json())
  app.use('/api/contact', contactRoutes)
  return app
}

const VALID = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  message: 'I would like to ask about home health services for my mother.'
}

describe('POST /api/contact', () => {
  beforeEach(() => jest.clearAllMocks())

  it('accepts a valid submission and sends one email', async () => {
    const res = await request(makeApp()).post('/api/contact').send(VALID)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(sendEmail).toHaveBeenCalledTimes(1)
  })

  it('sends the email to the configured recipient with a reply-to', async () => {
    await request(makeApp()).post('/api/contact').send(VALID)

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        replyTo: VALID.email,
        html: expect.stringContaining('Jane Doe')
      })
    )
  })

  it.each([
    ['name', { ...VALID, name: '' }],
    ['email', { ...VALID, email: '' }],
    ['message', { ...VALID, message: '' }]
  ])('rejects a submission with no %s', async (field, payload) => {
    const res = await request(makeApp()).post('/api/contact').send(payload)

    expect(res.status).toBe(400)
    expect(res.body.error.field).toBe(field)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('rejects a malformed email address', async () => {
    const res = await request(makeApp())
      .post('/api/contact')
      .send({ ...VALID, email: 'not-an-email' })

    expect(res.status).toBe(400)
    expect(res.body.error.field).toBe('email')
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('rejects a message that is too short to act on', async () => {
    const res = await request(makeApp())
      .post('/api/contact')
      .send({ ...VALID, message: 'hi' })

    expect(res.status).toBe(400)
    expect(res.body.error.field).toBe('message')
  })

  it('rejects an empty body without throwing', async () => {
    const res = await request(makeApp()).post('/api/contact').send({})

    expect(res.status).toBe(400)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('escapes HTML so a crafted message cannot inject markup', async () => {
    await request(makeApp())
      .post('/api/contact')
      .send({ ...VALID, message: 'Hello <script>alert(1)</script> there, please help.' })

    const { html } = sendEmail.mock.calls[0][0]
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('trims surrounding whitespace before sending', async () => {
    await request(makeApp())
      .post('/api/contact')
      .send({ ...VALID, name: '   Jane Doe   ' })

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ subject: expect.stringContaining('Jane Doe') })
    )
    expect(sendEmail.mock.calls[0][0].subject).not.toContain('   ')
  })
})
