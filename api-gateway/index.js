import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

// Create an instance of Express app
const app = express();


// Middleware setup
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
); // Enable CORS with credentials
app.use(helmet()); // Add security headers
app.use(morgan("combined")); // Log HTTP requests
app.disable("x-powered-by"); // Hide Express server information



// Define routes and corresponding microservices
const services = [
  {
    route: "/auth",
    target: process.env.AUTH_SERVICE_URL || "http://localhost:5001",
  },
  {
    route: "/users",
    target: process.env.USER_SERVICE_URL || "http://localhost:5002",
  },
  {
    route: "/listings",
    target: process.env.LISTING_SERVICE_URL || "http://localhost:5003",
  },
  {
    route: "/offers",
    target: process.env.LISTING_SERVICE_URL || "http://localhost:5003",
  },
  {
    route: "/chats",
    target: process.env.CHAT_SERVICE_URL || "http://localhost:5004",
  },
  {
    route: "/payment",
    target: process.env.PAYMENT_SERVICE_URL || "http://localhost:5005",
  },
];


// Define rate limit constants
const rateLimit = 300; // Max requests per minute
const interval = 60 * 1000; // Time window in milliseconds (1 minute)

// Object to store request counts for each IP address
const requestCounts = {};

// Reset request count for each IP address every 'interval' milliseconds
setInterval(() => {
  Object.keys(requestCounts).forEach((ip) => {
    requestCounts[ip] = 0; // Reset request count for each IP address
  });
}, interval);



// Middleware function for rate limiting and timeout handling
function rateLimitAndTimeout(req, res, next) {
  const ip = req.ip; // Get client IP address

  // Update request count for the current IP
  requestCounts[ip] = (requestCounts[ip] || 0) + 1;

  // Check if request count exceeds the rate limit
  if (requestCounts[ip] > rateLimit) {
    // Respond with a 429 Too Many Requests status code
    return res.status(429).json({
      code: 429,
      status: "Error",
      message: "Rate limit exceeded.",
      data: null,
    });
  }

  // Set timeout for each request (example: 10 seconds)
  req.setTimeout(15000, () => {
    // Handle timeout error
    res.status(504).json({
      code: 504,
      status: "Error",
      message: "Gateway timeout.",
      data: null,
    });
    req.abort(); // Abort the request
  });

  next(); // Continue to the next middleware
}

app.use(rateLimitAndTimeout);

// Set up proxy middleware for each microservice
services.forEach(({ route, target }) => {
  // Proxy options
  const proxyOptions = {
    target,
    changeOrigin: true,
    pathRewrite: {
      [`^${route}`]: "",
    },
  };

  // Apply rate limiting and timeout middleware before proxying
  app.use(route, rateLimitAndTimeout, createProxyMiddleware(proxyOptions));
});


// Handler for route-not-found
app.use((_req, res) => {
 res.status(404).json({
   code: 404,
   status: "Error",
   message: "Route not found.",
   data: null,
 });
});




// Define port for Express server
const PORT = process.env.PORT || 5000;


// Start Express server
app.listen(PORT, () => {
 console.log(`Gateway is running on port ${PORT}`);
});