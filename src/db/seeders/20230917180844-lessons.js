'use strict'
// 邏輯為每個教師擁有6堂課程 分別是
// 兩堂 兩天前 已預約 已評分 0 1
// 兩堂 昨天 已預約 未評分 2 3
// 兩堂 明天的課 未預約 未評分 4 5
const moment = require('moment')
const { faker } = require('@faker-js/faker')
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const Before2Days = moment().subtract(2, 'days').toDate()
    const Before3Days = moment().subtract(3, 'days').toDate()
    const Before4Days = moment().subtract(4, 'days').toDate()
    const Before5Days = moment().subtract(5, 'days').toDate()
    const After10Days = moment().add(10, 'days').toDate()
    const After11Days = moment().add(11, 'days').toDate()
    const days = [Before2Days, Before3Days, Before4Days, Before5Days, After10Days, After11Days]
    let transaction
    try {
      transaction = await queryInterface.sequelize.transaction();
      const lessonArray = Array.from({ length: 60 }, (_, i) => ({
        duration: Math.ceil(Math.random() * 2) * 30,
        daytime: days[i % days.length],
        is_reserved: i % 6 < 4,
        teacher_id: Math.floor((i) / 6) + 1,
        created_at: new Date(),
        updated_at: new Date()
      }))
      const lessonIdNum = Array.from({ length: 60 }, (_, i) => i + 1).filter(i => i % 6 !== 0 && i % 6 !== 5)
      const reserveArray = Array.from({ length: 40 }, (_, i) => ({
        lesson_id: lessonIdNum[i],
        user_id: Math.floor(i / 8) + 2,
        created_at: new Date(),
        updated_at: new Date()
      }))
      const reserveIdNum = Array.from({ length: 40 }, (_, i) => i + 1)
        .filter(i => i % 6 !== 3 && i % 6 !== 4)
      const ratingArray = Array.from({ length: 20 }, (_, i) => ({
        score: Math.ceil(Math.random() * 40) / 10 + 1,
        text: faker.lorem.sentence(),
        reserve_id: reserveIdNum[i],
        user_id: Math.floor(i / 4) + 2,
        created_at: new Date(),
        updated_at: new Date()
      }))
      await queryInterface.sequelize.query('ALTER TABLE Lessons AUTO_INCREMENT = 1;', { transaction })
      await queryInterface.sequelize.query('ALTER TABLE Reserves AUTO_INCREMENT = 1;', { transaction })
      await queryInterface.sequelize.query('ALTER TABLE Ratings AUTO_INCREMENT = 1;', { transaction })
      await queryInterface.bulkInsert('Lessons', lessonArray, { transaction })
      await queryInterface.bulkInsert('Reserves', reserveArray, { transaction })
      await queryInterface.bulkInsert('Ratings', ratingArray, { transaction })
      await transaction.commit()
    } catch (err) {
      if (transaction) {
        console.log(err)
        await transaction.rollback()
      }
    }
  },

  async down(queryInterface, Sequelize) {
    let transaction
    try {
      transaction = await queryInterface.sequelize.transaction()
      await queryInterface.bulkDelete('Ratings', null, { transaction })
      await queryInterface.bulkDelete('Reserves', null, { transaction })
      await queryInterface.bulkDelete('Lessons', null, { transaction })
      await transaction.commit()
    } catch (err) {
      if (transaction) {
        console.log(err)
        await transaction.rollback()
      }
    }
  }
}
