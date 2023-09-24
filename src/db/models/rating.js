'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Rating extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Rating.belongsTo(models.Reserve, { foreignKey: 'reserveId' })
    }
  }
  Rating.init({
    score: DataTypes.FLOAT,
    text: DataTypes.STRING,
    reserveId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Rating',
    tableName: 'Ratings',
    underscored: true
  })
  return Rating
}
