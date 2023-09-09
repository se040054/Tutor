const { User } = require('../models')
const bcrypt = require('bcryptjs')
const userService = {
  register: (req, next) => {
    const { email, password, confirmPassword } = req.body
    if (!email || !password) throw new Error('信箱、密碼、確認密碼不能為空')
    if (confirmPassword !== password) throw new Error('密碼不一致')
    return User.findOne({ where: { email } })
      .then(user => {
        if (user) throw new Error('信箱已被使用')
        return bcrypt.hash(password, 10)
      })
      .then(hash => {
        return User.create({
          email,
          password: hash
        })
      })
      .then(user => {
        next(null, { user: user.toJSON() })
      })
      .catch(err => next(err))
  }
}

module.exports = userService
