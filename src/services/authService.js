import axiosInstance from '../utils/axiosInstance'

const API_URL = "http://localhost:8080/auth";

export const login = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials)
  return response.data
}

export const logout = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  return axiosInstance.post(
    "/auth/logout",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};