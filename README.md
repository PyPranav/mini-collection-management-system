# Mini Collection Management System

## Project Overview

The Mini Collection Management System is a full-stack web application for managing customers, tracking their payments, and handling notifications. It features:

- **User authentication** (register, login, JWT-based sessions)
- **Customer management** (CRUD, filtering, Excel import/export)
- **Payment tracking** (mark as paid, outstanding, overdue)
- **Real-time notifications** (via WebSockets)
- **Modern UI** built with Next.js, React, and Tailwind CSS
- **RESTful API** with full Swagger/OpenAPI documentation

---

## Architecture Diagram

---

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Docker](https://www.docker.com/) (for running container)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/PyPranav/mini-collection-management-system
cd mini-collection-management-system
```

### 2. Start Elasticsearch (via Docker Compose)

```bash
docker-compose up -d
```

This will start an Elasticsearch instance on port `9200`.
Note: Dummy data with 75 customer record will be prefilled on first run.

### 3. Backend

- The backend will run on [http://localhost:5000](http://localhost:5000)
- API docs available at [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

### 4. Frontend

- The frontend will run on [http://localhost:3000](http://localhost:3000)

---

## Technical Decisions & Explanations

### Backend

- **Express.js**: Chosen for its simplicity and flexibility in building REST APIs.
- **Elasticsearch**: Used as the primary data store for customers, users, and notifications. Enables powerful search, filtering, and analytics.
- **Socket.IO**: Enables real-time notifications to users (e.g., payment status updates).
- **Swagger/OpenAPI**: All API endpoints are documented and browsable at `/api-docs`.
- **Multer**: Handles Excel file uploads for bulk customer import.
- **Jest**: Used for backend unit and integration testing.

### Frontend

- **Next.js (App Router)**: Provides a modern, fast, and SEO-friendly React framework.
- **Redux Toolkit**: Manages global state for authentication, customers, notifications, and payments.
- **React Table**: Powers the customer table with sorting, filtering, and pagination.
- **Radix UI & Tailwind CSS**: For accessible, customizable, and beautiful UI components.
- **Zod & React Hook Form**: For robust form validation and user input handling.
- **Socket.IO Client**: For real-time notification updates in the UI.

### DevOps

- **Docker Compose**: Simplifies running Elasticsearch, Frontend and Backend.
- **Environment Variables**: Used for secrets and configuration (see `.env.example`).

---

## API Documentation

- The backend exposes a fully documented OpenAPI/Swagger spec at `/api-docs`.
- All endpoints, parameters, request/response schemas, and error codes are described.

---

## Future Improvements

- **Role-based access control** (admin, manager, user)
- **User profile management** (edit profile, change password)
- **Advanced analytics** (charts for payments, overdue stats)
- **Notification preferences** (email, SMS, in-app)
- **Better error handling and logging** (production-grade)
- **CI/CD pipeline** (automated tests, linting, deployment)
- **Production Docker setup** (multi-stage builds, Nginx, HTTPS)
- **Unit and E2E tests for frontend** (using Jest, Playwright, or Cypress)
- **Internationalization (i18n)** for multi-language support

---
