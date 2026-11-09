// Contact form routes (DT-567). Mounted at /api/contact.
const express = require('express')
const { submitContactForm } = require('../controllers/contactController')

const router = express.Router()

router.post('/', submitContactForm)

module.exports = router
