const cron = require('node-cron');
const { logger } = require('../utils/logger');
const dailyReportJob = require('./dailyReportJob');
const analyticsJob = require('./analyticsJob');
const subscriptionJob = require('./subscriptionJob');
const cleanupJob = require('./cleanupJob');

// Schedule all cron jobs
const scheduleAllJobs = () => {
  logger.info('Scheduling cron jobs...');

  // Daily report job - Run at 10:00 PM every day
  cron.schedule('0 22 * * *', async () => {
    logger.info('Running daily report job...');
    try {
      await dailyReportJob.generateDailyReports();
      logger.info('Daily report job completed successfully');
    } catch (error) {
      logger.error('Daily report job failed:', error);
    }
  });

  // Analytics aggregation job - Run every hour at minute 5
  cron.schedule('5 * * * *', async () => {
    logger.info('Running analytics aggregation job...');
    try {
      await analyticsJob.aggregateHourlyAnalytics();
      logger.info('Analytics aggregation job completed successfully');
    } catch (error) {
      logger.error('Analytics aggregation job failed:', error);
    }
  });

  // Daily analytics summary - Run at 12:05 AM every day
  cron.schedule('5 0 * * *', async () => {
    logger.info('Running daily analytics summary job...');
    try {
      await analyticsJob.generateDailySummary();
      logger.info('Daily analytics summary job completed successfully');
    } catch (error) {
      logger.error('Daily analytics summary job failed:', error);
    }
  });

  // Subscription check job - Run every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('Running subscription check job...');
    try {
      await subscriptionJob.checkExpiringSubscriptions();
      await subscriptionJob.processExpiredSubscriptions();
      logger.info('Subscription check job completed successfully');
    } catch (error) {
      logger.error('Subscription check job failed:', error);
    }
  });

  // Cleanup job - Run at 3:00 AM every day
  cron.schedule('0 3 * * *', async () => {
    logger.info('Running cleanup job...');
    try {
      await cleanupJob.cleanupExpiredSessions();
      await cleanupJob.cleanupOldLogs();
      await cleanupJob.cleanupTempFiles();
      await cleanupJob.cleanupDeletedRecords();
      logger.info('Cleanup job completed successfully');
    } catch (error) {
      logger.error('Cleanup job failed:', error);
    }
  });

  // Weekly report job - Run every Monday at 8:00 AM
  cron.schedule('0 8 * * 1', async () => {
    logger.info('Running weekly report job...');
    try {
      await dailyReportJob.generateWeeklyReports();
      logger.info('Weekly report job completed successfully');
    } catch (error) {
      logger.error('Weekly report job failed:', error);
    }
  });

  // Monthly report job - Run on 1st of every month at 9:00 AM
  cron.schedule('0 9 1 * *', async () => {
    logger.info('Running monthly report job...');
    try {
      await dailyReportJob.generateMonthlyReports();
      logger.info('Monthly report job completed successfully');
    } catch (error) {
      logger.error('Monthly report job failed:', error);
    }
  });

  // Database backup job - Run at 1:00 AM every day (only in production)
  if (process.env.NODE_ENV === 'production') {
    cron.schedule('0 1 * * *', async () => {
      logger.info('Running database backup job...');
      try {
        await cleanupJob.backupDatabase();
        logger.info('Database backup job completed successfully');
      } catch (error) {
        logger.error('Database backup job failed:', error);
      }
    });
  }

  // Inventory low stock check - Run every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    logger.info('Running low stock check job...');
    try {
      const { checkLowStock } = require('./analyticsJob');
      await checkLowStock();
      logger.info('Low stock check job completed successfully');
    } catch (error) {
      logger.error('Low stock check job failed:', error);
    }
  });

  // Order status update for pending orders - Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    logger.info('Running pending orders check job...');
    try {
      await cleanupJob.checkStaleOrders();
      logger.info('Pending orders check job completed successfully');
    } catch (error) {
      logger.error('Pending orders check job failed:', error);
    }
  });

  logger.info('All cron jobs scheduled successfully');
};

// Stop all jobs (for graceful shutdown)
const stopAllJobs = () => {
  logger.info('Stopping all cron jobs...');
  const tasks = cron.getTasks();
  tasks.forEach(task => {
    task.stop();
  });
  logger.info('All cron jobs stopped');
};

module.exports = {
  scheduleAllJobs,
  stopAllJobs,
};