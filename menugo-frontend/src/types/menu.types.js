/**
 * @typedef {Object} MenuCategory
 * @property {string} id - Category unique identifier
 * @property {string} restaurantId - Restaurant identifier
 * @property {string} name - Category name
 * @property {string} description - Category description
 * @property {string} iconUrl - Icon image URL
 * @property {string} imageUrl - Category image URL
 * @property {number} displayOrder - Display order index
 * @property {boolean} isActive - Active status
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} MenuItem
 * @property {string} id - Menu item unique identifier
 * @property {string} restaurantId - Restaurant identifier
 * @property {string} categoryId - Category identifier
 * @property {string} name - Item name
 * @property {string} description - Item description
 * @property {number} price - Item price
 * @property {number} discountPrice - Discounted price
 * @property {number} cost - Item cost
 * @property {string} imageUrl - Image URL
 * @property {string} thumbnailUrl - Thumbnail image URL
 * @property {string} videoUrl - Video URL
 * @property {boolean} isAvailable - Availability status
 * @property {boolean} isRecommended - Recommended flag
 * @property {boolean} isPopular - Popular flag
 * @property {boolean} isNew - New item flag
 * @property {boolean} isVegetarian - Vegetarian flag
 * @property {boolean} isVegan - Vegan flag
 * @property {boolean} isGlutenFree - Gluten-free flag
 * @property {boolean} isHalal - Halal flag
 * @property {number} spiceLevel - Spice level (0-5)
 * @property {number} preparationTime - Preparation time in minutes
 * @property {number} calories - Calorie count
 * @property {string} servingSize - Serving size
 * @property {string[]} allergens - Allergen list
 * @property {string[]} tags - Item tags
 * @property {number} displayOrder - Display order index
 * @property {number} stockQuantity - Current stock quantity
 * @property {number} lowStockThreshold - Low stock threshold
 * @property {number} salesCount - Number of times sold
 * @property {number} rating - Average rating
 * @property {number} reviewCount - Number of reviews
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} MenuItemOptionGroup
 * @property {string} id - Option group identifier
 * @property {string} restaurantId - Restaurant identifier
 * @property {string} name - Group name
 * @property {string} description - Group description
 * @property {number} minSelection - Minimum selections
 * @property {number} maxSelection - Maximum selections
 * @property {boolean} isRequired - Required flag
 * @property {number} displayOrder - Display order
 * @property {MenuItemOption[]} options - Available options
 */

/**
 * @typedef {Object} MenuItemOption
 * @property {string} id - Option identifier
 * @property {string} menuItemId - Menu item identifier
 * @property {string} optionGroupId - Option group identifier
 * @property {string} name - Option name
 * @property {number} priceAdjustment - Price adjustment amount
 * @property {boolean} isDefault - Default option flag
 * @property {number} displayOrder - Display order
 */

/**
 * @typedef {Object} MenuItemModifier
 * @property {string} id - Modifier identifier
 * @property {string} restaurantId - Restaurant identifier
 * @property {string} name - Modifier name
 * @property {string} description - Modifier description
 * @property {number} priceAdjustment - Price adjustment amount
 * @property {boolean} isActive - Active status
 */

export const SpiceLevels = {
  NONE: 0,
  MILD: 1,
  MEDIUM: 2,
  HOT: 3,
  VERY_HOT: 4,
  EXTREME: 5,
}

export const DietaryOptions = {
  VEGETARIAN: 'isVegetarian',
  VEGAN: 'isVegan',
  GLUTEN_FREE: 'isGlutenFree',
  HALAL: 'isHalal',
}