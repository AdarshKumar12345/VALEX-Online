# MarketX - User Service

User management microservice for the MarketX marketplace.

## Responsibilities

- User registration
- User profile management
- User authentication/authorization
- User data management
- JWT verification
- User account operations

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Docker

## Architecture

Client
   ↓
API Gateway
   ↓
User Service
   ↓
MongoDB

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/users/register | Register user |
| POST | /api/users/login | Login user |
| GET | /api/users/me | Get current user |
| PUT | /api/users/me | Update profile |
| DELETE | /api/users/me | Delete account |
| GET | /api/users/:id | Get user |

## Environment Variables

PORT=5001
MONGO_URI=mongodb://localhost:27017/marketx_users
JWT_SECRET=your_secret

## Run Locally

npm install
npm run dev

## Docker

docker build -t marketx-user-service .
docker run -p 5001:5001 marketx-user-service