const express = require('express')
const router = express.Router()
const userController = require('../controllers/user-controller')
const passport = require('../../config/passport')

router.post('/users/register', userController.register)

router.post('/users/login', passport.authenticate('local', { session: false }), userController.login)

module.exports = router
