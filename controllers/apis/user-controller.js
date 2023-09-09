const userService = require('../../services/user-service')
const userController = {
  register: (req, res) => {
    userService.register(req, (err, data) => {
      if (err) {
        return res.status(400).json({ success: 'fail', status: 'error', error: err.message })
      } else {
        return res.json({ data })
      }
    })
  }
}

module.exports = userController
