// src/components/platform-admin/restaurants/RestaurantFilters.jsx


const RestaurantFilters = ({ filters, onFiltersChange }) => {
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending Verification' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const tierOptions = [
    { value: 'all', label: 'All Tiers' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'six_month', label: '6-Month' },
    { value: 'yearly', label: 'Yearly' },
  ];

  const countryOptions = [
    { value: 'all', label: 'All Countries' },
    { value: 'USA', label: 'United States' },
    { value: 'Canada', label: 'Canada' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'Australia', label: 'Australia' },
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      tier: 'all',
      country: 'all',
      dateRange: null,
    });
  };

  const hasActiveFilters = filters.status !== 'all' || filters.tier !== 'all' || filters.country !== 'all';

  return (
    <div className="rounded-none border border-orange-100 bg-gradient-to-br from-white to-orange-50/40 p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-black text-slate-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm font-semibold text-orange-600 hover:text-orange-700"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Status Filter */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value} className="text-slate-900">{option.label}</option>
            ))}
          </select>
        </div>

        {/* Subscription Tier Filter */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Subscription</label>
          <select
            value={filters.tier}
            onChange={(e) => handleFilterChange('tier', e.target.value)}
            className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
          >
            {tierOptions.map(option => (
              <option key={option.value} value={option.value} className="text-slate-900">{option.label}</option>
            ))}
          </select>
        </div>

        {/* Country Filter */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Country</label>
          <select
            value={filters.country}
            onChange={(e) => handleFilterChange('country', e.target.value)}
            className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
          >
            {countryOptions.map(option => (
              <option key={option.value} value={option.value} className="text-slate-900">{option.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default RestaurantFilters;