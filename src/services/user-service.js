const { User, Teacher, Lesson, Reserve, Rating } = require('../db/models')
const bcrypt = require('bcryptjs')
const moment = require('moment')
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
        if (!user) throw new Error('查無用戶')
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
      attributes: { exclude: ['password'] }
    })
      .then(user => {
        if (!user) throw new Error('查無用戶')
        if (user.id !== req.user.id) throw new Error('僅能查看自己的資訊')
        return next(null, {
          status: 'success',
          user
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
  postReserve: (req, next) => {
    return Lesson.findByPk(req.params.lessonId, {
      include: [{
        model: Teacher,
        include: [User]
      }]
    })
      .then(async lesson => {
        const now = moment()
        const RESERVE_DEADLINE = 14
        const deadline = now.clone().add(RESERVE_DEADLINE, 'days')
        if (!lesson) throw new Error('找不到此課程')
        if (lesson.isReserved) throw new Error('課程已經被預約了')
        if (lesson.Teacher.User.id === req.user.id) throw new Error('不能預約自己的課程')
        if (moment(lesson.daytime).isSameOrBefore(now)) throw new Error('不能預約已過期的課程')
        if (!moment(lesson.daytime).isBetween(now, deadline)) throw new Error('僅能預約14日內的課程')
        const createdReserve = await Reserve.create({
          userId: req.user.id,
          lessonId: req.params.lessonId
        })
        const updatedLesson = await lesson.update({ isReserved: true })
        return next(null, {
          status: 'success',
          reserve: createdReserve,
          lesson: updatedLesson
        })
      }).catch(err => next(err))
  },
  deleteReserve: (req, next) => {
    // 這邊要用all 才可以查找預約和課程 (如果用聯表查詢無法得知是預約還是課程不存在)
    return Promise.all([
      Reserve.findOne({
        where: {
          userId: req.user.id,
          lessonId: req.params.lessonId
        }
      }),
      Lesson.findByPk(req.params.lessonId)
    ])
      .then(async ([reserve, lesson]) => {
        if (!lesson) throw new Error('找不到課程')
        if (!reserve) throw new Error('此課程未預約或不是您的預約')
        if (moment(lesson.daytime).isSameOrBefore(moment())) throw new Error('不可取消已完成的課程')
        const deletedReserve = await reserve.destroy()
        const updatedLesson = await lesson.update({ isReserved: false })
        return next(null, {
          status: 'success',
          reserve: deletedReserve,
          lesson: updatedLesson
        })
      })
      .catch(err => next(err))
  },
  postRating: (req, next) => {
    const text = req.body.text
    let score = Number(req.body.score)
    if (!score || !text) throw new Error('評分和留言不可為空')
    if (score > 5 || score < 1) throw new Error('評分只能介於1~5')
    score = score.toFixed(1)
    return Promise.all([
      Reserve.findByPk(req.params.reserveId, {
        include: [Lesson]
      }),
      Rating.findOne({
        where: {
          reserveId: req.params.reserveId,
          userId: req.user.id
        }
      })
    ])
      .then(([reserve, rating]) => {
        if (!reserve) throw new Error('查無上課紀錄')
        if (rating) throw new Error('已經評價過了')
        if (reserve.userId !== req.user.id) throw new Error('只能評價自己上的課程')
        const lessonEndTime = moment(reserve.Lesson.daytime).clone().add(reserve.Lesson.duration, 'minutes')
        if (moment(lessonEndTime).isSameOrAfter(moment())) throw new Error('只能評價上完的課程')
        return Rating.create({
          score,
          text,
          reserveId: req.params.reserveId,
          userId: req.user.id
        })
          .then(async createdRating => {
            const user = await User.findByPk(req.user.id)
            // 注意increment不返回實例
            await user.increment('learningMinute', { by: reserve.Lesson.duration })
            await user.reload()
            return next(null, {
              status: 'success',
              createdRating,
              user
            })
          })
      })
      .catch(err => next(err))
  }
}

module.exports = userService
