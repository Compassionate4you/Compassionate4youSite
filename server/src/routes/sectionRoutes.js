// Card section routes. Mounted at /api/sections.
const express = require('express');
const {
    getSection,
    getSectionForEdit,
    listSections,
    updateSection,
} = require('../controllers/sectionController');
const { requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', requireAdmin, listSections);
router.get('/:slug/edit', requireAdmin, getSectionForEdit);
router.get('/:slug', getSection);
router.put('/:slug', requireAdmin, updateSection);

module.exports = router;