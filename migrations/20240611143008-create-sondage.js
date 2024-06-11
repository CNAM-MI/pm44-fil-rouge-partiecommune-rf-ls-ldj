'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Bonsoir', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      date_creation: {
        type: Sequelize.DATE
      },
      date_expiration: {
        type: Sequelize.DATE
      },
      day_votetime: {
        type: Sequelize.INTEGER
      },
      hour_votetime: {
        type: Sequelize.INTEGER
      },
      associated_picture: {
        type: Sequelize.BLOB
      },
      backgroundcolor: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
    }).then(() => {

    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Bonsoir');
  }
};