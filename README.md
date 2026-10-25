# Smart Productivity Tracker – Frontend
A modern React + Tailwind CSS frontend for a microservices-based task management system.

## 🚀 Features
- JWT-based authentication
- Task CRUD operations
- Status updates (Pending / In Progress / Done)
- Kanban-style workflow
- Responsive UI with Tailwind CSS

## 🛠 Tech Stack
- React (Vite)
- Tailwind CSS
- Axios
- Spring Boot microservices behind an API Gateway (Backend)
- Kafka (analytics events)
- JWT Authentication

## 📸 Screenshots
<img width="1366" height="768" alt="Screenshot (4)" src="https://github.com/user-attachments/assets/ce442890-d433-4cfe-8a5a-d18097e5cea0" />
<img width="1366" height="768" alt="Screenshot (5)" src="https://github.com/user-attachments/assets/fa5b03cd-7e65-4777-895d-a19e39920e53" />
<img width="1366" height="768" alt="Screenshot (6)" src="https://github.com/user-attachments/assets/a3d4fe9f-68cb-4358-abb0-6134989bd777" />
<img width="1366" height="768" alt="Screenshot (7)" src="https://github.com/user-attachments/assets/b89fe2b7-41a2-4816-a363-f85873a7b934" />
<img width="1366" height="768" alt="Screenshot (8)" src="https://github.com/user-attachments/assets/c7106ebf-78a6-4558-acba-f752f8f21318" />
<img width="1366" height="768" alt="Screenshot (10)" src="https://github.com/user-attachments/assets/4f875d1b-d0b5-480f-a592-b7e00066b8b3" />
<img width="1366" height="768" alt="Screenshot (9)" src="https://github.com/user-attachments/assets/c829aac8-1ddc-413b-befe-c865629e1d53" />

## ▶️ Run Locally

Works with **Node.js 18.17+** (Vite 6, React Router 6). ESLint prints engine warnings on 18.17; they are harmless.

1. Start the backend (in order): Kafka (`docker-compose up -d`), PostgreSQL on `:5432` (database `SPT`), Eureka `:8761`, Auth `:8081`, User `:8082`, Task `:8083`, AI `:8084`, then the API Gateway `:8080`.
2. Start the frontend:
```bash
npm install
npm run dev
```
The dev server proxies `/api` to `http://localhost:8080`. Set `VITE_API_BASE_URL` to override.
