const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  restaurant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'restaurants',
      key: 'id',
    },
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'orders',
      key: 'id',
    },
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  customer_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  customer_email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  is_verified_purchase: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'reported'),
    defaultValue: 'pending',
  },
  reply_from_restaurant: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  reply_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'reviews',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Cache of actual DB columns for the reviews table to avoid selecting
// attributes that don't exist in some deployments (prevents MySQL errors).
let _reviewTableCols = null;
const ensureReviewTableCols = async () => {
  if (_reviewTableCols) return _reviewTableCols;
  try {
    const qi = sequelize.getQueryInterface();
    const desc = await qi.describeTable('reviews');
    _reviewTableCols = desc || {};
  } catch (e) {
    _reviewTableCols = {};
  }
  return _reviewTableCols;
};

// Helper to sanitize attributes arrays/objects passed to Sequelize queries.
const sanitizeAttributes = (attrs, cols) => {
  if (!attrs) return attrs;
  // attributes can be an array of names or an object { include: [], exclude: [] }
  if (Array.isArray(attrs)) {
    return attrs.filter(a => {
      // allow raw/aliased selections (arrays / functions)
      if (typeof a !== 'string') return true;
      return !!cols[a];
    });
  }
  if (typeof attrs === 'object') {
    const out = Object.assign({}, attrs);
    if (Array.isArray(out.include)) {
      out.include = out.include.filter(i => typeof i !== 'string' || !!cols[i]);
    }
    // exclude can remain as-is; excluding non-existent columns is harmless.
    return out;
  }
  return attrs;
};

// Add hooks to avoid Sequelize explicitly requesting columns that aren't
// present in the live `reviews` table. This prevents SQL errors like
// "Unknown column 'customer_name' in 'field list'" when the DB schema
// lags behind the model definition.
['beforeFind', 'beforeCount', 'beforeFindAfterExpandIncludeAll'].forEach(hook => {
  Review.addHook(hook, async (options) => {
    try {
      const cols = await ensureReviewTableCols();
      if (!cols || Object.keys(cols).length === 0) return;
      if (options && options.attributes) {
        options.attributes = sanitizeAttributes(options.attributes, cols);
      }
    } catch (e) {
      // best-effort only; do not break queries on hook failures
    }
  });
});

module.exports = Review;