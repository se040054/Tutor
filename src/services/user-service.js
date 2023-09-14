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
        return next(null, {
          status: 'success',
          user
        })
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
          userId: updatedUser.id
        }).then(createdTeacher => {
          const user = updatedUser.toJSON()
          delete user.password
          return next(null, {
            status: 'success',
            user,
            teacher: createdTeacher
          })
        })
      }).catch(err => {
        return next(err)
      })
  },
  getTopLearningUsers: (req, next) => {
    const TOP_USERS_AMOUNT = 10
    return User.findAll(
      {
        attributes: { exclude: ['password'] },
        // where: { isTeacher: false }, // 如果你需要剔除老師
        limit: TOP_USERS_AMOUNT,
        order: [['learningHour', 'DESC']]
      })
      .then(topUsers => {
        return next(null, {
          status: 'success',
          users: topUsers
        })
      })
      .catch(err => next(err))
  },
  getUser: (req, next) => {
    return User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    })
      .then(user => {
        if (!user) throw new Error('查無用戶')
        if (user.id !== req.user.id) throw new Error('僅能查看自己的頁面')
        return next(null, {
          status: 'success',
          user
        })
      }).catch(err => next(err))
  }
}

module.exports = userService
