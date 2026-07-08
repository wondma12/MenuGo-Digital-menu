'use strict';

/**
 * Sequelize migration: add restaurant fields (sub_city, slogan, business_license_number, tin_number, owner_name)
 * Run with your project's migration runner if you use Sequelize CLI or a custom script.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('restaurants', 'sub_city', {
      type: Sequelize.STRING(150),
      allowNull: true,
    });

    await queryInterface.addColumn('restaurants', 'slogan', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('restaurants', 'business_license_number', {
      type: Sequelize.STRING(128),
      allowNull: true,
    });

    await queryInterface.addColumn('restaurants', 'tin_number', {
      type: Sequelize.STRING(128),
      allowNull: true,
    });

    await queryInterface.addColumn('restaurants', 'owner_name', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('restaurants', 'business_license_url', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // optional index
    await queryInterface.addIndex('restaurants', ['owner_name'], { name: 'idx_restaurants_owner_name' });
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('restaurants', 'idx_restaurants_owner_name').catch(() => {});
    await queryInterface.removeColumn('restaurants', 'owner_name').catch(() => {});
    await queryInterface.removeColumn('restaurants', 'business_license_url').catch(() => {});
    await queryInterface.removeColumn('restaurants', 'tin_number').catch(() => {});
    await queryInterface.removeColumn('restaurants', 'business_license_number').catch(() => {});
    await queryInterface.removeColumn('restaurants', 'slogan').catch(() => {});
    await queryInterface.removeColumn('restaurants', 'sub_city').catch(() => {});
  },
};
