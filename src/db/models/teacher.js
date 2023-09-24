'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Teacher extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Teacher.belongsTo(models.User, { foreignKey: 'userId' })
      Teacher.hasMany(models.Lesson, { foreignKey: 'teacherId' })
    }
  }
  Teacher.init({
    courseIntroduce: DataTypes.STRING, // 修正
    courseUrl: DataTypes.STRING, // 修正
    teachStyle: DataTypes.STRING, // 修正
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Teacher',
    tableName: 'Teachers',
    underscored: true
  })
  return Teacher
}
