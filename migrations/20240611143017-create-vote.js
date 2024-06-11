'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Votes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      day: {
        type: Sequelize.INTEGER
      },
      hour: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      idUser: {
        type: Sequelize.INTEGER,
        references: {
          model: 'User', // nom du modèle référencé
          key: 'id' // nom de la colonne référencée
        },
      },
      idSondage: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Sondage', // nom du modèle référencé
          key: 'id' // nom de la colonne référencée
        },
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Votes');
  }
};