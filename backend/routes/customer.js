import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// Create a new customer (Sign Up)
router.post("/register", async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;

    // check if already exists
    const { data: existing, error: findErr } = await supabase
      .from("customer")
      .select("customer_id")
      .eq("email", email)
      .single();

    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const { data, error } = await supabase
      .from("customer")
      .insert([{ name, phone, email, address }])
      .select()
      .single();

    if (error) throw error;

    res.json({ message: "Account created", customer: data });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Login (check existing user)
router.post("/login", async (req, res) => {
  try {
    const { email, phone } = req.body;

    const { data, error } = await supabase
      .from("customer")
      .select("*")
      .eq("email", email)
      .eq("phone", phone)
      .single();

    if (error || !data) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful", customer: data });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
