'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Lesson extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Lesson.belongsTo(models.Teacher, { foreignKey: 'teacherId' })
      Lesson.hasOne(models.Reserve, { foreignKey: 'lessonId' })
    }
  }
  Lesson.init({
    duration: DataTypes.INTEGER,
    daytime: DataTypes.DATE,
    isReserved: DataTypes.BOOLEAN, // 修正
    teacherId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Lesson',
    tableName: 'Lessons',
    underscored: true
  })
  return Lesson
}
