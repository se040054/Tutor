const { Op } = require('sequelize')
const { Lesson, Teacher, User, Reserve, Rating } = require('../db/models')
const moment = require('moment')
require('moment-timezone').tz.setDefault('Asia/Taipei')

const { localFileHandler } = require('../helpers/file-helper')

const teacherService = {
  addLesson: (req, next) => {
    const teacherId = req.user.Teacher.id
    const { duration, daytime } = req.body
    if (!duration || !daytime) throw new Error('時長和時段未填寫')
    const MAXIMUM_DURATION_MINUTE = 480
    const MINIMUM_DURATION_MINUTE = 30
    const EARLIEST_DAYTIME_HOUR = 18
    const LATEST_DAYTIME_HOUR = 22
    const now = moment()
    const createdLessonStart = moment(daytime)
    const createdLessonEnd = createdLessonStart.clone().add(duration, 'minutes')
    if (duration < MINIMUM_DURATION_MINUTE ||
      duration > MAXIMUM_DURATION_MINUTE) throw new Error('課程時長不符合')
    if (createdLessonStart.hour() < EARLIEST_DAYTIME_HOUR ||
      createdLessonEnd.hour() >= LATEST_DAYTIME_HOUR) throw new Error('上課時段僅能於18~22時')
    if (createdLessonStart.isBefore(now)) throw new Error('創建的課程時間已過')
    return Teacher.findByPk(teacherId, {
      include: [Lesson],
      nest: true
    })
      .then(teacher => {
        // console.log(`老師的課程 : ${JSON.stringify(teacher.Lessons)}`)
        // 開始時間:課程時間，結束時間:課程時間+時長，開始時間與結束時間丟進新創建的時間比對
        // 注意moment.add因為是對物件做，調用會變成淺拷貝 要用clone
        for (let i = 0; i < teacher.Lessons.length; i++) {
          const startTime = moment(teacher.Lessons[i].daytime)
          const endTime = startTime.clone().add(teacher.Lessons[i].duration, 'minutes')
          if (startTime.isSameOrBefore(createdLessonEnd) &&
            endTime.isSameOrAfter(createdLessonStart)) {
            //  console.log('有重複的錯誤偵測')
            throw new Error('課程時間重複')
          }
          // console.log(`比對結果 :新課時間${createdLessonStart}~${createdLessonEnd}`)
          // console.log(`比對結果 :舊課時間${startTime}~${endTime}`)
        }
        return Lesson.create({
          daytime,
          duration,
          teacherId,
          isReserved: false
        })
      }).then(createdLesson => {
        return next(null, {
          status: 'success',
          lesson: createdLesson
        })
      })
      .catch(err => next(err))
  },
  getMe: (req, next) => {
    const teacherId = req.user.Teacher.id
    console.log(teacherId)
    if (!teacherId) return next(new Error('您並非教師'))
    return Teacher.findByPk(teacherId, {
      include: [Lesson],
      nest: true
    })
      .then(teacher => {
        return next(null, {
          status: 'success',
          teacher
        })
      })
      .catch(err => next(err))
  },
  getTeachers: async (req, next) => {
    let currentPage = Number(req.query.page) || 1
    const search = req.query.search || null
    const teachersAmount = await Teacher.count({
      where: search
        ? {
            [Op.or]: [
              {
                '$User.name$': {
                  [Op.substring]: `${search}`
                }
              },
              {
                courseIntroduce: {
                  [Op.substring]: `${search}`
                }
              }
            ]
          }
        : null,
      include: [{
        model: User
      }]
    })
    const TEACHERS_PER_PAGE = Number(req.query.amount) || 6
    const totalPage = Math.ceil(teachersAmount / TEACHERS_PER_PAGE)
    if (currentPage > totalPage) currentPage = totalPage
    if (currentPage < 1) currentPage = 1
    const offset = (currentPage - 1) * TEACHERS_PER_PAGE
    return Teacher.findAll({
      where: search
        ? {
            [Op.or]: [
              {
                '$User.name$': {
                  [Op.substring]: `${search}`
                }
              },
              {
                courseIntroduce: {
                  [Op.substring]: `${search}`
                }
              }
            ]
          }
        : null,
      include: [{
        model: User,
        attributes: { exclude: ['password'] }
      }],
      offset,
      limit: TEACHERS_PER_PAGE
    })
      .then(onePageTeachers => {
        // console.log(onePageTeachers)
        // if (onePageTeachers.length < 1) throw new Error('查無搜尋結果')
        return next(null, {
          status: 'success',
          teachers: onePageTeachers,
          totalAmount: teachersAmount
        })
      })
      .catch(err => next(err))
  },
  getTeacher: (req, next) => {
    const id = req.params.id
    const now = moment()
    const RESERVE_DEADLINE = 14
    const deadline = now.clone().add(RESERVE_DEADLINE, 'days')
    return Teacher.findByPk(id, {
      include: [{
        model: User,
        attributes: { exclude: ['password'] }
      },
      {
        model: Lesson,
        where: {
          daytime: { [Op.between]: [now, deadline] } // 只返回14日內課程
        },
        separate: true // 記得設置分隔 不然0課程的情況下老師也會返回0
      }]
    })
      .then(async teacher => {
        if (!teacher) throw new Error('找不到此教師')
        const highestRatingLessons = await Lesson.findAll({
          where: { teacherId: teacher.id },
          include: [{
            model: Reserve,
            required: true,
            include: [{
              model: Rating,
              required: true
            }]
          }],
          order: [
            ['Reserve', 'Rating', 'score', 'DESC']
          ],
          limit: 2
        })
        const lowestRatingLessons = await Lesson.findAll({
          where: { teacherId: teacher.id },
          include: [{
            model: Reserve,
            required: true,
            include: [{
              model: Rating,
              required: true
            }]
          }],
          order: [
            ['Reserve', 'Rating', 'score', 'ASC']
          ],
          limit: 2
        })
        return next(null, {
          status: 'success',
          teacher, // 這邊附帶的是14天內未預約課程的teacher
          highestRatingLessons,
          lowestRatingLessons
        })
      })
      .catch(err => next(err))
  },
  putTeacher: async (req, next) => {
    const { courseIntroduce, courseUrl, teachStyle } = req.body
    const { file } = req
    const avatar = await localFileHandler(file)

    return Teacher.findByPk(req.params.id)
      .then(teacher => {
        if (!teacher) throw new Error('找不到此教師')
        if (teacher.id !== req.user.Teacher.id) throw new Error('僅能修改自己的教師資料')
        return teacher.update({
          courseIntroduce: courseIntroduce || teacher.courseIntroduce,
          courseUrl: courseUrl || teacher.courseUrl,
          teachStyle: teachStyle || teacher.teachStyle,
          avatar: avatar || teacher.avatar
        })
      })
      .then(updatedTeacher => {
        return next(null, {
          status: 'success',
          teacher: updatedTeacher
        })
      })
      .catch(err => next(err))
  },
  getMyLessons: (req, next) => {
    // 中間件已驗證教師身分
    return Lesson.findAll({ where: { teacherId: req.user.Teacher.id } })
      .then(lessons => {
        if (lessons.length < 1) throw new Error('尚未創建任何課程')
        return next(null, {
          status: 'success',
          lessons
        })
      })
      .catch(err => next(err))
  },
  deleteLesson: (req, next) => {
    return Lesson.findByPk(req.params.id)
      .then(async lesson => {
        if (!lesson) throw new Error('查無此課程')
        if (lesson.isReserved) throw new Error('不可刪除已預約/已完成的課程')
        if (lesson.teacherId !== req.user.Teacher.id) throw new Error('禁止刪除他人課程')
        return lesson.destroy()
      })
      .then(deletedLesson => {
        return next(null, {
          status: 'success',
          lesson: deletedLesson
        })
      })
      .catch(err => next(err))
  }
}

module.exports = teacherService
