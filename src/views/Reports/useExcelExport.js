// useExcelExport.js
// Drop this beside your SalesSummary view and import it there.
// Requires: npm install xlsx  (SheetJS community edition)

import * as XLSX from 'xlsx'

const CURRENCY_FMT = '₱#,##0.00'
const PCT_FMT = '0.00%'
const DATE_FMT = 'MMM D, YYYY'

// ── Helpers ──────────────────────────────────────────────────────────────────

function setColWidths(ws, widths) {
  ws['!cols'] = widths.map((w) => ({ wch: w }))
}

function styleHeader(ws, range, bgColor = '8B0000') {
  for (let C = range.s.c; C <= range.e.c; C++) {
    const addr = XLSX.utils.encode_cell({ r: range.s.r, c: C })
    if (!ws[addr]) continue
    ws[addr].s = {
      font: { bold: true, color: { rgb: 'FFFFFF' }, name: 'Arial', sz: 10 },
      fill: { patternType: 'solid', fgColor: { rgb: bgColor } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        bottom: { style: 'medium', color: { rgb: 'FFFFFF' } },
        right: { style: 'thin', color: { rgb: 'FFFFFF' } },
      },
    }
  }
}

function applyCurrencyStyle(ws, rowStart, rowEnd, cols) {
  for (let R = rowStart; R <= rowEnd; R++) {
    for (const C of cols) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C })
      if (!ws[addr]) continue
      ws[addr].s = {
        numFmt: CURRENCY_FMT,
        font: { name: 'Arial', sz: 10 },
        alignment: { horizontal: 'right' },
      }
    }
  }
}

function applyProfitStyle(ws, rowStart, rowEnd, profitCol, salesCol) {
  for (let R = rowStart; R <= rowEnd; R++) {
    const profitAddr = XLSX.utils.encode_cell({ r: R, c: profitCol })
    if (!ws[profitAddr]) continue
    const val = ws[profitAddr].v
    ws[profitAddr].s = {
      numFmt: CURRENCY_FMT,
      font: { bold: true, name: 'Arial', sz: 10, color: { rgb: val >= 0 ? '2E7D32' : 'C62828' } },
      alignment: { horizontal: 'right' },
      fill: { patternType: 'solid', fgColor: { rgb: val >= 0 ? 'E8F5E9' : 'FFF5F5' } },
    }
    if (salesCol !== undefined) {
      const marginAddr = XLSX.utils.encode_cell({ r: R, c: salesCol })
      if (ws[marginAddr]) {
        ws[marginAddr].s = {
          numFmt: PCT_FMT,
          font: { name: 'Arial', sz: 10, color: { rgb: val >= 0 ? '2E7D32' : 'C62828' } },
          alignment: { horizontal: 'right' },
        }
      }
    }
  }
}

function applyZebraRows(ws, rowStart, rowEnd, colCount) {
  for (let R = rowStart; R <= rowEnd; R++) {
    const isEven = (R - rowStart) % 2 === 0
    for (let C = 0; C < colCount; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C })
      if (!ws[addr]) ws[addr] = { t: 'z', v: '' }
      if (!ws[addr].s) ws[addr].s = {}
      if (isEven) {
        ws[addr].s.fill = { patternType: 'solid', fgColor: { rgb: 'FFF8F8' } }
      }
    }
  }
}

function addSummaryRow(ws, row, labels, colCount) {
  for (let C = 0; C < colCount; C++) {
    const addr = XLSX.utils.encode_cell({ r: row, c: C })
    ws[addr] = { t: C === 0 ? 's' : 'n', v: labels[C] ?? '' }
    ws[addr].s = {
      font: { bold: true, name: 'Arial', sz: 10, color: { rgb: '1A1A1A' } },
      fill: { patternType: 'solid', fgColor: { rgb: 'F5F5F5' } },
      numFmt: C > 0 ? CURRENCY_FMT : '@',
      alignment: { horizontal: C === 0 ? 'left' : 'right' },
      border: { top: { style: 'medium', color: { rgb: 'CCCCCC' } } },
    }
  }
}

function formatMonth(m) {
  const [year, month] = m.split('-')
  return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function downloadWorkbook(wb, filename) {
  XLSX.writeFile(wb, filename, { bookType: 'xlsx', type: 'binary', cellStyles: true })
}

// ── Sheet builders ────────────────────────────────────────────────────────────

function buildDailySheet(reports) {
  const headers = ['Date', 'Sales (₱)', 'Expenses (₱)', 'Net Profit (₱)', 'Margin (%)']
  const rows = reports.map((r) => [
    formatDate(r.date),
    r.sales,
    r.expenses,
    r.profit,
    r.sales > 0 ? r.profit / r.sales : 0,
  ])

  const totalSales = reports.reduce((s, r) => s + r.sales, 0)
  const totalExpenses = reports.reduce((s, r) => s + r.expenses, 0)
  const totalProfit = totalSales - totalExpenses

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
  const dataRowCount = rows.length
  const lastDataRow = 1 + dataRowCount // 0-indexed

  // totals row
  addSummaryRow(
    ws,
    lastDataRow + 1,
    [
      'TOTAL',
      totalSales,
      totalExpenses,
      totalProfit,
      totalSales > 0 ? totalProfit / totalSales : 0,
    ],
    5,
  )
  ws[XLSX.utils.encode_cell({ r: lastDataRow + 1, c: 4 })].s.numFmt = PCT_FMT

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: lastDataRow + 1, c: 4 } })

  styleHeader(ws, { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } })
  applyCurrencyStyle(ws, 1, lastDataRow, [1, 2, 3])
  applyProfitStyle(ws, 1, lastDataRow, 3, 4)
  applyZebraRows(ws, 1, lastDataRow, 5)
  setColWidths(ws, [18, 15, 15, 16, 12])

  return ws
}

