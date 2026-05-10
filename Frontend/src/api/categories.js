import client from './client'

export const getCategories = (params = {}) =>
  client.get('/categories/', { params }).then(r => r.data)

export const createCategory = data =>
  client.post('/categories/', data).then(r => r.data)

export const updateCategory = (id, data) =>
  client.put(`/categories/${id}`, data).then(r => r.data)

export const deleteCategory = id =>
  client.delete(`/categories/${id}`).then(r => r.data)
