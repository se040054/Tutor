'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Reserve extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Reserve.belongsTo(models.User, { foreignKey: 'userId' })
      Reserve.belongsTo(models.Lesson, { foreignKey: 'lessonId' })
    }
  }
  Reserve.init({
    lessonId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Reserve',
    tableName: 'Reserves',
    underscored: true
  })
  return Reserve
}
