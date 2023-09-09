const { User } = require('../models')
const bcrypt = require('bcryptjs')
const userService = {
  register: (req, cb) => {
    const { email, password, confirmPassword } = req.body
    if (!email || !password) return cb(Error('密碼或信箱不能為空'))
    if (confirmPassword !== password) return cb(Error('密碼不一致'))
    return User.findOne({ where: { email } })
      .then(user => {
        if (user) return cb(Error('信箱被使用'))
        return bcrypt.hash(password, 10)
      })
      .then(hash => {
        return User.create({
          email,
          password: hash
        })
      })
      .then(user => {
        cb(null, { user: user.toJSON() })
      })
      .catch(err => cb(err))
  }
}

module.exports = userService
