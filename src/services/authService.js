import axiosInstance from '../api/axiosInstance'
import { clearSession, getSession, saveSession } from '../utils/session'

export const login = async ({ username, password }) => {
  const response = await axiosInstance.post('/auth/login', { username, password })
  saveSession(response.data?.token)
  return response.data
}

export const register = async ({ userName, email, password }) => {
  const response = await axiosInstance.post('/auth/register', {
    userName, email, password, role: 'USER',
  })
  return response.data
}

export const logout = async () => {
  try {
    if (getSession()) {
      return await axiosInstance.post('/auth/logout', {})
    }
  } finally {
    clearSession()
  }
}