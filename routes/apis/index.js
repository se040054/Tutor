const express = require('express')
const router = express.Router()

const userController = require('../../controllers/apis/user-controller')

router.post('/users/register', userController.register)

module.exports = router
