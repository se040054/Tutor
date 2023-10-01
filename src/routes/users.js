const express = require('express')
const router = express.Router()
const userController = require('../controllers/user-controller')
const passport = require('../../config/passport')
const { authenticated } = require('../middleware/api-auth')
const upload = require('../middleware/multer')

router.post('/users/register', userController.register)

router.post('/users/login', (req, res, next) => {
  if (!req.body.email || !req.body.password) throw new Error('請填寫密碼及信箱')
  passport.authenticate('local', { session: false })(req, res, next)
}, userController.login) // 驗證登入要在中間件之前 否則無法客製訊息及驗證表單

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
