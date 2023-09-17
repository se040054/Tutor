const { User } = require('../db/models')
const adminService = {
  getUsers: (req, next) => {
    return User.findAll()
      .then(users => {
        return next(null, {
          status: 'success',
          users
        })
      })
  }
}

module.exports = adminService
