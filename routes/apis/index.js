const express = require('express')
const router = express.Router()
const userController = require('../../controllers/apis/user-controller')
const passport = require('../../config/passport')

const { apiErrorHandler } = require('../../middleware/error-handler')

router.post('/users/register', userController.register)

router.post('/users/login', passport.authenticate('local', { session: false }), userController.login)

router.use(apiErrorHandler)

module.exports = router
