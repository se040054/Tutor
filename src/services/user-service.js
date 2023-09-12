const { User, Teacher } = require('../db/models')
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
  },
  applyTeacher: (req, next) => {
    const { courseIntroduce, courseUrl, teachStyle } = req.body
    if (!courseIntroduce || !courseUrl || !teachStyle) throw new Error('有資料未填寫')
    return User.findByPk(req.user.id)
      .then(user => {
        if (user.isTeacher) throw new Error('用戶已經是老師身分')
        return user.update({ isTeacher: true })
      }).then(updatedUser => {
        return Teacher.create({
          courseIntroduce,
          courseUrl,
          teachStyle,
          userId: String(updatedUser.id)
        }).then(createdTeacher => {
          return next(null, {
            status: 'success',
            user: updatedUser,
            teacher: createdTeacher
          })
        })
      }).catch(err => {
        console.log(err)
        return next(err)
      })
  }
}

module.exports = userService
