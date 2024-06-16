'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sondage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Sondage.init({
    id_user: DataTypes.INTEGER,
    date_creation: DataTypes.DATE,
    date_expiration: DataTypes.DATE,
    day_vote_time: DataTypes.INTEGER,
    hour_vote_time: DataTypes.INTEGER,
    associated_picture: DataTypes.BLOB,
    background_color: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Sondage',
  });
  return Sondage;
};