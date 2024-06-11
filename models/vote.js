'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Vote extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Vote.init({
    day: DataTypes.INTEGER,
    hour: DataTypes.INTEGER,
    idUser: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User', // nom du modèle référencé
        key: 'id' // nom de la colonne référencée
      }
    },
    idSondage: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Sondage', // nom du modèle référencé
        key: 'id' // nom de la colonne référencée
      }
    },
  }, {
    sequelize,
    modelName: 'Vote',
  });
  return Vote;
};