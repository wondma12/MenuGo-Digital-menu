#!/usr/bin/env node
require('dotenv').config();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const db = require('../src/models');
const { sequelize, User, RestaurantStaff, Waiter, UserSession } = db;

const BACKUP_DIR = path.resolve(__dirname, '..', 'backups');
if (!fs.existsSync(BACKUP_DIR)) {fs.mkdirSync(BACKUP_DIR, { recursive: true });}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const dumpFile = path.join(BACKUP_DIR, `menugo_db_backup_${timestamp}.sql`);

const runBackup = () => new Promise((resolve, reject) => {
  console.log('Creating MySQL dump to', dumpFile);
  const user = process.env.DB_USER;
  const pass = process.env.DB_PASSWORD;
  const name = process.env.DB_NAME;
  if (!user || !name) {return reject(new Error('DB_USER or DB_NAME not set in environment'));}
  // Note: on some platforms passing password on the command line may be insecure; this is a dev convenience.
  const cmd = `mysqldump -u ${user} -p"${pass || ''}" ${name} > "${dumpFile}"`;
  exec(cmd, { shell: true }, (err, stdout, stderr) => {
    if (err) {return reject(err);}
    resolve();
  });
});

const cleanup = async () => {
  try {
    await runBackup();
    console.log('Database backup complete');
  } catch (err) {
    console.error('Database backup failed:', err.message || err);
    console.error('Aborting cleanup. If you want to proceed without a backup set FORCE_CLEANUP=true');
    if (process.env.FORCE_CLEANUP === 'true') {
      console.warn('FORCE_CLEANUP=true detected; proceeding without successful backup');
    } else {
      process.exit(1);
    }
  }

  // Roles to remove
  const rolesToRemove = ['restaurant_admin', 'waiter', 'support_agent'];

  const t = await sequelize.transaction();
  try {
    // Find users to delete
    const usersToDelete = await User.findAll({ where: { role: rolesToRemove }, transaction: t });
    const ids = usersToDelete.map(u => u.id);

    if (ids.length === 0) {
      console.log('No users found for roles', rolesToRemove);
    } else {
      console.log(`Found ${ids.length} users to delete. Deleting related records.`);
      // Resolve waiter IDs for these user IDs (orders reference waiter.id, not user.id)
      const waiterRows = await Waiter.findAll({ where: { user_id: ids }, attributes: ['id'], transaction: t });
      const waiterIds = waiterRows.map(w => w.id);

      // Nullify waiter references in critical tables so we don't break FK constraints
      if (waiterIds.length > 0) {
        await sequelize.query(
          'UPDATE orders SET waiter_id = NULL WHERE waiter_id IN (:waiterIds)',
          { replacements: { waiterIds }, transaction: t }
        );
        await sequelize.query(
          'UPDATE order_verification_attempts SET waiter_id = NULL WHERE waiter_id IN (:waiterIds)',
          { replacements: { waiterIds }, transaction: t }
        );
        await sequelize.query(
          'UPDATE kitchen_orders SET waiter_id = NULL WHERE waiter_id IN (:waiterIds)',
          { replacements: { waiterIds }, transaction: t }
        );
        await sequelize.query(
          'UPDATE restaurant_tables SET current_waiter_id = NULL WHERE current_waiter_id IN (:waiterIds)',
          { replacements: { waiterIds }, transaction: t }
        );
        await sequelize.query(
          'UPDATE table_assignments SET waiter_id = NULL WHERE waiter_id IN (:waiterIds)',
          { replacements: { waiterIds }, transaction: t }
        );
      }
      await sequelize.query(
        'UPDATE order_verification_attempts SET waiter_id = NULL WHERE waiter_id IN (:ids)',
        { replacements: { ids }, transaction: t }
      );
      await sequelize.query(
        'UPDATE kitchen_orders SET waiter_id = NULL WHERE waiter_id IN (:ids)',
        { replacements: { ids }, transaction: t }
      );
      await sequelize.query(
        'UPDATE restaurant_tables SET current_waiter_id = NULL WHERE current_waiter_id IN (:ids)',
        { replacements: { ids }, transaction: t }
      );
      await sequelize.query(
        'UPDATE table_assignments SET waiter_id = NULL WHERE waiter_id IN (:ids)',
        { replacements: { ids }, transaction: t }
      );

      // Delete dependent waiter-specific records (these can be safely removed)
      const childDeletes = [
        'waiter_notifications',
        'waiter_activity_logs',
        'waiter_shifts',
        'waiter_performances',
        'waiter_realtime_statuses',
        'waiter_feedbacks',
        'waiter_tips',
        'waiter_commissions',
        'waiter_call_requests',
        'table_assignments'
      ];

      for (const tbl of childDeletes) {
        try {
          if (waiterIds.length > 0) {
            await sequelize.query(`DELETE FROM ${tbl} WHERE waiter_id IN (:waiterIds)`, { replacements: { waiterIds }, transaction: t });
          }
        } catch (e) {
          // Some tables use different column names or already cleared, ignore errors
        }
      }

      // Delete waiter profiles
      await Waiter.destroy({ where: { user_id: ids }, force: true, transaction: t });
      // Delete restaurant staff mappings
      await RestaurantStaff.destroy({ where: { user_id: ids }, force: true, transaction: t });
      // Delete user sessions
      await UserSession.destroy({ where: { user_id: ids }, force: true, transaction: t });
      // Finally, instead of hard-deleting users (which breaks FKs across many tables),
      // mark them as deactivated customers and anonymize email to avoid collisions.
      for (const u of usersToDelete) {
        try {
          const anonEmail = `deleted+${u.id}@deleted.local`;
          await u.update({
            role: 'customer',
            is_active: false,
            full_name: 'Deleted user',
            email: anonEmail,
          }, { transaction: t });
        } catch (e) {
          // ignore individual update errors
        }
      }
      console.log('Anonymized and deactivated users (avoid hard delete due to FK constraints)');
    }

    // Update platform admin
    // Read desired platform admin credentials from environment for safety.
    const newEmail = process.env.PLATFORM_ADMIN_EMAIL || 'haymanotwondmagegn23@gmail.com';
    const newPassword = process.env.PLATFORM_ADMIN_PASSWORD || 'Admin@123';

    // Try to find the canonical platform admin by existing admin email
    let platformAdmin = await User.findOne({ where: { email: 'admin@menugo.com', role: 'platform_admin' }, transaction: t });
    if (!platformAdmin) {
      platformAdmin = await User.findOne({ where: { role: 'platform_admin' }, transaction: t });
    }

    if (!platformAdmin) {
      console.warn('No platform_admin user found to update. Creating a new platform_admin account.');
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPassword, salt);
      const newUser = await User.create({
        email: newEmail,
        password_hash,
        full_name: 'Platform Admin',
        role: 'platform_admin',
        is_active: true,
        is_verified: true,
        email_verified: true,
      }, { transaction: t });
      console.log('Created new platform admin:', newUser.email);
    } else {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPassword, salt);
      await platformAdmin.update({
        email: newEmail,
        password_hash,
        is_active: true,
        is_verified: true,
        email_verified: true,
      }, { transaction: t });
      console.log('Updated platform admin to', newEmail);
    }

    await t.commit();
    console.log('Cleanup completed successfully');
    process.exit(0);
  } catch (err) {
    await t.rollback();
    console.error('Cleanup failed:', err);
    process.exit(1);
  }
};

cleanup();
