const { Lesson } = require('../db/models')
const teacherService = {
  addLesson: (req, next) => {
    const { duration, daytime } = req.body
    const { teacherId } = req.user
    return Lesson.create({
      duration,
      daytime,
      isReserved: false,
      teacherId
    })
      .then(createdLesson => {
        return next(null, {
          status: 'success',
          lesson: createdLesson
        })
      })
      .catch(err => next(err))
  }
}

module.exports = teacherService
