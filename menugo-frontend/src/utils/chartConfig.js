export const chartColors = {
  primary: '#3b82f6',
  secondary: '#10b981',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1',
  gray: '#6b7280',
}

export const chartGradients = {
  revenue: {
    start: '#10b981',
    end: '#059669',
  },
  orders: {
    start: '#3b82f6',
    end: '#2563eb',
  },
  visitors: {
    start: '#8b5cf6',
    end: '#7c3aed',
  },
}

export const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        boxWidth: 8,
      },
    },
    tooltip: {
      backgroundColor: '#1f2937',
      titleColor: '#f3f4f6',
      bodyColor: '#d1d5db',
      borderColor: '#374151',
      borderWidth: 1,
    },
  },
}

export const lineChartOptions = {
  ...commonChartOptions,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#e5e7eb',
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
  elements: {
    line: {
      tension: 0.4,
    },
    point: {
      radius: 4,
      hoverRadius: 6,
    },
  },
}

export const barChartOptions = {
  ...commonChartOptions,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#e5e7eb',
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
  elements: {
    bar: {
      borderRadius: 4,
    },
  },
}

export const pieChartOptions = {
  ...commonChartOptions,
  plugins: {
    ...commonChartOptions.plugins,
    tooltip: {
      ...commonChartOptions.plugins.tooltip,
      callbacks: {
        label: (context) => {
          const label = context.label || ''
          const value = context.raw || 0
          const total = context.dataset.data.reduce((a, b) => a + b, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return `${label}: ${value} (${percentage}%)`
        },
      },
    },
  },
}