import client from './client'

export const getSummary = () =>
  client.get('/dashboard/summary').then(r => r.data)

export const getExpenseByCategory = () =>
  client.get('/dashboard/expense-by-category').then(r => r.data)

export const getMonthlySummary = () =>
  client.get('/dashboard/monthly').then(r => r.data)

export const getBudgetProgress = (params = {}) =>
  client.get('/dashboard/budget-progress', { params }).then(r => r.data)
