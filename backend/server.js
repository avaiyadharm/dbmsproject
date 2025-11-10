import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";
import carRoutes from "./routes/car.js";
import bookingRoutes from "./routes/booking.js"; // added

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ✅ Mount routes
app.use("/api/cars", carRoutes);
app.use("/api/bookings", bookingRoutes); // added

// Health check route
app.get("/", (req, res) => {
  res.send("Supabase backend working ✅");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: err.message });
});

// replaced single listen(...) call with a retrying starter
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5000;

function startServer(port = DEFAULT_PORT, attempts = 3) {
  const server = app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });

  server.on("error", (err) => {
    if (err && err.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use.`);
      if (attempts > 0) {
        const nextPort = port + 1;
        console.log(`Trying port ${nextPort} (attempts left: ${attempts - 1})...`);
        // small delay before retry
        setTimeout(() => startServer(nextPort, attempts - 1), 250);
      } else {
        console.error(
          `All retry attempts failed. To free port ${port}:\n` +
            `  Windows:\n    netstat -ano | findstr :${port}\n    taskkill /PID <PID> /F\n` +
            `  macOS / Linux:\n    lsof -i :${port} || ss -ltnp | grep ${port}\n    kill -9 <PID>\n` +
            `Or change PORT in your .env and restart the server.`
        );
        process.exit(1);
      }
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });
}

startServer();
