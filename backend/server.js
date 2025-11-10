import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";
import carRoutes from "./routes/car.js";
import customerRoutes from "./routes/customer.js"; // ✅ import after express
import bookingRoutes from "./routes/booking.js";   // optional, if you have one

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Initialize app FIRST before using app.use
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware (shows every request)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ✅ Mount your routes AFTER app is initialized
app.use("/api/cars", carRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/bookings", bookingRoutes); // only if exists

// Root test route
app.get("/", (req, res) => {
  res.send("🚀 Backend working fine!");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
