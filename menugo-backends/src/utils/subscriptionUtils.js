const SUBSCRIPTION_TIER_DURATION_DAYS = {
  monthly: 30,
  six_month: 180,
  yearly: 365,
};

const SUBSCRIPTION_TIER_PATTERNS = [
  { tier: 'six_month', regex: /\b(?:6[-\s]?month|six[-\s]?month|six month)\b/i },
  { tier: 'yearly', regex: /\b(?:yearly|year)\b/i },
  { tier: 'monthly', regex: /\bmonthly\b/i },
];

const normalizeText = (value) => {
  if (!value) return '';
  return value.toString().toLowerCase().trim();
};

const parseSubscriptionTierFromText = (text) => {
  const normalized = normalizeText(text);
  if (!normalized) return null;

  for (const candidate of SUBSCRIPTION_TIER_PATTERNS) {
    if (candidate.regex.test(normalized)) {
      return candidate.tier;
    }
  }

  return null;
};

const getSubscriptionDurationDays = (tier) => {
  return SUBSCRIPTION_TIER_DURATION_DAYS[tier] || null;
};

const computeSubscriptionEndDate = (baseDate, tier) => {
  const duration = getSubscriptionDurationDays(tier);
  if (!baseDate || !duration) return null;
  return new Date(baseDate.getTime() + duration * 24 * 60 * 60 * 1000);
};

const applyUpgradeRequestToRestaurant = async (ticket, RestaurantModel) => {
  if (!ticket || ticket.category !== 'billing' || !ticket.restaurant_id) return null;

  const textSearch = `${ticket.subject || ''} ${ticket.description || ''}`;
  const requestedTier = parseSubscriptionTierFromText(textSearch);
  if (!requestedTier) return null;

  const restaurant = await RestaurantModel.findByPk(ticket.restaurant_id);
  if (!restaurant) return null;

  const now = new Date();
  const currentEndDate = restaurant.subscription_end_date ? new Date(restaurant.subscription_end_date) : null;
  const baseDate = currentEndDate && currentEndDate.getTime() > now.getTime() ? currentEndDate : now;
  const newEndDate = computeSubscriptionEndDate(baseDate, requestedTier);
  if (!newEndDate) return null;

  const updates = {
    subscription_tier: requestedTier,
    subscription_status: 'active',
    subscription_end_date: newEndDate,
    is_active: true,
  };

  if (!restaurant.subscription_start_date || !currentEndDate || currentEndDate.getTime() <= now.getTime()) {
    updates.subscription_start_date = now;
  }

  await restaurant.update(updates);
  return restaurant;
};

module.exports = {
  parseSubscriptionTierFromText,
  getSubscriptionDurationDays,
  computeSubscriptionEndDate,
  applyUpgradeRequestToRestaurant,
};
