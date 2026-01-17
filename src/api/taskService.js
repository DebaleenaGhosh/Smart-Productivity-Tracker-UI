import axiosInstance from "./axiosInstance";

export const getTasks = () =>
  axiosInstance.get("/tasks/taskList");

export const createTask = (task) =>
  axiosInstance.post("/tasks/createTask", task);

export const updateTask = (task) =>
  axiosInstance.put("/tasks/updateTask", task);

export const deleteTask = (taskId) =>
  axiosInstance.delete(`/tasks/${taskId}`);

export const toggleTaskStatus = (task) =>
  axiosInstance.put("/tasks/updateTask", {
    ...task,
    status: task.status === "PENDING" ? "DONE" : "PENDING",
  });
// import axios from "axios";

// const API_URL = "http://localhost:8080";

// export const getTasks = () => {
//   const token = localStorage.getItem("token");

//   return axios.get(`${API_URL}/tasks/taskList`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
// };