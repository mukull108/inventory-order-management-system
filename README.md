# Inventory & Order Management System

This project is a simplified full-stack inventory and order management system built for the Ethara.ai software engineer assessment.

## Tech Stack

- Backend: FastAPI, SQLAlchemy, PostgreSQL
- Frontend: React, Vite
- Configuration: Environment variables

## Features

- Create and list products with unique SKUs
- Create and list customers with unique email addresses
- Create orders for customers
- Validate stock before placing an order
- Automatically reduce inventory when an order is placed
- Reject orders when stock is insufficient
- Responsive frontend dashboard

## Project Structure

```text
backend/
  app/
frontend/
README.md
```

## Backend Setup

1. Create a virtual environment inside `backend/`.
2. Install dependencies from `backend/requirements.txt`.
3. Copy `backend/.env.example` to `backend/.env`.
4. Update `DATABASE_URL` to point to your PostgreSQL database.
5. Start the API with:

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend Setup

1. Install dependencies inside `frontend/`.
2. Copy `frontend/.env.example` to `frontend/.env`.
3. Start the frontend with:

```bash
cd frontend
npm run dev
```

## Environment Variables

### Backend

- `DATABASE_URL`
- `APP_ENV`
- `APP_HOST`
- `APP_PORT`
- `CORS_ORIGINS`

### Frontend

- `VITE_API_URL`

## API Endpoints

- `GET /health`
- `GET /products`
- `POST /products`
- `PUT /products/{product_id}`
- `GET /customers`
- `POST /customers`
- `PUT /customers/{customer_id}`
- `GET /orders`
- `POST /orders`

## Remaining Work

- Add Docker and Docker Compose
- Deploy frontend and backend
- Push to GitHub and publish links
