'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasOne(models.Teacher, { foreignKey: 'userId' })
      User.hasMany(models.Reserve, { foreignKey: 'userId' })
      User.hasMany(models.Rating, { foreignKey: 'userId' })
    }
  }
  User.init({
    email: DataTypes.STRING,
    name: DataTypes.STRING,
    password: DataTypes.STRING,
    isTeacher: DataTypes.BOOLEAN,
    isAdmin: DataTypes.BOOLEAN,
    learningMinute: DataTypes.INTEGER,
    introduction: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    underscored: true
  })
  return User
}
