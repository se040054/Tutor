'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('Users', 'learning_hour', 'learning_minute')
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('Users', 'learning_minute', 'learning_hour')
  }
}
