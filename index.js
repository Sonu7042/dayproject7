const express = require("express");
const cors = require("cors");
const { RateLimiterMemory } = require("rate-limiter-flexible");
const quotes = require("./quotes.json");

const app = express();
app.use(cors());

// Rate limiter: 5 requests per minute per client
const rateLimiter = new RateLimiterMemory({
  points: 5, // 5 requests
  duration: 60, // per 60 seconds
});

// Middleware to enforce rate limiting
app.use((req, res, next) => {
  const clientIp = req.ip; // Identify client by IP address
  rateLimiter
    .consume(clientIp)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).json({
        error: "Too many requests. Please try again after a minute.",
      });
    });
});

// Route to fetch a random quote
app.get("/api/quote", (req, res) => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const { id, text, author } = quotes[randomIndex]; // Exclude the 'type' field
  res.json({ id, text, author });
});

// Start the server for local development
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app; // Export for Vercel deployment
