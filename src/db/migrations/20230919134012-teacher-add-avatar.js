'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Teachers', 'avatar', {
      type: Sequelize.STRING,
      allowNull: true
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Teachers', 'avatar')
  }
}
