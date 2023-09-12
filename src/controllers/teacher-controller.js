const teacherServices = require('../services/teacher-service')
const teacherController = {
  addLesson: (req, res) => {
    teacherServices.addLesson(req, (err, data) => {
      if (err) {
        return res.status(400).json({ status: 'error', message: err.message })
      } else {
        return res.json({ data })
      }
    })
  }

}

module.exports = teacherController
