const teacherServices = require('../services/teacher-service')
const teacherController = {
  postLesson: (req, res) => {
    teacherServices.postLesson(req, (err, data) => {
      if (err) return res.status(400).json({ status: 'error', message: err.message })
      else return res.json({ data })
    })
  },
  getMe: (req, res) => {
    teacherServices.getMe(req, (err, data) => {
      if (err) return res.status(400).json({ status: 'error', message: err.message })
      else return res.json({ data })
    })
  },
  getTeachers: (req, res) => {
    teacherServices.getTeachers(req, (err, data) => {
      if (err) return res.status(400).json({ status: 'error', message: err.message })
      else return res.json({ data })
    })
  },
  getTeacher: (req, res) => {
    teacherServices.getTeacher(req, (err, data) => {
      if (err) return res.status(400).json({ status: 'error', message: err.message })
      else return res.json({ data })
    })
  },
  putTeacher: (req, res) => {
    teacherServices.putTeacher(req, (err, data) => {
      if (err) return res.status(400).json({ status: 'error', message: err.message })
      else return res.json({ data })
    })
  },
  getMyLessons: (req, res) => {
    teacherServices.getMyLessons(req, (err, data) => {
      if (err) return res.status(400).json({ status: 'error', message: err.message })
      else return res.json({ data })
    })
  },
  deleteLesson: (req, res) => {
    teacherServices.deleteLesson(req, (err, data) => {
      if (err) return res.status(400).json({ status: 'error', message: err.message })
      else return res.json({ data })
    })
  }
}
module.exports = teacherController
