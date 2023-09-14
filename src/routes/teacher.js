const express = require('express')
const router = express.Router()
const { authenticated, authenticatedTeacher } = require('../middleware/api-auth')
const teacherController = require('../controllers/teacher-controller')

router.get('/teachers', authenticated, teacherController.getAllTeachers)
router.post('/teachers/addLesson', authenticated, authenticatedTeacher, teacherController.addLesson)
router.get('/teachers/me', authenticated, authenticatedTeacher, teacherController.showMe)

module.exports = router