function buildMonthlySheet(reports) {
  const headers = [
    'Month',
    'Days',
    'Total Sales (₱)',
    'Total Expenses (₱)',
    'Net Profit (₱)',
    'Avg Daily Sales (₱)',
    'Margin (%)',
  ]

  const grouped = {}
  reports.forEach((r) => {
    const month = r.date.slice(0, 7)
    if (!grouped[month]) grouped[month] = { sales: 0, expenses: 0, profit: 0, days: 0 }
    grouped[month].sales += r.sales
    grouped[month].expenses += r.expenses
    grouped[month].profit += r.profit
    grouped[month].days += 1
  })

  const monthly = Object.entries(grouped)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, d]) => ({
      month,
      ...d,
      avgDaily: d.days > 0 ? Math.round(d.sales / d.days) : 0,
      margin: d.sales > 0 ? d.profit / d.sales : 0,
    }))

  const rows = monthly.map((m) => [
    formatMonth(m.month),
    m.days,
    m.sales,
    m.expenses,
    m.profit,
    m.avgDaily,
    m.margin,
  ])

  const totSales = monthly.reduce((s, m) => s + m.sales, 0)
  const totExpenses = monthly.reduce((s, m) => s + m.expenses, 0)
  const totProfit = totSales - totExpenses

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
  const lastDataRow = rows.length

  addSummaryRow(
    ws,
    lastDataRow + 1,
    [
      'TOTAL',
      monthly.reduce((s, m) => s + m.days, 0),
      totSales,
      totExpenses,
      totProfit,
      '',
      totSales > 0 ? totProfit / totSales : 0,
    ],
    7,
  )

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: lastDataRow + 1, c: 6 } })

  styleHeader(ws, { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } })
  applyCurrencyStyle(ws, 1, lastDataRow, [2, 3, 4, 5])
  applyProfitStyle(ws, 1, lastDataRow, 4, 6)
  applyZebraRows(ws, 1, lastDataRow, 7)
  setColWidths(ws, [20, 8, 16, 18, 16, 18, 10])

  return ws
}

function buildTopProductsSheet(products) {
  const headers = ['Rank', 'Product Name', 'Quantity', 'Unit', 'Unit Price (₱)', 'Total Value (₱)']
  const sorted = [...products].sort((a, b) => b.totalPrice - a.totalPrice)
  const rows = sorted.map((p, i) => [i + 1, p.name, p.quantity, p.unit, p.price, p.totalPrice])

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
  const lastDataRow = rows.length

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: lastDataRow, c: 5 } })

  styleHeader(ws, { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } })
  applyCurrencyStyle(ws, 1, lastDataRow, [4, 5])
  applyZebraRows(ws, 1, lastDataRow, 6)

  // Rank column center align
  for (let R = 1; R <= lastDataRow; R++) {
    const addr = XLSX.utils.encode_cell({ r: R, c: 0 })
    if (ws[addr])
      ws[addr].s = {
        alignment: { horizontal: 'center' },
        font: { bold: true, name: 'Arial', sz: 10 },
      }
  }

  setColWidths(ws, [8, 28, 12, 10, 16, 16])

  return ws
}

// ── Public exports ────────────────────────────────────────────────────────────

export function exportDailyExcel(reports) {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, buildDailySheet(reports), 'Daily Reports')
  downloadWorkbook(wb, 'daily_sales_report.xlsx')
}

export function exportMonthlyExcel(reports) {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, buildMonthlySheet(reports), 'Monthly Reports')
  downloadWorkbook(wb, 'monthly_sales_report.xlsx')
}

export function exportMonthlyDetailExcel(reports, selectedMonth) {
  const filtered = reports.filter((r) => r.date.startsWith(selectedMonth))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, buildDailySheet(filtered), `Report ${selectedMonth}`)
  downloadWorkbook(wb, `report_${selectedMonth}.xlsx`)
}

export function exportFullReportExcel(reports, products) {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, buildDailySheet(reports), 'Daily Reports')
  XLSX.utils.book_append_sheet(wb, buildMonthlySheet(reports), 'Monthly Reports')
  XLSX.utils.book_append_sheet(wb, buildTopProductsSheet(products), 'Top Products')
  downloadWorkbook(wb, 'full_sales_report.xlsx')
}
