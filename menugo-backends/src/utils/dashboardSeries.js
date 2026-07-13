const { Op } = require('sequelize');

const toLocalDateString = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildDateSeries = (rows = [], startDate, endDate) => {
  const byDate = new Map((rows || []).map((row) => [String(row.date), row]));
  const series = [];
  const cursor = new Date(startDate);
  const last = new Date(endDate);

  while (cursor <= last) {
    const key = toLocalDateString(cursor);
    const row = byDate.get(key) || {};
    series.push({
      date: key,
      revenue: Number(row.revenue ?? row.total_revenue ?? 0),
      orders: Number(row.orders ?? row.total_orders ?? 0),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return series;
};

const buildGrowthSeries = (rows = [], initialTotal = 0) => {
  let cumulative = Number(initialTotal) || 0;
  return (rows || []).map((row) => {
    cumulative += Number(row.new_restaurants ?? row.new ?? 0);
    return {
      month: row.month || row.label || row.period || '',
      new_restaurants: Number(row.new_restaurants ?? row.new ?? 0),
      total_restaurants: cumulative,
    };
  });
};

module.exports = {
  buildDateSeries,
  buildGrowthSeries,
  toLocalDateString,
};
