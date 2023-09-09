const userService = require('../../services/user-service')
const userController = {
  register: (req, res, next) => {
    userService.register(req, (err, data) => err ? next(err) : res.json({ data }))
  }
}

module.exports = userController
