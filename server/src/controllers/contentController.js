// DT-622 DT-618 Sprint 8
// Preston Ball
// Content and audit history controller handling dynamic pages, sections, cards, colors, text entries, and change logs

const prisma = require('../config/db')
const { sendValidationError } = require('../utils/errorResponse')

// ==========================================
// Pages (DT-622)
// ==========================================

// DT-622 Sprint 8 - Preston Ball: Retrieve all user-created pages
async function getPages (req, res, next) {
  try {
    const pages = await prisma.userCreatedPage.findMany()
    return res.status(200).json(pages)
  } catch (err) {
    return next(err)
  }
}

// DT-622 Sprint 8 - Preston Ball: Retrieve a single user-created page by ID
async function getPageById (req, res, next) {
  try {
    const { id } = req.params
    const page = await prisma.userCreatedPage.findUnique({ where: { id } })
    if (!page) {
      return res.status(404).json({ success: false, error: { message: `Page with ID "${id}" not found` } })
    }
    return res.status(200).json(page)
  } catch (err) {
    return next(err)
  }
}

// DT-622 Sprint 8 - Preston Ball: Create or upsert a user-created page
async function createPage (req, res, next) {
  try {
    const { id, content } = req.body || {}
    const trimmedId = String(id || '').trim()
    if (!trimmedId) {
      return sendValidationError(res, 'Page ID cannot be empty', 'id')
    }

    const page = await prisma.userCreatedPage.upsert({
      where: { id: trimmedId },
      create: { id: trimmedId, content: content || {} },
      update: { content: content || {} }
    })
    return res.status(201).json(page)
  } catch (err) {
    return next(err)
  }
}

// DT-622 Sprint 8 - Preston Ball: Update an existing page
async function updatePage (req, res, next) {
  try {
    const { id } = req.params
    const { content } = req.body || {}

    const existing = await prisma.userCreatedPage.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: `Page with ID "${id}" not found` } })
    }

    const mergedContent = {
      ...(typeof existing.content === 'object' && existing.content !== null ? existing.content : {}),
      ...(typeof content === 'object' && content !== null ? content : {})
    }

    const updated = await prisma.userCreatedPage.update({
      where: { id },
      data: { content: mergedContent }
    })
    return res.status(200).json(updated)
  } catch (err) {
    return next(err)
  }
}

// DT-622 Sprint 8 - Preston Ball: Delete a user-created page
async function deletePage (req, res, next) {
  try {
    const { id } = req.params
    const existing = await prisma.userCreatedPage.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: `Page with ID "${id}" not found` } })
    }

    const removed = await prisma.userCreatedPage.delete({ where: { id } })
    return res.status(200).json(removed)
  } catch (err) {
    return next(err)
  }
}

// ==========================================
// Sections (DT-622)
// ==========================================

// DT-622 Sprint 8 - Preston Ball: Retrieve all sections with normalized color properties
async function getSections (req, res, next) {
  try {
    const sections = await prisma.userCreatedSection.findMany()
    const mapped = sections.map((sec) => {
      const content = sec.content || {}
      return {
        id: sec.id,
        layout: sec.layout,
        colors: content.colors || { backgroundColor: 'color-charcoal', headerColor: 'color-light-green', textColor: 'color-slate', accentColor: 'color-navy' },
        content
      }
    })
    return res.status(200).json(mapped)
  } catch (err) {
    return next(err)
  }
}

// DT-622 Sprint 8 - Preston Ball: Retrieve a single section by ID
async function getSectionById (req, res, next) {
  try {
    const { id } = req.params
    const sec = await prisma.userCreatedSection.findUnique({ where: { id } })
    if (!sec) {
      return res.status(404).json({ success: false, error: { message: `Section with ID "${id}" not found` } })
    }
    const content = sec.content || {}
    return res.status(200).json({
      id: sec.id,
      layout: sec.layout,
      colors: content.colors || {},
      content
    })
  } catch (err) {
    return next(err)
  }
}

// DT-622 Sprint 8 - Preston Ball: Create a new section
async function createSection (req, res, next) {
  try {
    const { id, layout = 'HEADER_TEXT', colors, content = {} } = req.body || {}
    const trimmedId = String(id || '').trim()
    if (!trimmedId) {
      return sendValidationError(res, 'Section ID cannot be empty', 'id')
    }

    const mergedContent = {
      ...content,
      colors: colors || content.colors || { backgroundColor: 'color-charcoal', headerColor: 'color-light-green', textColor: 'color-slate', accentColor: 'color-navy' }
    }

    const created = await prisma.userCreatedSection.upsert({
      where: { id: trimmedId },
      create: { id: trimmedId, layout, content: mergedContent },
      update: { layout, content: mergedContent }
    })

    return res.status(201).json({
      id: created.id,
      layout: created.layout,
      colors: mergedContent.colors,
      content: mergedContent
    })
  } catch (err) {
    return next(err)
  }
}

