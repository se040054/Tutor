const express = require('express')
const router = express.Router()
const adminController = require('../controllers/admin-controller')
const { authenticated, authenticatedAdmin } = require('../middleware/api-auth')

router.get('/admin/users', authenticated, authenticatedAdmin, adminController.getUsers)

module.exports = router
