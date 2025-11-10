import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// Basic test route
router.get("/test", (req, res) => {
  res.json({ message: "Car routes working" });
});

// GET all cars
router.get("/", async (req, res) => {
  console.log("GET /api/cars route hit");
  try {
    const { data, error } = await supabase.from('car').select('*');
    if (error) throw error;

    console.log("Cars fetched:", data?.length || 0);
    res.json(data || []);
  } catch (error) {
    console.error("Error in /api/cars:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST add a new car
router.post("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('car')
      .insert([req.body])
      .select();

    if (error) throw error;
    console.log("✅ Car added:", data[0]);
    res.status(201).json(data[0]);
  } catch (error) {
    console.error("Error adding car:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update a car
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('car')
      .update(req.body)
      .eq("car_id", id)
      .select();

    if (error) throw error;
    console.log("✅ Car updated:", data[0]);
    res.json(data[0]);
  } catch (error) {
    console.error("Error updating car:", error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH update car status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await supabase
      .from('car')
      .update({ status })
      .eq("car_id", req.params.id)
      .select();

    if (error) throw error;
    console.log("✅ Car status updated:", data[0]);
    res.json(data[0]);
  } catch (error) {
    console.error("Error patching car:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE a car
router.delete("/:id", async (req, res) => {
  try {
    const { error } = await supabase.from('car').delete().eq("car_id", req.params.id);
    if (error) throw error;
    console.log("🗑️ Car deleted:", req.params.id);
    res.status(200).json({ message: "Car deleted successfully" });
  } catch (error) {
    console.error("Error deleting car:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET single car by id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("car")
      .select("*")
      .eq("car_id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Car not found" });
    res.json(data);
  } catch (error) {
    console.error("Error fetching car:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET car status
router.get("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("car")
      .select("status")
      .eq("car_id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Car not found" });
    res.json({ car_id: Number(id), status: data.status });
  } catch (error) {
    console.error("Error fetching car status:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
