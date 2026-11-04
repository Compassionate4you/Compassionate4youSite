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
    create: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  userCreatedSection: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  userCreatedCard: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
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

  // DT-625: Reordering, Renaming, Image Position, and Typography
  describe('Reordering, Cascading Rename, & Typography API (DT-625)', () => {
    test('PUT /api/admin/content/pages/reorder persists updated page ordering', async () => {
      prisma.userCreatedPage.findUnique
        .mockResolvedValueOnce({ id: 'hospice', content: { title: 'Hospice', sectionIds: [] } })
        .mockResolvedValueOnce({ id: 'homeHealth', content: { title: 'Home Health', sectionIds: [] } })
      prisma.userCreatedPage.update
        .mockImplementation(({ where, data }) => Promise.resolve({ id: where.id, content: data.content }))

      const res = await request(app)
        .put('/api/admin/content/pages/reorder')
        .send({ orderedPageIds: ['hospice', 'homeHealth'] })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.pages[0]).toEqual({ id: 'hospice', content: { title: 'Hospice', sectionIds: [], order: 0 } })
      expect(res.body.pages[1]).toEqual({ id: 'homeHealth', content: { title: 'Home Health', sectionIds: [], order: 1 } })
    })

    test('POST /api/admin/content/pages/rename renames page ID', async () => {
      prisma.userCreatedPage.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'old-page', content: { title: 'My Page', sectionIds: ['sec-1'] } })
      prisma.userCreatedPage.create.mockResolvedValue({
        id: 'new-page',
        content: { title: 'My Page', sectionIds: ['sec-1'] }
      })
      prisma.userCreatedPage.delete.mockResolvedValue({ id: 'old-page' })

      const res = await request(app)
        .post('/api/admin/content/pages/rename')
        .send({ oldId: 'old-page', newId: 'new-page' })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.newId).toBe('new-page')
      expect(prisma.userCreatedPage.delete).toHaveBeenCalledWith({ where: { id: 'old-page' } })
    })

    test('POST /api/admin/content/sections/rename renames section ID and cascades across referencing pages', async () => {
      prisma.userCreatedSection.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'sec-old', layout: 'HEADER_TEXT', content: { header: 'Title' } })
      prisma.userCreatedSection.create.mockResolvedValue({
        id: 'sec-new',
        layout: 'HEADER_TEXT',
        content: { header: 'Title' }
      })
      prisma.userCreatedSection.delete.mockResolvedValue({ id: 'sec-old' })
      prisma.userCreatedPage.findMany.mockResolvedValue([
        { id: 'landing', content: { title: 'Landing', sectionIds: ['sec-old', 'sec-other'] } }
      ])
      prisma.userCreatedPage.update.mockResolvedValue({})

      const res = await request(app)
        .post('/api/admin/content/sections/rename')
        .send({ oldId: 'sec-old', newId: 'sec-new' })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.newId).toBe('sec-new')
      expect(prisma.userCreatedPage.update).toHaveBeenCalledWith({
        where: { id: 'landing' },
        data: {
          content: {
            title: 'Landing',
            sectionIds: ['sec-new', 'sec-other']
          }
        }
      })
    })

    test('POST /api/admin/content/cards/rename renames card ID and cascades across referencing sections', async () => {
      prisma.userCreatedCard.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'card-old', layout: 'HEADER_PARAGRAPH', content: { header: 'Card' } })
      prisma.userCreatedCard.create.mockResolvedValue({
        id: 'card-new',
        layout: 'HEADER_PARAGRAPH',
        content: { header: 'Card' }
      })
      prisma.userCreatedCard.delete.mockResolvedValue({ id: 'card-old' })
      prisma.userCreatedSection.findMany.mockResolvedValue([
        { id: 'sec-grid', layout: 'CARD_GRID', content: { cardIds: ['card-old', 'card-2'] } }
      ])
      prisma.userCreatedSection.update.mockResolvedValue({})

      const res = await request(app)
        .post('/api/admin/content/cards/rename')
        .send({ oldId: 'card-old', newId: 'card-new' })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.newId).toBe('card-new')
      expect(prisma.userCreatedSection.update).toHaveBeenCalledWith({
        where: { id: 'sec-grid' },
        data: {
          content: {
            cardIds: ['card-new', 'card-2']
          }
        }
      })
    })

    test('POST and PUT /api/admin/content/sections preserve imagePosition and typography', async () => {
      const sectionPayload = {
        id: 'sec-hero-right',
        layout: 'IMAGE_HEADER_TEXT',
        content: {
          header: 'Right Image Hero',
          text: 'Formatted description',
          imagePosition: 'right',
          typography: {
            header: { align: 'center', fontFamily: 'Georgia, Cambria, serif', bold: true, italic: false },
            text: { align: 'justify', fontFamily: 'inherit', bold: false, italic: true }
          }
        }
      }
      prisma.userCreatedSection.upsert.mockImplementation(({ create }) => Promise.resolve(create))

      const createRes = await request(app).post('/api/admin/content/sections').send(sectionPayload)
      expect(createRes.status).toBe(201)
      expect(createRes.body.content.imagePosition).toBe('right')
      expect(createRes.body.content.typography.header.align).toBe('center')
      expect(createRes.body.content.typography.text.italic).toBe(true)

      prisma.userCreatedSection.findUnique.mockResolvedValue({
        id: 'sec-hero-right',
        layout: 'IMAGE_HEADER_TEXT',
        content: createRes.body.content
      })
      prisma.userCreatedSection.update.mockImplementation(({ where, data }) => Promise.resolve({
        id: where.id,
        layout: data.layout,
        content: data.content
      }))

      const updateRes = await request(app)
        .put('/api/admin/content/sections/sec-hero-right')
        .send({ content: { imagePosition: 'left' } })
      expect(updateRes.status).toBe(200)
      expect(updateRes.body.content.imagePosition).toBe('left')
      expect(updateRes.body.content.typography.header.bold).toBe(true)
    })
  })
})
