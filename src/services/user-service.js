const { User, Teacher, Lesson, Reserve, Rating, sequelize, Sequelize } = require('../db/models')
const bcrypt = require('bcryptjs')
const moment = require('moment')
const jwt = require('jsonwebtoken')

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
  login: (req, next) => {
    try {
      const userData = req.user.toJSON()
      delete userData.password // 密碼不能洩漏
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' }) // 這行就是passport解開的資料
      return next(null, {
        status: 'success',
        data: {
          token,
          user: userData
        }
      })
    } catch (err) {
      console.log(err)
      return next(err)
    }
  },
  googleLogin: (req, next) => {
    const { email, name } = req.body
    if (!email || !name) return next(new Error('發生錯誤，請使用google登入'))
    let googleUser
    return User.findOne({ where: { email } })
      .then(async user => {
        if (!user) {
          googleUser = await User.create({
            email,
            name,
            password: bcrypt.hashSync(Math.random().toString(36).slice(2), 10)
          })
          await googleUser.reload() // 記得reload不然只會有你輸入的資料
        }
        const userData = (user || googleUser).toJSON()
        delete userData.password
        const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' })
        return next(null, {
          status: 'success',
          data: {
            token,
            user: userData
          }
        })
      }).catch(err => next(err))
  },
  applyTeacher: async (req, next) => {
    const { courseIntroduce, courseUrl, teachStyle } = req.body
    if (!courseIntroduce || !courseUrl || !teachStyle) return next(new Error('有資料未填寫'))
    let user = await User.findByPk(req.user.id).catch(err => next(err))
    if (!user) return next(new Error('查無用戶'))
    if (user.isTeacher) return next(new Error('用戶已經是老師身分'))
    const transaction = await sequelize.transaction()
    try {
      const updatedUser = await user.update({ isTeacher: true }, { transaction })
      const createdTeacher = await Teacher.create({
        courseIntroduce,
        courseUrl,
        teachStyle,
        userId: updatedUser.id
      }, { transaction })
      await transaction.commit()
      user = updatedUser.toJSON()
      delete user.password
      return next(null, {
        status: 'success',
        user,
        teacher: createdTeacher
      })
    } catch (err) {
      console.log(err)
      await transaction.rollback()
      return next(err)
    }
  },
  getTopLearningUsers: (req, next) => {
    const TOP_USERS_AMOUNT = 10
    return User.findAll(
      {
        attributes: { exclude: ['password'] },
        // where: { isTeacher: false }, // 如果你需要剔除老師
        limit: TOP_USERS_AMOUNT,
        order: [['learningMinute', 'DESC']]
      })
      .then(topUsers => {
        if (!topUsers) throw new Error('查無用戶')
        return next(null, {
          status: 'success',
          users: topUsers
        })
      })
      .catch(err => next(err))
  },
  getUser: (req, next) => {
    return User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Reserve,
        include: [{
          model: Lesson,
          include: [{
            model: Teacher,
            include: [{
              model: User,
              attributes: { exclude: ['password'] }
            }]
          }]
        }]
      }]
    })
      .then(async user => {
        if (!user) throw new Error('查無用戶')
        if (user.id !== req.user.id) throw new Error('僅能查看自己的資訊')
        const { QueryTypes } = require('sequelize')
        const rankingQuery = 'select u.id, Rank() over(order by u.learning_minute DESC) ranking from users u'
        const usersWithRank = await sequelize.query(rankingQuery, { type: QueryTypes.SELECT }) // 不返回metadata
        const userRanking = usersWithRank.find(userRank => userRank.id === user.id)
        return next(null, {
          status: 'success',
          user,
          userRanking
        })
      }).catch(err => next(err))
  },
  putUser: (req, next) => {
    const { name, introduction } = req.body
    if (!name || !introduction) return next(null, { status: 'none', message: '沒有修改資料' })
    return User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    })
      .then(user => {
        if (!user) throw new Error('查無用戶')
        if (user.id !== req.user.id) throw new Error('僅能修改自己的資訊')
        return user.update({
          name,
          introduction
        })
      }).then(updatedUser => {
        return next(null, {
          status: 'success',
          user: updatedUser
        })
      })
      .catch(err => next(err))
  },
  postReserve: async (req, next) => {
    const lesson = await Lesson.findByPk(req.params.lessonId, {
      include: [{
        model: Teacher,
        include: [User]
      }]
    }).catch(err => next(err))
    const now = moment()
    const RESERVE_DEADLINE = 14
    const deadline = now.clone().add(RESERVE_DEADLINE, 'days')
    if (!lesson) return next(new Error('找不到此課程'))
    if (lesson.isReserved) return next(new Error('課程已經被預約了'))
    if (lesson.Teacher.User.id === req.user.id) return next(new Error('不能預約自己的課程'))
    if (moment(lesson.daytime).isSameOrBefore(now)) return next(new Error('不能預約已過期的課程'))
    if (!moment(lesson.daytime).isBetween(now, deadline)) return next(new Error('僅能預約14日內的課程'))
    const transaction = await sequelize.transaction()
    try {
      const createdReserve = await Reserve.create({
        userId: req.user.id,
        lessonId: req.params.lessonId
      }, { transaction })
      const updatedLesson = await lesson.update({ isReserved: true }, { transaction })
      await transaction.commit()
      return next(null, {
        status: 'success',
        reserve: createdReserve,
        lesson: updatedLesson
      })
    } catch (err) {
      console.log(err)
      await transaction.rollback()
      return next(err)
    }
  },
  deleteReserve: async (req, next) => {
    const reserve = await Reserve.findOne({
      where: {
        userId: req.user.id, lessonId: req.params.lessonId
      }
    }).catch(err => next(err))
    const lesson = await Lesson.findByPk(req.params.lessonId).catch(err => next(err))
    if (!lesson) return next(new Error('找不到課程'))
    if (!reserve) return next(new Error('此課程未預約或不是您的預約'))
    if (moment(lesson.daytime).isSameOrBefore(moment())) return next(new Error('不可取消已完成的課程'))
    const transaction = await sequelize.transaction()
    try {
      const deletedReserve = await reserve.destroy({ transaction })
      const updatedLesson = await lesson.update({ isReserved: false }, { transaction })
      await transaction.commit()
      return next(null, {
        status: 'success',
        reserve: deletedReserve,
        lesson: updatedLesson
      })
    } catch (err) {
      console.log(err)
      await transaction.rollback()
      return next(err)
    }
  },
  postRating: async (req, next) => {
    const text = req.body.text
    let score = Number(req.body.score)
    if (!score || !text) return next(new Error('評分和留言不可為空'))
    if (score > 5 || score < 1) return next(new Error('評分只能介於1~5'))
    score = score.toFixed(1)
    const reserve = await Reserve.findByPk(req.params.reserveId, {
      include: [Lesson]
    }).catch(err => next(err))
    const rating = await Rating.findOne({
      where: {
        reserveId: req.params.reserveId,
        userId: req.user.id
      }
    }).catch(err => next(err))
    if (!reserve) return next(new Error('查無上課紀錄'))
    if (rating) return next(new Error('已經評價過了'))
    if (reserve.userId !== req.user.id) return next(new Error('只能評價自己上的課程'))
    const lessonEndTime = moment(reserve.Lesson.daytime).clone().add(reserve.Lesson.duration, 'minutes')
    if (moment(lessonEndTime).isSameOrAfter(moment())) return next(new Error('只能評價上完的課程'))
    const transaction = await sequelize.transaction()
    try {
      const createdRating = await Rating.create({
        score,
        text,
        reserveId: req.params.reserveId,
        userId: req.user.id
      }, { transaction })
      const user = await User.findByPk(req.user.id)
      // 注意increment不返回實例 ，並且注意這裡的交易位置
      await user.increment('learningMinute', { by: reserve.Lesson.duration, transaction })
      await user.reload()
      await transaction.commit()
      return next(null, {
        status: 'success',
        createdRating,
        user
      })
    } catch (err) {
      console.log(err)
      await transaction.rollback()
      return next(err)
    }
  }
}

module.exports = userService