// DT-622 Sprint 8 - Preston Ball: Update an existing section
async function updateSection (req, res, next) {
  try {
    const { id } = req.params
    const { layout, colors, content } = req.body || {}

    const existing = await prisma.userCreatedSection.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: `Section with ID "${id}" not found` } })
    }

    const existingContent = existing.content || {}
    const mergedContent = {
      ...existingContent,
      ...(content || {}),
      colors: colors || (content && content.colors) || existingContent.colors || {}
    }

    const updated = await prisma.userCreatedSection.update({
      where: { id },
      data: {
        layout: layout || existing.layout,
        content: mergedContent
      }
    })

    return res.status(200).json({
      id: updated.id,
      layout: updated.layout,
      colors: mergedContent.colors,
      content: mergedContent
    })
  } catch (err) {
    return next(err)
  }
}

// DT-622 Sprint 8 - Preston Ball: Delete a section
async function deleteSection (req, res, next) {
  try {
    const { id } = req.params
    const existing = await prisma.userCreatedSection.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: `Section with ID "${id}" not found` } })
    }
    const removed = await prisma.userCreatedSection.delete({ where: { id } })
    return res.status(200).json(removed)
  } catch (err) {
    return next(err)
  }
}

// ==========================================
// Cards (DT-622)
// ==========================================

// DT-622 Sprint 8 - Preston Ball: Retrieve all card elements
async function getCards (req, res, next) {
  try {
    const cards = await prisma.userCreatedCard.findMany()
    const mapped = cards.map((card) => {
      const content = card.content || {}
      return {
        id: card.id,
        layout: card.layout,
        colors: content.colors || { backgroundColor: 'color-charcoal', headerColor: 'color-light-green', textColor: 'color-slate', accentColor: 'color-navy' },
        content
      }
    })
    return res.status(200).json(mapped)
  } catch (err) {
    return next(err)
  }
}

// DT-622 Sprint 8 - Preston Ball: Retrieve a single card by ID
async function getCardById (req, res, next) {
  try {
    const { id } = req.params
    const card = await prisma.userCreatedCard.findUnique({ where: { id } })
    if (!card) {
      return res.status(404).json({ success: false, error: { message: `Card with ID "${id}" not found` } })
    }
    const content = card.content || {}
    return res.status(200).json({
      id: card.id,
      layout: card.layout,
      colors: content.colors || {},
      content
    })
  } catch (err) {
    return next(err)
  }
}

// DT-622 Sprint 8 - Preston Ball: Create a new card
async function createCard (req, res, next) {
  try {
    const { id, layout = 'HEADER_TEXT_BOX', colors, content = {} } = req.body || {}
    const trimmedId = String(id || '').trim()
    if (!trimmedId) {
      return sendValidationError(res, 'Card ID cannot be empty', 'id')
    }

    const mergedContent = {
      ...content,
      colors: colors || content.colors || { backgroundColor: 'color-charcoal', headerColor: 'color-light-green', textColor: 'color-slate', accentColor: 'color-navy' }
    }

    const created = await prisma.userCreatedCard.upsert({
      where: { id: trimmedId },
      create: { id: trimmedId, layout, content: mergedContent },
      update: { layout, content: mergedContent }
    })

    return res.status(201).json({
      id: created.id,
      layout: created.layout,
      colors: mergedContent.colors,
      content: mergedContent
    })
  } catch (err) {
    return next(err)
  }
}

// DT-622 Sprint 8 - Preston Ball: Update an existing card
async function updateCard (req, res, next) {
  try {
    const { id } = req.params
    const { layout, colors, content } = req.body || {}

    const existing = await prisma.userCreatedCard.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: `Card with ID "${id}" not found` } })
    }

    const existingContent = existing.content || {}
    const mergedContent = {
      ...existingContent,
      ...(content || {}),
      colors: colors || (content && content.colors) || existingContent.colors || {}
    }

    const updated = await prisma.userCreatedCard.update({
      where: { id },
      data: {
        layout: layout || existing.layout,
        content: mergedContent
      }
    })

    return res.status(200).json({
      id: updated.id,
      layout: updated.layout,
      colors: mergedContent.colors,
      content: mergedContent
    })
  } catch (err) {
    return next(err)
  }
}

