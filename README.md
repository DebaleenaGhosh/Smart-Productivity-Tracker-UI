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
<img width="949" height="460" alt="2026-10-24 00_34_43-AIService – SuggestionService java" src="https://github.com/user-attachments/assets/9398004c-7009-4981-8423-29d74f43f7d0" />
<img width="392" height="321" alt="2026-10-24 00_35_55-AIService – SuggestionService java" src="https://github.com/user-attachments/assets/04e7da0b-487b-4cbb-99c3-51f340506cdc" />
<img width="960" height="463" alt="2026-10-24 00_34_13-Settings" src="https://github.com/user-attachments/assets/e81ec542-3ff2-4f15-90c2-e8fe7b9218e7" />
<img width="960" height="503" alt="2026-10-24 00_33_18-Settings" src="https://github.com/user-attachments/assets/9a9924e3-8bc0-4ac1-9ca3-1434992ec9b5" />
<img width="788" height="387" alt="2026-10-24 00_32_52-Settings" src="https://github.com/user-attachments/assets/bf62b9d8-b3f3-4431-a93f-bfb7c94c6717" />
<img width="960" height="462" alt="2026-10-24 00_31_39-Settings" src="https://github.com/user-attachments/assets/b9e39155-478b-47cf-ab3b-4798e8701cab" />
<img width="903" height="459" alt="2026-10-24 00_31_53-AIService – SuggestionService java" src="https://github.com/user-attachments/assets/b0fafd60-22ea-4eff-9818-4ca2799d8337" />
<img width="953" height="462" alt="2026-10-24 00_24_34-AIService – SuggestionService java" src="https://github.com/user-attachments/assets/cfcad759-f3bb-41d2-9174-79df94796e3f" />


## ▶️ Run Locally

Works with **Node.js 18.17+** (Vite 6, React Router 6). ESLint prints engine warnings on 18.17; they are harmless.

1. Start the backend (in order): Kafka (`docker-compose up -d`), PostgreSQL on `:5432` (database `SPT`), Eureka `:8761`, Auth `:8081`, User `:8082`, Task `:8083`, AI `:8084`, then the API Gateway `:8080`.
2. Start the frontend:
```bash
npm install
npm run dev
```
The dev server proxies `/api` to `http://localhost:8080`. Set `VITE_API_BASE_URL` to override.
