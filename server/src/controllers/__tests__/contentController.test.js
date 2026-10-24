// DT-622 DT-618 Sprint 8
// Preston Ball
// Unit and integration tests for content editor and audit history endpoints

const request = require('supertest')
const express = require('express')

// Mock Prisma
jest.mock('../../config/db', () => ({
  userCreatedPage: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  userCreatedSection: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  userCreatedCard: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  color: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  textEntry: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    upsert: jest.fn()
  },
  appliedChange: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  }
}))

const prisma = require('../../config/db')
const contentRoutes = require('../../routes/contentRoutes')

const app = express()
app.use(express.json())
app.use('/api/admin/content', contentRoutes)

describe('Content & Audit History API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // DT-622: Pages
  describe('Pages API (DT-622)', () => {
    test('GET /api/admin/content/pages returns page list', async () => {
      const mockPages = [{ id: 'landing', content: { title: 'Landing' } }]
      prisma.userCreatedPage.findMany.mockResolvedValue(mockPages)

      const res = await request(app).get('/api/admin/content/pages')
      expect(res.status).toBe(200)
      expect(res.body).toEqual(mockPages)
    })

    test('POST /api/admin/content/pages validates empty id', async () => {
      const res = await request(app).post('/api/admin/content/pages').send({ id: '' })
      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.error.field).toBe('id')
    })

    test('POST /api/admin/content/pages upserts successfully', async () => {
      const pageData = { id: 'about', content: { title: 'About Us', sectionIds: [] } }
      prisma.userCreatedPage.upsert.mockResolvedValue(pageData)

      const res = await request(app).post('/api/admin/content/pages').send(pageData)
      expect(res.status).toBe(201)
      expect(res.body.id).toBe('about')
    })

    test('DELETE /api/admin/content/pages/:id deletes page', async () => {
      prisma.userCreatedPage.findUnique.mockResolvedValue({ id: 'about' })
      prisma.userCreatedPage.delete.mockResolvedValue({ id: 'about' })

      const res = await request(app).delete('/api/admin/content/pages/about')
      expect(res.status).toBe(200)
      expect(res.body.id).toBe('about')
    })
  })

  // DT-622: Sections
  describe('Sections API (DT-622)', () => {
    test('GET /api/admin/content/sections returns mapped sections', async () => {
      prisma.userCreatedSection.findMany.mockResolvedValue([
        { id: 'sec-1', layout: 'HEADER_TEXT', content: { header: 'Hello', colors: { backgroundColor: '#fff' } } }
      ])

      const res = await request(app).get('/api/admin/content/sections')
      expect(res.status).toBe(200)
      expect(res.body[0].id).toBe('sec-1')
      expect(res.body[0].colors.backgroundColor).toBe('#fff')
    })

    test('POST /api/admin/content/sections validates id', async () => {
      const res = await request(app).post('/api/admin/content/sections').send({ id: '' })
      expect(res.status).toBe(400)
      expect(res.body.error.field).toBe('id')
    })

    test('POST /api/admin/content/sections creates section', async () => {
      const secData = { id: 'sec-new', layout: 'HEADER_TEXT', content: { header: 'New Sec' } }
      prisma.userCreatedSection.upsert.mockResolvedValue({
        id: 'sec-new',
        layout: 'HEADER_TEXT',
        content: { header: 'New Sec', colors: {} }
      })

      const res = await request(app).post('/api/admin/content/sections').send(secData)
      expect(res.status).toBe(201)
      expect(res.body.id).toBe('sec-new')
    })
  })

  // DT-622: Cards
  describe('Cards API (DT-622)', () => {
    test('GET /api/admin/content/cards returns cards', async () => {
      prisma.userCreatedCard.findMany.mockResolvedValue([
        { id: 'card-1', layout: 'HEADER_TEXT_BOX', content: { header: 'Care', colors: {} } }
      ])

      const res = await request(app).get('/api/admin/content/cards')
      expect(res.status).toBe(200)
      expect(res.body[0].id).toBe('card-1')
    })

    test('POST /api/admin/content/cards creates card', async () => {
      const cardData = { id: 'card-2', layout: 'HEADER_TEXT_BOX', content: { header: 'Support' } }
      prisma.userCreatedCard.upsert.mockResolvedValue({
        id: 'card-2',
        layout: 'HEADER_TEXT_BOX',
        content: { header: 'Support', colors: {} }
      })

      const res = await request(app).post('/api/admin/content/cards').send(cardData)
      expect(res.status).toBe(201)
      expect(res.body.id).toBe('card-2')
    })
  })

  // DT-622: Colors
  describe('Colors API (DT-622)', () => {
    test('GET /api/admin/content/colors returns colors', async () => {
      prisma.color.findMany.mockResolvedValue([
        { id: 'color-sage', lightModeColor: '#9DA191', darkModeColor: '#1e293b' }
      ])

      const res = await request(app).get('/api/admin/content/colors')
      expect(res.status).toBe(200)
      expect(res.body[0].id).toBe('color-sage')
    })

    test('POST /api/admin/content/colors creates color', async () => {
      const colorData = { id: 'color-blue', lightModeColor: '#00f', darkModeColor: '#008' }
      prisma.color.upsert.mockResolvedValue(colorData)

      const res = await request(app).post('/api/admin/content/colors').send(colorData)
      expect(res.status).toBe(201)
      expect(res.body.id).toBe('color-blue')
    })
  })

  // DT-622: Text Entries
  describe('Text Entries API (DT-622)', () => {
    test('POST /api/admin/content/text-entries saves entry', async () => {
      const entry = { id: 'landing.title', jsonPath: 'landing.title', englishText: 'Welcome' }
      prisma.textEntry.upsert.mockResolvedValue(entry)

      const res = await request(app).post('/api/admin/content/text-entries').send(entry)
      expect(res.status).toBe(200)
      expect(res.body.englishText).toBe('Welcome')
    })
  })

  // DT-618: Audit History
  describe('Applied Change Audit API (DT-618)', () => {
    test('GET /api/admin/content/applied-changes returns logs', async () => {
      prisma.appliedChange.findMany.mockResolvedValue([
        { id: 'log123', user: 'user-uuid', status: 'applied', time: new Date() }
      ])

      const res = await request(app).get('/api/admin/content/applied-changes')
      expect(res.status).toBe(200)
      expect(res.body[0].id).toBe('log123')
    })

    test('POST /api/admin/content/applied-changes records log entry', async () => {
      const logData = { id: 'log456', user: 'user-uuid', changeContent: { additions: [] } }
      prisma.appliedChange.create.mockResolvedValue({ ...logData, status: 'applied', time: new Date() })

      const res = await request(app).post('/api/admin/content/applied-changes').send(logData)
      expect(res.status).toBe(201)
      expect(res.body.id).toBe('log456')
    })

    test('POST /api/admin/content/applied-changes/:id/undo marks undone and reverts', async () => {
      prisma.appliedChange.findUnique.mockResolvedValue({
        id: 'log456',
        status: 'applied',
        changeContent: {
          edits: {
            'section.sec-1': { before: { layout: 'HEADER_TEXT', content: { header: 'Old' } } }
          }
        }
      })
      prisma.userCreatedSection.update.mockResolvedValue({})
      prisma.appliedChange.update.mockResolvedValue({ id: 'log456', status: 'undone' })

      const res = await request(app).post('/api/admin/content/applied-changes/log456/undo')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.undoneId).toBe('log456')
    })
  })
})
