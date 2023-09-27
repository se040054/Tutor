const express = require('express')
const router = express.Router()
const userController = require('../controllers/user-controller')
const passport = require('../../config/passport')
const { authenticated } = require('../middleware/api-auth')
const upload = require('../middleware/multer')

router.post('/users/register', userController.register)
router.post('/users/login', passport.authenticate('local', { session: false }), userController.login)
router.post('/users/googleLogin', userController.googleLogin)
router.post('/users/applyTeacher', authenticated, userController.applyTeacher)
router.get('/users/topLearningUsers', authenticated, userController.getTopLearningUsers)

router.get('/users/me', authenticated, userController.getMe)

router.get('/users/:id', authenticated, userController.getUser)
router.put('/users/:id', upload.single('image'), authenticated, userController.putUser)

router.post('/reserve/:lessonId', authenticated, userController.postReserve)
router.delete('/reserve/:lessonId', authenticated, userController.deleteReserve)

router.post('/rating/:reserveId', authenticated, userController.postRating)

module.exports = router
