// DT-629 / DT-630 / DT-631 / DT-632: contact email template tests.
const {
  renderContactEmailHtml,
  renderContactEmailText,
  escapeHtml,
  BRAND
} = require('../contactEmail')

const SAMPLE = {
  name: 'Maria Garcia',
  email: 'maria@example.com',
  message: 'Hello,\n\nI would like to ask about home health care for my father.\n\nThank you.',
  submittedAt: new Date('2026-10-11T14:30:00Z')
}

describe('escapeHtml', () => {
  it.each([
    ['<script>', '&lt;script&gt;'],
    ['a & b', 'a &amp; b'],
    ['"quoted"', '&quot;quoted&quot;'],
    ["it's", 'it&#39;s']
  ])('escapes %s', (input, expected) => {
    expect(escapeHtml(input)).toContain(expected)
  })

  it('returns an empty string for null or undefined', () => {
    expect(escapeHtml(null)).toBe('')
    expect(escapeHtml(undefined)).toBe('')
  })
})

describe('renderContactEmailHtml', () => {
  describe('content (DT-631)', () => {
    it("includes the sender's name", () => {
      expect(renderContactEmailHtml(SAMPLE)).toContain('Maria Garcia')
    })

    it("includes the sender's email address", () => {
      expect(renderContactEmailHtml(SAMPLE)).toContain('maria@example.com')
    })

    it('includes the message body', () => {
      expect(renderContactEmailHtml(SAMPLE)).toContain('home health care for my father')
    })

    it('includes a received timestamp', () => {
      expect(renderContactEmailHtml(SAMPLE)).toMatch(/Received/i)
    })

    it('makes the address a mailto link so staff can reply', () => {
      expect(renderContactEmailHtml(SAMPLE)).toContain('mailto:maria@example.com')
    })
  })

  describe('brand styling (DT-630 / DT-632)', () => {
    it('uses the brand green from global.css', () => {
      expect(renderContactEmailHtml(SAMPLE)).toContain(BRAND.green)
    })

    it('uses the site heading font', () => {
      expect(renderContactEmailHtml(SAMPLE)).toContain('Crimson Text')
    })

    it('uses the page background colour', () => {
      expect(renderContactEmailHtml(SAMPLE)).toContain(BRAND.pageBackground)
    })

    it('inlines its styles, since email clients drop stylesheets', () => {
      const html = renderContactEmailHtml(SAMPLE)
      expect(html).toContain('style="')
      expect(html).not.toContain('<link rel="stylesheet"')
    })

    it('uses table layout for client compatibility', () => {
      expect(renderContactEmailHtml(SAMPLE)).toContain('role="presentation"')
    })

    it('sets a viewport so it renders on phones', () => {
      expect(renderContactEmailHtml(SAMPLE)).toContain('name="viewport"')
    })
  })

  describe('formatting (DT-629)', () => {
    it('splits paragraphs rather than running text together', () => {
      const html = renderContactEmailHtml(SAMPLE)
      const paragraphs = html.match(/<p style="margin:0 0 14px/g) || []
      expect(paragraphs.length).toBeGreaterThan(1)
    })

    it('preserves single line breaks within a paragraph', () => {
      const html = renderContactEmailHtml({
        ...SAMPLE,
        message: 'Line one\nLine two'
      })
      expect(html).toContain('<br />')
    })

    it('is a complete HTML document', () => {
      const html = renderContactEmailHtml(SAMPLE)
      expect(html).toMatch(/^<!DOCTYPE html>/)
      expect(html).toContain('</html>')
    })
  })

  describe('security', () => {
    it('escapes script tags in the message', () => {
      const html = renderContactEmailHtml({
        ...SAMPLE,
        message: 'Hello <script>alert(1)</script> there, I need help.'
      })
      expect(html).not.toContain('<script>alert(1)</script>')
      expect(html).toContain('&lt;script&gt;')
    })

    it('escapes markup in the name', () => {
      const html = renderContactEmailHtml({
        ...SAMPLE,
        name: '<img src=x onerror=alert(1)>'
      })
      expect(html).not.toContain('<img src=x')
    })

    it('escapes markup in the email address', () => {
      const html = renderContactEmailHtml({
        ...SAMPLE,
        email: 'a@b.com"><b>bold</b>'
      })
      expect(html).not.toContain('"><b>bold</b>')
    })
  })

  describe('edge cases', () => {
    it('renders without a submittedAt value', () => {
      const { submittedAt, ...withoutDate } = SAMPLE
      expect(() => renderContactEmailHtml(withoutDate)).not.toThrow()
    })

    it('handles a very long message', () => {
      const html = renderContactEmailHtml({ ...SAMPLE, message: 'a'.repeat(2000) })
      expect(html.length).toBeGreaterThan(2000)
    })

    it('handles accented and non-Latin characters', () => {
      const html = renderContactEmailHtml({ ...SAMPLE, name: 'José Muñoz' })
      expect(html).toContain('José Muñoz')
    })
  })
})

describe('renderContactEmailText', () => {
  it('includes the sender details', () => {
    const text = renderContactEmailText(SAMPLE)
    expect(text).toContain('Maria Garcia')
    expect(text).toContain('maria@example.com')
  })

  it('includes the message body', () => {
    expect(renderContactEmailText(SAMPLE)).toContain('home health care for my father')
  })

  it('contains no HTML tags', () => {
    expect(renderContactEmailText(SAMPLE)).not.toMatch(/<[a-z][\s\S]*>/i)
  })

  it('renders without a submittedAt value', () => {
    const { submittedAt, ...withoutDate } = SAMPLE
    expect(() => renderContactEmailText(withoutDate)).not.toThrow()
  })
})
