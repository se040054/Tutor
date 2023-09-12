const express = require('express')
const router = express.Router()
const { authenticated, authenticatedTeacher } = require('../middleware/api-auth')
const teacherController = require('../controllers/teacher-controller')

router.post('/teachers/addLesson', authenticated, authenticatedTeacher, teacherController.addLesson)

module.exports = router
