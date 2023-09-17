const adminService = require('../services/admin-service')
const adminController = {
  getUsers: (req, res) => {
    adminService.getUsers(req, (err, data) => {
      if (err) return res.status(400).json({ status: 'error', message: err.message })
      else return res.json({ data })
    })
  }
}

module.exports = adminController
