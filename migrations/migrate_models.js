'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Sondages', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_user: {
        type: Sequelize.INTEGER
      },
      date_creation: {
        type: Sequelize.DATE
      },
      date_expiration: {
        type: Sequelize.DATE
      },
      day_vote_time: {
        type: Sequelize.INTEGER
      },
      hour_vote_time: {
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      associated_picture: {
        type: Sequelize.BLOB
      },
      background_color: {
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

    await queryInterface.createTable('Votes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_user: {
        type: Sequelize.INTEGER
      },
      id_sondage: {
        type: Sequelize.INTEGER
      },
      day: {
        type: Sequelize.STRING
      },
      hour: {
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

    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      pseudo: {
        type: Sequelize.STRING
      },
      password_salt: {
        type: Sequelize.STRING
      },
      password_hash: {
        type: Sequelize.STRING
      },
      profile_picture: {
        type: Sequelize.BLOB
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

    await queryInterface.addConstraint('Sondages', {
      fields: ['id_user'],
      type: 'foreign key',
      name: 'foreign_key_id_user_sondage',
      references: { 
        table: 'Users',
        field: 'id',
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('Votes', {
      fields: ['id_sondage'],
      type: 'foreign key',
      name: 'foreign_key_id_sondage_vote',
      references: { 
        table: 'Sondages',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    await queryInterface.addConstraint('Votes', {
      fields: ['id_user'],
      type: 'foreign key',
      name: 'foreign_key_id_user_vote',
      references: { 
        table: 'Users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

  },
  /*async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Sondages');
  }*/
};