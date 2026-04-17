// 👉 Main Navigation; Title, Icon

export const mainNav = [
  ['User Management', 'mdi-account-multiple'],
  ['Home', 'mdi-home', '/dashboard'],
  ['Products', 'mdi-information-outline', '/products'],
  ['Daily Usage', 'mdi-clipboard-check-outline', '/daily-usage'],
  ['Reports', 'mdi-file-chart-outline', '/reports'],
]

export const menuItemsNav1 = [
  ['List of Branches', 'mdi-store', '', '/manage/branches'],
  ['User Roles', 'mdi-tag-multiple', '', '/manage/user/roles'],
  ['Users Management', 'mdi-account-multiple', '', '/manage/users'],
]
export const menuItemsNav2 = [
  ['Product Information', 'mdi-information-box', 'Add and Manage Products', '/products'],
]
export const menuItemsNav3 = [
  ['Stock In', 'mdi-tray-arrow-down', 'Add Stocks on Products', '/inventory/stockin'],
  ['Stock Segregation', 'mdi-tray-full', 'Track Weight and Segregation', '/inventory/segregate'],
  ['Check Out', 'mdi-cart-variant', 'Sell Products', '/inventory/sales'],
  ['Stock Transfer', 'mdi-transfer', 'Multi-Branch Stock Transfers', '/inventory/transfer'],
]
export const menuItemsNav4 = [
  ['Expenditures', 'mdi-cash-remove', 'Tally and Manage Expenses', '/expenses'],
]
export const menuItemsNav5 = [
  ['Running Inventory', 'mdi-package', 'Products Inventory Report', '/reports/products'],
  ['Stocks', 'mdi-poll', 'Stocks of Products Report', '/reports/stocks'],
  ['Sales Status', 'mdi-sale', 'Sold Products Report', '/reports/sales'],
  ['Sales Summary', 'mdi-counter', 'Sales and Expenses Report', '/reports/summary'],
  ['Expenses', 'mdi-cash-multiple', 'Expenditures Report', '/reports/expenses'],
]
