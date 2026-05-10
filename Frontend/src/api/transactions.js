import client from './client'

export const getTransactions = (params = {}) =>
  client.get('/transactions/', { params }).then(r => r.data)

export const createTransaction = data =>
  client.post('/transactions/', data).then(r => r.data)

export const updateTransaction = (id, data) =>
  client.put(`/transactions/${id}`, data).then(r => r.data)

export const deleteTransaction = id =>
  client.delete(`/transactions/${id}`).then(r => r.data)
