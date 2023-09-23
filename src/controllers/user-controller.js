const userService = require('../services/user-service')
const userController = {
  register: (req, res) => {
    userService.register(req, (err, data) => {
      if (err) return res.status(400).json({ status: 'error', message: err.message })
      else return res.json({ data })
    })
  },
  login: (req, res, next) => {
    userService.login(req, (err, data) => {
      if (err) return res.status(400).json({ status: 'error', message: err.message })
      else return res.json({ data })
    })
  },
  googleLogin: (req, res, next) => {
    userService.googleLogin(req, (err, data) => {
      if (err) return res.status(400).json({ status: 'error', message: err.message })
      else return res.json({ data })
    })
  },
  applyTeacher: (req, res) => {
    userService.applyTeacher(req, (err, data) => {
      if (err) return res.status(400).json({ status: 'error', message: err.message })
      else return res.json({ data })
    })
  },
  getTopLearningUsers: (req, res) => {
    userService.getTopLearningUsers(req, (err, data) => {
      if (err) return res.status(400).json({ status: 'error', message: err.message })
      else return res.json({ data })
    })
  },
  getUser: (req, res) => {
    userService.getUser(req, (err, data) => {
      if (err) return res.status(400).json({ status: 'error', message: err.message })
      else return res.json({ data })
    })
  },
  putUser: (req, res) => {
    userService.putUser(req, (err, data) => {
      if (err) return res.status(400).json({ status: 'error', message: err.message })
      else return res.json({ data })
    })
  },
  postReserve: (req, res) => {
    userService.postReserve(req, (err, data) => {
      if (err) return res.status(400).json({ status: 'error', message: err.message })
      else return res.json({ data })
    })
  },
  deleteReserve: (req, res) => {
    userService.deleteReserve(req, (err, data) => {
      if (err) return res.status(400).json({ status: 'error', message: err.message })
      else return res.json({ data })
    })
  },
  postRating: (req, res) => {
    userService.postRating(req, (err, data) => {
      if (err) return res.status(400).json({ status: 'error', message: err.message })
      else return res.json({ data })
    })
  },
  getMe: (req, res) => {
    userService.getMe(req, (err, data) => {
      if (err) return res.status(400).json({ status: 'error', message: err.message })
      else return res.json({ data })
    })
  }
}

module.exports = userController
