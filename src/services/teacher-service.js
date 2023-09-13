const { Lesson, Teacher } = require('../db/models')
const moment = require('moment')
require('moment-timezone').tz.setDefault('Asia/Taipei')

const teacherService = {
  addLesson: (req, next) => {
    const { duration, daytime } = req.body
    const teacherId = req.user.Teacher.id
    return Teacher.findByPk(teacherId, {
      include: [Lesson],
      nest: true
    })
      .then(teacher => {
        // console.log(`老師的課程 : ${JSON.stringify(teacher.Lessons)}`)
        // 開始時間:課程時間，結束時間:課程時間+時長，開始時間與結束時間丟進新創建的時間比對
        // 注意moment.add因為是對物件做，調用會變成淺拷貝 要用clone
        const createdLessonStart = moment(daytime)
        const createdLessonEnd = createdLessonStart.clone().add(duration, 'minutes')
        for (let i = 0; i < teacher.Lessons.length; i++) {
          const startTime = moment(teacher.Lessons[i].daytime)
          const endTime = startTime.clone().add(teacher.Lessons[i].duration, 'minutes')
          if (startTime.isSameOrBefore(createdLessonEnd) &&
            endTime.isSameOrAfter(createdLessonStart)) {
          //  console.log('有重複的錯誤偵測')
            throw new Error('課程時間重複')
          }
          // console.log(typeof duration, typeof teacher.Lessons[i].duration)
          // console.log(`比對結果 :新課時間${createdLessonStart}~${createdLessonEnd}`)
          // console.log(`比對結果 :舊課時間${startTime}~${endTime}`)
        }
        return Lesson.create({
          daytime,
          duration,
          teacherId
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
  }
}

module.exports = teacherService
