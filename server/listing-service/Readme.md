# MarketX — Listing Service

The **Listing Service** manages product listings for MarketX, a microservices-based second-hand marketplace.

It handles listing creation, search, filtering, images, seller ownership, listing lifecycle, and scalable marketplace features.

---

## 🚀 Features

### Core Features

* Create product listings
* Update and delete listings
* Get listing by ID
* Browse active listings
* Seller ownership validation
* Listing status management
* Category-based filtering
* Location-based filtering

### Advanced Features

* 🔍 Full-text product search
* 🎯 Advanced filtering
* 💰 Price range filtering
* 📍 Location-based search
* 📸 Multiple image uploads
* ❤️ Wishlist integration
* 👁️ View tracking
* 📊 Listing analytics
* ⚡ Redis caching
* 📄 Pagination
* 🔎 MongoDB indexes
* 🗑️ Soft delete
* 🚦 Rate limiting
* 🔐 JWT-based authorization
* 📨 Event-driven architecture

---

## 🏗️ Architecture

```text
                    ┌───────────────┐
                    │     Client    │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  API Gateway  │
                    └───────┬───────┘
                            │
                            ▼
                  ┌───────────────────┐
                  │  Listing Service  │
                  └─────────┬─────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
          MongoDB         Redis       Object Storage
                                       (Images)
```

---

## 🛠️ Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* Redis
* Multer
* Cloudinary / AWS S3
* Docker
* RabbitMQ / Kafka
* REST APIs

---

## 📁 Project Structure

```text
listing-service/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── redis.js
│   │
│   ├── controllers/
│   │   └── listing.controller.js
│   │
│   ├── models/
│   │   └── listing.model.js
│   │
│   ├── routes/
│   │   └── listing.routes.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   └── upload.middleware.js
│   │
│   ├── services/
│   │   ├── listing.service.js
│   │   ├── search.service.js
│   │   └── image.service.js
│   │
│   ├── events/
│   │   └── listing.events.js
│   │
│   ├── utils/
│   │   ├── response.js
│   │   └── pagination.js
│   │
│   └── server.js
│
├── uploads/
├── .env
├── Dockerfile
├── package.json
└── README.md
```

---

# 🔐 Authentication

Listing Service uses JWT authentication.

```text
Client
   ↓
API Gateway
   ↓
JWT Verification
   ↓
Listing Service
```

Authenticated user information is available through:

```js
req.user.userId
```

The `sellerId` is automatically taken from the authenticated user.

---

# 📡 API Endpoints

| Method | Endpoint            | Auth | Description    |
| ------ | ------------------- | ---- | -------------- |
| GET    | `/api/listings`     | ❌    | Get listings   |
| GET    | `/api/listings/:id` | ❌    | Get listing    |
| POST   | `/api/listings`     | ✅    | Create listing |
| PUT    | `/api/listings/:id` | ✅    | Update listing |
| DELETE | `/api/listings/:id` | ✅    | Delete listing |

---

# 🔍 Search & Filtering

Example:

```http
GET /api/listings?search=iphone&category=electronics&minPrice=20000&maxPrice=60000
```

Supported filters:

* Search
* Category
* Price range
* Condition
* City
* State
* Seller
* Status

---

# 📄 Pagination

```http
GET /api/listings?page=1&limit=20
```

Response:

```json
{
  "success": true,
  "page": 1,
  "limit": 20,
  "total": 125,
  "pages": 7,
  "listings": []
}
```

---

# 📸 Image Upload

Images are uploaded separately from listing data.

```text
Client
  ↓
Listing Service
  ↓
Cloudinary / S3
  ↓
Image URL
  ↓
MongoDB
```

Only image URLs are stored in MongoDB.

---

# ⚡ Redis Caching

Frequently requested listings can be cached:

```text
Request
   ↓
Redis
   ├── Cache Hit → Response
   │
   └── Cache Miss
          ↓
       MongoDB
          ↓
        Redis
          ↓
       Response
```

This reduces database load for popular listings.

---

# 🗃️ Listing Lifecycle

```text
ACTIVE
  ↓
INACTIVE
  ↓
SOLD
  ↓
ARCHIVED
```

Listings should preferably use **soft deletion** instead of immediately deleting database records.

---

# 📨 Event-Driven Architecture

Important events:

```text
LISTING_CREATED
LISTING_UPDATED
LISTING_DELETED
LISTING_SOLD
```

Example:

```text
Listing Service
      ↓
RabbitMQ / Kafka
      ↓
Notification Service
Search Service
Analytics Service
Recommendation Service
```

---

# 🔎 MongoDB Indexing

Indexes should be created for frequently queried fields:

```js
listingSchema.index({ title: "text", description: "text" });

listingSchema.index({
  category: 1,
  price: 1,
  status: 1,
});

listingSchema.index({
  sellerId: 1,
  createdAt: -1,
});
```

---

# 🌍 Location Search

For advanced location-based discovery, use MongoDB geospatial indexing:

```text
User Location
      ↓
Geo Query
      ↓
Listings within radius
```

Example:

```http
GET /api/listings/nearby?lat=23.79&lng=86.43&radius=10
```

---

# 🛡️ Security

* JWT authentication
* Authorization
* Helmet
* CORS
* Input validation
* Rate limiting
* File type validation
* File size limits
* Seller ownership checks
* Environment variables for secrets

---

# 🐳 Docker

Build:

```bash
docker build -t marketx-listing-service .
```

Run:

```bash
docker run -p 5003:5003 marketx-listing-service
```

---

# ⚙️ Environment Variables

```env
PORT=5003

MONGO_URI=mongodb://localhost:27017/marketx_listings

JWT_SECRET=your_secret

REDIS_URL=redis://localhost:6379

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

# ▶️ Running Locally

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Production:

```bash
npm start
```

Health check:

```http
GET /health
```

---

# 🔄 MarketX Microservices

```text
                         Client
                           │
                           ▼
                     API Gateway
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
 Auth Service        User Service       Listing Service
 PostgreSQL           MongoDB               MongoDB
                                               │
                          ┌────────────────────┼──────────────┐
                          ▼                    ▼              ▼
                       Redis              S3/Cloudinary   RabbitMQ
```

---

## 🎯 Future Improvements

* Elasticsearch/OpenSearch
* AI-powered recommendations
* Fraud detection
* Duplicate listing detection
* Image moderation
* Price prediction
* Personalized search
* Recommendation engine
* Real-time listing notifications
* Seller reputation system
* Distributed tracing
* Prometheus + Grafana monitoring

---

## 📌 Status

**Development — Advanced Microservices Architecture**

Part of the **MarketX Marketplace Platform**.
