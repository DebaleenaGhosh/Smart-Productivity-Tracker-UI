import axiosInstance from '../utils/axiosInstance'

export const login = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials)
  return response.data
}

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
}
