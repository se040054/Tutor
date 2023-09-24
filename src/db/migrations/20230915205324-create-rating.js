'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Ratings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      score: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      text: {
        type: Sequelize.STRING,
        allowNull: false
      },
      reserve_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Reserves',
          key: 'id',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        }
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Ratings')
  }
}
