// DT-622 DT-618 DT-625 Sprint 8
// Preston Ball
// Content management and audit history routes

const express = require('express')
const router = express.Router()
const contentController = require('../controllers/contentController')

// DT-622 DT-625 Sprint 8 - Preston Ball: Page management routes
router.get('/pages', contentController.getPages)
router.put('/pages/reorder', contentController.reorderPages)
router.post('/pages/reorder', contentController.reorderPages)
router.post('/pages/rename', contentController.renamePage)
router.get('/pages/:id', contentController.getPageById)
router.post('/pages', contentController.createPage)
router.put('/pages/:id', contentController.updatePage)
router.delete('/pages/:id', contentController.deletePage)

// DT-622 DT-625 Sprint 8 - Preston Ball: Section management routes
router.get('/sections', contentController.getSections)
router.post('/sections/rename', contentController.renameSection)
router.get('/sections/:id', contentController.getSectionById)
router.post('/sections', contentController.createSection)
router.put('/sections/:id', contentController.updateSection)
router.delete('/sections/:id', contentController.deleteSection)

// DT-622 DT-625 Sprint 8 - Preston Ball: Card management routes
router.get('/cards', contentController.getCards)
router.post('/cards/rename', contentController.renameCard)
router.get('/cards/:id', contentController.getCardById)
router.post('/cards', contentController.createCard)
router.put('/cards/:id', contentController.updateCard)
router.delete('/cards/:id', contentController.deleteCard)

// DT-622 Sprint 8 - Preston Ball: Color configuration routes
router.get('/colors', contentController.getColors)
router.get('/colors/:id', contentController.getColorById)
router.post('/colors', contentController.createColor)
router.put('/colors/:id', contentController.updateColor)
router.delete('/colors/:id', contentController.deleteColor)

// DT-622 Sprint 8 - Preston Ball: Text entry & translation routes
router.get('/text-entries', contentController.getTextEntries)
router.post('/text-entries', contentController.saveTextEntry)
router.post('/translations', contentController.saveTranslation)

// DT-618 Sprint 8 - Preston Ball: Applied change audit history routes
router.get('/applied-changes', contentController.getAppliedChanges)
router.post('/applied-changes', contentController.createAppliedChange)
router.post('/applied-changes/:id/undo', contentController.undoAppliedChange)

module.exports = router
