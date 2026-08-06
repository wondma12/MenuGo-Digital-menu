// src/components/kitchen/KitchenFilters.jsx


const KitchenFilters = ({ filter, onFilterChange }) => {
  const stations = ['all', 'grill', 'pizza', 'salad', 'dessert', 'expo'];

  const handleChange = (key, value) => {
    onFilterChange({ ...filter, [key]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Order
          </label>
          <input
            type="text"
            placeholder="Order # or customer..."
            value={filter.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kitchen Station
          </label>
          <select
            value={filter.station}
            onChange={(e) => handleChange('station', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          >
            {stations.map(station => (
              <option key={station} value={station}>
                {station.charAt(0).toUpperCase() + station.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={filter.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">All</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time Range
          </label>
          <select
            value={filter.timeRange}
            onChange={(e) => handleChange('timeRange', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">All Time</option>
            <option value="15">Last 15 min</option>
            <option value="30">Last 30 min</option>
            <option value="60">Last Hour</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default KitchenFilters;