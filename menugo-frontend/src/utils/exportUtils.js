import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'

export const exportToCSV = (data, filename) => {
  if (!data || !data.length) {
    console.warn('No data to export')
    return
  }

  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(','),
    ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
  ]
  
  const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  saveAs(csvBlob, `${filename}.csv`)
}

export const exportToExcel = (data, filename) => {
  if (!data || !data.length) {
    console.warn('No data to export')
    return
  }

  // Previously used the `xlsx` library which has an unresolved vulnerability
  // (prototype pollution / ReDoS). To avoid shipping a vulnerable dependency
  // for client-side exports, fall back to CSV which is Excel-compatible.
  // If a true .xlsx binary is required, consider a server-side export with
  // a vetted library or a commercial SheetJS Pro build.
  exportToCSV(data, filename)
}

export const exportToPDF = (data, filename, title = 'Report') => {
  if (!data || !data.length) {
    console.warn('No data to export')
    return
  }

  const doc = new jsPDF()
  const headers = Object.keys(data[0])
  const rows = data.map(row => headers.map(header => row[header] || ''))

  doc.setFontSize(18)
  doc.text(title, 14, 22)
  doc.setFontSize(11)
  doc.setTextColor(100)

  if (typeof doc.autoTable === 'function') {
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 30,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    })
  } else {
    let y = 32
    rows.forEach((row) => {
      const line = row.map((cell) => String(cell)).join(' | ')
      doc.text(line.slice(0, 170), 14, y)
      y += 8
    })
  }

  doc.save(`${filename}.pdf`)
}

export const exportToJSON = (data, filename) => {
  const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  saveAs(jsonBlob, `${filename}.json`)
}

export const exportSalesReport = (data, filename, format = 'csv') => {
  const exportData = data.map(item => ({
    'Date': item.date,
    'Orders': item.orders,
    'Revenue': item.revenue,
    'Average Order Value': item.avgOrderValue,
    'Dine In': item.dineInOrders,
    'Takeaway': item.takeawayOrders,
    'Delivery': item.deliveryOrders,
  }))

  switch (format) {
    case 'csv':
      exportToCSV(exportData, filename)
      break
    case 'excel':
      exportToExcel(exportData, filename)
      break
    case 'pdf':
      exportToPDF(exportData, filename, 'Sales Report')
      break
    case 'json':
      exportToJSON(exportData, filename)
      break
    default:
      exportToCSV(exportData, filename)
  }
}

export const exportOrdersReport = (orders, filename, format = 'csv') => {
  const exportData = orders.map(order => ({
    'Order #': order.orderNumber,
    'Customer': order.customerName,
    'Table': order.tableNumber,
    'Items': order.items?.map(i => `${i.quantity}x ${i.name}`).join(', '),
    'Total': order.totalAmount,
    'Status': order.status,
    'Date': new Date(order.createdAt).toLocaleString(),
  }))

  switch (format) {
    case 'csv':
      exportToCSV(exportData, filename)
      break
    case 'excel':
      exportToExcel(exportData, filename)
      break
    case 'pdf':
      exportToPDF(exportData, filename, 'Orders Report')
      break
    default:
      exportToCSV(exportData, filename)
  }
}

export const exportMenuReport = (items, filename, format = 'csv') => {
  const exportData = items.map(item => ({
    'Name': item.name,
    'Category': item.category,
    'Price': item.price,
    'Orders': item.orders,
    'Quantity Sold': item.quantitySold,
    'Revenue': item.revenue,
    'Available': item.isAvailable ? 'Yes' : 'No',
  }))

  switch (format) {
    case 'csv':
      exportToCSV(exportData, filename)
      break
    case 'excel':
      exportToExcel(exportData, filename)
      break
    case 'pdf':
      exportToPDF(exportData, filename, 'Menu Performance Report')
      break
    default:
      exportToCSV(exportData, filename)
  }
}
