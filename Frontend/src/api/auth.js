import client from './client'
import axios from 'axios'

const BASE = 'http://localhost:5000/api'

export async function register(data) {
  const res = await axios.post(`${BASE}/auth/register`, data)
  return res.data
}

export async function login(data) {
  const res = await axios.post(`${BASE}/auth/login`, data)
  return res.data
}

export async function getMe(token) {
  const res = await axios.get(`${BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}
