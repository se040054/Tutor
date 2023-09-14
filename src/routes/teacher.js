const express = require('express')
const router = express.Router()
const { authenticated, authenticatedTeacher } = require('../middleware/api-auth')
const teacherController = require('../controllers/teacher-controller')

router.get('/teachers/me', authenticated, authenticatedTeacher, teacherController.showMe)

router.get('/teachers/:id', authenticated, teacherController.getTeacher)
router.put('/teachers/:id', authenticated, authenticatedTeacher, teacherController.putTeacher)
router.get('/teachers', authenticated, teacherController.getTeachers)
router.post('/teachers/addLesson', authenticated, authenticatedTeacher, teacherController.addLesson)

module.exports = router
