// DT-568: unit tests for contact form input rules.
const { validateContactForm, LIMITS } = require('../contactValidation')

const VALID = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  message: 'I would like to ask about home health services for my mother.'
}

describe('validateContactForm', () => {
  describe('happy path', () => {
    it('accepts a well-formed submission', () => {
      expect(validateContactForm(VALID)).toBeNull()
    })

    it('accepts a name at the minimum length', () => {
      expect(validateContactForm({ ...VALID, name: 'Jo' })).toBeNull()
    })

    it('accepts a name at the maximum length', () => {
      const name = 'a'.repeat(LIMITS.name.max)
      expect(validateContactForm({ ...VALID, name })).toBeNull()
    })

    it('accepts a message at the maximum length', () => {
      const message = 'a'.repeat(LIMITS.message.max)
      expect(validateContactForm({ ...VALID, message })).toBeNull()
    })

    it('accepts up to three links in a message', () => {
      const message = 'See http://a.com and http://b.com and http://c.com please.'
      expect(validateContactForm({ ...VALID, message })).toBeNull()
    })
  })

  describe('name field', () => {
    it.each([
      ['empty string', ''],
      ['whitespace only', '   '],
      ['missing', undefined],
      ['null', null],
      ['a number', 12345]
    ])('rejects a name that is %s', (_label, name) => {
      const result = validateContactForm({ ...VALID, name })
      expect(result).not.toBeNull()
      expect(result.field).toBe('name')
    })

    it('rejects a single-character name', () => {
      const result = validateContactForm({ ...VALID, name: 'J' })
      expect(result.field).toBe('name')
    })

    it('rejects a name over the maximum length', () => {
      const name = 'a'.repeat(LIMITS.name.max + 1)
      const result = validateContactForm({ ...VALID, name })
      expect(result.field).toBe('name')
    })
  })

  describe('email field', () => {
    it.each([
      ['empty string', ''],
      ['whitespace only', '   '],
      ['missing', undefined],
      ['no @ sign', 'janeexample.com'],
      ['no domain', 'jane@'],
      ['no local part', '@example.com'],
      ['no TLD', 'jane@example'],
      ['contains a space', 'jane doe@example.com']
    ])('rejects an email that is %s', (_label, email) => {
      const result = validateContactForm({ ...VALID, email })
      expect(result).not.toBeNull()
      expect(result.field).toBe('email')
    })

    it('rejects an email over the maximum length', () => {
      const email = `${'a'.repeat(LIMITS.email.max)}@example.com`
      const result = validateContactForm({ ...VALID, email })
      expect(result.field).toBe('email')
    })
  })

  describe('message field', () => {
    it.each([
      ['empty string', ''],
      ['whitespace only', '      '],
      ['missing', undefined],
      ['too short', 'hi'],
      ['one character short', 'a'.repeat(LIMITS.message.min - 1)]
    ])('rejects a message that is %s', (_label, message) => {
      const result = validateContactForm({ ...VALID, message })
      expect(result).not.toBeNull()
      expect(result.field).toBe('message')
    })

    it('rejects a message over the maximum length', () => {
      const message = 'a'.repeat(LIMITS.message.max + 1)
      const result = validateContactForm({ ...VALID, message })
      expect(result.field).toBe('message')
    })

    it('rejects a message with more than three links as likely spam', () => {
      const message = 'http://a.com http://b.com http://c.com http://d.com buy now'
      const result = validateContactForm({ ...VALID, message })
      expect(result.field).toBe('message')
    })
  })

  describe('field precedence', () => {
    it('reports the name first when every field is empty', () => {
      const result = validateContactForm({ name: '', email: '', message: '' })
      expect(result.field).toBe('name')
    })

    it('reports the email when only the name is valid', () => {
      const result = validateContactForm({ name: 'Jane Doe', email: '', message: '' })
      expect(result.field).toBe('email')
    })
  })

  describe('malformed input', () => {
    it('does not throw on an empty object', () => {
      expect(() => validateContactForm({})).not.toThrow()
    })

    it('reports a problem rather than passing for an empty object', () => {
      expect(validateContactForm({})).not.toBeNull()
    })
  })
})
