const userService = require('../services/user-service')
const jwt = require('jsonwebtoken')

const userController = {
  register: (req, res) => {
    userService.register(req, (err, data) => {
      if (err) return res.status(400).json({ status: 'error', message: err.message })
      else return res.json({ data })
    })
  },
  login: (req, res, next) => {
    try {
      const userData = req.user.toJSON()
      delete userData.password // 密碼不能洩漏
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' }) // 這行就是passport解開的資料
      return res.json({
        status: 'success',
        data: {
          token,
          user: userData
        }
      })
    } catch (err) {
      return next(err)
    }
  },
  applyTeacher: (req, res) => {
    userService.applyTeacher(req, (err, data) => {
      if (err) return res.status(400).json({ status: 'error', message: err.message })
      else return res.json({ data })
    })
  }
}

module.exports = userController
