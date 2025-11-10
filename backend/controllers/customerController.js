import { supabase } from "../supabaseClient.js";

export const getAllCustomers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customer')
      .select('*');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customer')
      .insert([req.body])
      .select();
    
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