// DT-622 Sprint 8 - Preston Ball: Delete a card
async function deleteCard (req, res, next) {
  try {
    const { id } = req.params
    const existing = await prisma.userCreatedCard.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: `Card with ID "${id}" not found` } })
    }
    const removed = await prisma.userCreatedCard.delete({ where: { id } })
    return res.status(200).json(removed)
  } catch (err) {
    return next(err)
  }
}

// ==========================================
// Colors (DT-622)
// ==========================================

// DT-622 Sprint 8 - Preston Ball: Retrieve all colors
async function getColors (req, res, next) {
  try {
    const colors = await prisma.color.findMany()
    return res.status(200).json(colors)
  } catch (err) {
    return next(err)
  }
}

// DT-622 Sprint 8 - Preston Ball: Retrieve a single color by ID
async function getColorById (req, res, next) {
  try {
    const { id } = req.params
    const color = await prisma.color.findUnique({ where: { id } })
    if (!color) {
      return res.status(404).json({ success: false, error: { message: `Color with ID "${id}" not found` } })
    }
    return res.status(200).json(color)
  } catch (err) {
    return next(err)
  }
}

// DT-622 Sprint 8 - Preston Ball: Create a new color
async function createColor (req, res, next) {
  try {
    const { id, lightModeColor, darkModeColor } = req.body || {}
    const trimmedId = String(id || '').trim()
    if (!trimmedId) {
      return sendValidationError(res, 'Color ID cannot be empty', 'id')
    }

    const created = await prisma.color.upsert({
      where: { id: trimmedId },
      create: {
        id: trimmedId,
        lightModeColor: lightModeColor || '#000000',
        darkModeColor: darkModeColor || '#ffffff'
      },
      update: {
        lightModeColor: lightModeColor || '#000000',
        darkModeColor: darkModeColor || '#ffffff'
      }
    })
    return res.status(201).json(created)
  } catch (err) {
    return next(err)
  }
}

// DT-622 Sprint 8 - Preston Ball: Update an existing color
async function updateColor (req, res, next) {
  try {
    const { id } = req.params
    const { lightModeColor, darkModeColor } = req.body || {}

    const existing = await prisma.color.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: `Color with ID "${id}" not found` } })
    }

    const updated = await prisma.color.update({
      where: { id },
      data: {
        lightModeColor: lightModeColor ?? existing.lightModeColor,
        darkModeColor: darkModeColor ?? existing.darkModeColor
      }
    })
    return res.status(200).json(updated)
  } catch (err) {
    return next(err)
  }
}

// DT-622 Sprint 8 - Preston Ball: Delete a color
async function deleteColor (req, res, next) {
  try {
    const { id } = req.params
    const existing = await prisma.color.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ success: false, error: { message: `Color with ID "${id}" not found` } })
    }
    const removed = await prisma.color.delete({ where: { id } })
    return res.status(200).json(removed)
  } catch (err) {
    return next(err)
  }
}

// ==========================================
// Text Entries & Translations (DT-622)
// ==========================================

// DT-622 Sprint 8 - Preston Ball: Retrieve all text entries
async function getTextEntries (req, res, next) {
  try {
    const entries = await prisma.textEntry.findMany()
    return res.status(200).json(entries)
  } catch (err) {
    return next(err)
  }
}

// DT-622 Sprint 8 - Preston Ball: Create or upsert a text entry
async function saveTextEntry (req, res, next) {
  try {
    const { id, jsonPath, translationJsonPath, englishText } = req.body || {}
    const trimmedId = String(id || '').trim()
    if (!trimmedId) {
      return sendValidationError(res, 'Text entry ID cannot be empty', 'id')
    }

    const path = jsonPath || translationJsonPath || trimmedId
    const text = englishText !== undefined ? String(englishText) : ''

    const saved = await prisma.textEntry.upsert({
      where: { id: trimmedId },
      create: { id: trimmedId, jsonPath: path, englishText: text },
      update: { jsonPath: path, englishText: text }
    })

    return res.status(200).json({ success: true, ...saved })
  } catch (err) {
    return next(err)
  }
}

