'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Sondage3s', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idSondage: {
        type: Sequelize.INTEGER
      },
      idUser: {
        type: Sequelize.INTEGER
      },
      dateCreation: {
        type: Sequelize.DATE
      },
      dateExpiration: {
        type: Sequelize.DATE
      },
      dayVoteTime: {
        type: Sequelize.INTEGER
      },
      hourVoteTime: {
        type: Sequelize.INTEGER
      },
      associatedPicture: {
        type: Sequelize.BLOB
      },
      backgroundColor: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Sondage3s');
  }
};