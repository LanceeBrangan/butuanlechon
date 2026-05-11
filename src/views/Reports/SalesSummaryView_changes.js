// ─────────────────────────────────────────────────────────────────────────────
// CHANGES LANG NI — dili full file.
// Sa imong SalesSummaryView.vue, buhata kining 3 ka changes:
// ─────────────────────────────────────────────────────────────────────────────

// ① IMPORT — i-add sa top sa <script setup>, kauban sa ubang imports:
import {
  exportDailyExcel,
  exportMonthlyExcel,
  exportMonthlyDetailExcel,
  exportFullReportExcel,
} from './useExcelExport.js' // adjust path kung lain ang location

// ② I-REPLACE ang 4 ka export functions (exportDailyCSV, exportMonthlyCSV,
//    exportMonthlyDetailCSV, downloadCSV) — tangtanga tanan, butang ni:

const exportDailyCSV = () => exportDailyExcel(allReports.value)
const exportMonthlyCSV = () => exportMonthlyExcel(allReports.value)
const exportMonthlyDetailCSV = () => exportMonthlyDetailExcel(allReports.value, selectedMonth.value)
const exportFullReport = () => exportFullReportExcel(allReports.value, products.value)

// ③ OPTIONAL — i-add ang "Export Full Report" button sa top bar sa template:
//
//   <v-btn variant="flat" size="small" rounded="lg" class="export-btn-full"
//          @click="exportFullReport">
//     <v-icon start size="16">mdi-download</v-icon>
//     Full Report
//   </v-btn>
//
//   CSS para sa button:
//   .export-btn-full {
//     background: rgba(255,255,255,0.92) !important;
//     color: #8b0000 !important;
//     font-weight: 700 !important;
//     font-size: 0.78rem !important;
//     text-transform: none !important;
//   }
