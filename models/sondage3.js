'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sondage3 extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Sondage3.init({
    idSondage: DataTypes.INTEGER,
    idUser: DataTypes.INTEGER,
    dateCreation: DataTypes.DATE,
    dateExpiration: DataTypes.DATE,
    dayVoteTime: DataTypes.INTEGER,
    hourVoteTime: DataTypes.INTEGER,
    associatedPicture: DataTypes.BLOB,
    backgroundColor: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Sondage3',
  });
  return Sondage3;
};