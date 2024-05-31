'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Utilisateur extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Utilisateur.init({
    pseudo: DataTypes.STRING,
    mot_de_passe: DataTypes.STRING,
    photo_profil: DataTypes.BLOB
  }, {
    sequelize,
    modelName: 'Utilisateur',
  });
  return Utilisateur;
};