// DT-622 Sprint 8 - Preston Ball: Handle translation updates from contentStorageService
async function saveTranslation (req, res, next) {
  try {
    const { keyPath, content } = req.body || {}
    const pathKey = Array.isArray(keyPath) ? keyPath.join('.') : String(keyPath || '').trim()
    if (!pathKey) {
      return sendValidationError(res, 'Translation key path cannot be empty', 'keyPath')
    }

    const saved = await prisma.textEntry.upsert({
      where: { id: pathKey },
      create: { id: pathKey, jsonPath: pathKey, englishText: String(content || '') },
      update: { jsonPath: pathKey, englishText: String(content || '') }
    })

    return res.status(200).json({ success: true, ...saved })
  } catch (err) {
    return next(err)
  }
}

// ==========================================
// Applied Changes & Audit History (DT-618)
// ==========================================

// DT-618 Sprint 8 - Preston Ball: Retrieve all applied change audit logs ordered newest first
async function getAppliedChanges (req, res, next) {
  try {
    const logs = await prisma.appliedChange.findMany({
      orderBy: { time: 'desc' }
    })
    return res.status(200).json(logs)
  } catch (err) {
    return next(err)
  }
}

// DT-618 Sprint 8 - Preston Ball: Record a new applied change audit entry
async function createAppliedChange (req, res, next) {
  try {
    const { id, user, time, changeContent, status = 'applied' } = req.body || {}
    const randomId = id || (crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '').substring(0, 16) : Math.random().toString(16).substring(2, 18))
    const userUuid = user || (req.user && req.user.id) || 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'

    const record = await prisma.appliedChange.create({
      data: {
        id: randomId,
        user: userUuid,
        time: time ? new Date(time) : new Date(),
        status,
        changeContent: changeContent || {}
      }
    })

    return res.status(201).json(record)
  } catch (err) {
    return next(err)
  }
}

// DT-618 Sprint 8 - Preston Ball: Mark an applied change as undone and revert associated edits
async function undoAppliedChange (req, res, next) {
  try {
    const { id } = req.params
    const target = await prisma.appliedChange.findUnique({ where: { id } })
    if (!target) {
      return res.status(404).json({ success: false, error: { message: `Audit log entry with ID "${id}" not found` } })
    }

    if (target.status === 'undone' || target.status === 'reverted') {
      return res.status(400).json({ success: false, error: { message: 'This change has already been undone.' } })
    }

    const changeContent = target.changeContent || {}
    const { additions = [], deletions = [], edits = {} } = changeContent

    // DT-618 Sprint 8 - Preston Ball: Revert edits if before state is recorded
    for (const [key, diff] of Object.entries(edits)) {
      if (diff && diff.before) {
        if (key.startsWith('section.')) {
          const secId = key.replace('section.', '')
          const beforeSec = diff.before
          await prisma.userCreatedSection.update({
            where: { id: secId },
            data: {
              layout: beforeSec.layout || 'HEADER_TEXT',
              content: {
                ...(beforeSec.content || {}),
                colors: beforeSec.colors || {}
              }
            }
          }).catch(() => {})
        } else if (key.startsWith('card.')) {
          const cardId = key.replace('card.', '')
          const beforeCard = diff.before
          await prisma.userCreatedCard.update({
            where: { id: cardId },
            data: {
              layout: beforeCard.layout || 'HEADER_TEXT_BOX',
              content: {
                ...(beforeCard.content || {}),
                colors: beforeCard.colors || {}
              }
            }
          }).catch(() => {})
        } else if (key.startsWith('page.')) {
          const pageId = key.replace('page.', '')
          const beforePage = diff.before
          await prisma.userCreatedPage.update({
            where: { id: pageId },
            data: { content: beforePage.content || {} }
          }).catch(() => {})
        } else if (key.startsWith('color.')) {
          const colorId = key.replace('color.', '')
          const beforeColor = diff.before
          await prisma.color.update({
            where: { id: colorId },
            data: {
              lightModeColor: beforeColor.lightModeColor,
              darkModeColor: beforeColor.darkModeColor
            }
          }).catch(() => {})
        }
      }
    }

    const updated = await prisma.appliedChange.update({
      where: { id },
      data: { status: 'undone' }
    })

    return res.status(200).json({
      success: true,
      undoneId: id,
      record: updated,
      additions,
      deletions,
      edits
    })
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  getPages,
  getPageById,
  createPage,
  updatePage,
  deletePage,
  getSections,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
  getCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard,
  getColors,
  getColorById,
  createColor,
  updateColor,
  deleteColor,
  getTextEntries,
  saveTextEntry,
  saveTranslation,
  getAppliedChanges,
  createAppliedChange,
  undoAppliedChange
}
