const { Lesson, Teacher } = require('../db/models')
const moment = require('moment')
require('moment-timezone').tz.setDefault('Asia/Taipei')

const teacherService = {
  addLesson: (req, next) => {
    const teacherId = req.user.Teacher.id
    const { duration, daytime } = req.body
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
      createdLessonEnd.hour() >= LATEST_DAYTIME_HOUR) throw new Error('上課時段不符合')
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
  showMe: (req, next) => {
    const teacherId = req.user.Teacher.id
    console.log(teacherId)
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
  getAllTeachers: async (req, next) => {
    let currentPage = req.query.page || 1
    // let search = req.query.search || null
    const teachersAmount = await Teacher.count()
    const TEACHERS_PER_PAGE = 6
    const totalPage = Math.ceil(teachersAmount / TEACHERS_PER_PAGE)
    if (currentPage > totalPage) currentPage = totalPage
    if (currentPage < 1) currentPage = 1
    const offset = (currentPage - 1) * TEACHERS_PER_PAGE
    return Teacher.findAll(
      { offset, limit: TEACHERS_PER_PAGE }
    )
      .then(onePageTeachers => {
        console.log(currentPage)
        return next(null, {
          status: 'success',
          teachers: onePageTeachers
        })
      })
      .catch(err => next(err))
  }
}

module.exports = teacherService
