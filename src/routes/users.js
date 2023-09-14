const express = require('express')
const router = express.Router()
const userController = require('../controllers/user-controller')
const passport = require('../../config/passport')
const { authenticated } = require('../middleware/api-auth')

router.post('/users/register', userController.register)
router.post('/users/login', passport.authenticate('local', { session: false }), userController.login)
router.post('/users/applyTeacher', authenticated, userController.applyTeacher)
router.get('/users/topLearningUsers', authenticated, userController.getTopLearningUsers)
router.get('/users/me', authenticated, (req, res) => {
  res.json({ status: 'success', data: req.user })
})
router.get('/users/:id', authenticated, userController.getUser)

module.exports = router
