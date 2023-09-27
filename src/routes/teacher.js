const express = require('express')
const router = express.Router()
const { authenticated, authenticatedTeacher } = require('../middleware/api-auth')
const teacherController = require('../controllers/teacher-controller')


router.get('/teachers/me', authenticated, authenticatedTeacher, teacherController.getMe)
router.get('/teachers', authenticated, teacherController.getTeachers)

router.get('/teachers/:id', authenticated, teacherController.getTeacher)

router.put('/teachers/:id', authenticated, authenticatedTeacher, teacherController.putTeacher)

router.get('/lessons/myLessons', authenticated, authenticatedTeacher, teacherController.getMyLessons) // 廢棄
router.post('/lessons', authenticated, authenticatedTeacher, teacherController.postLesson)
router.delete('/lessons/:id', authenticated, authenticatedTeacher, teacherController.deleteLesson)
module.exports = router
