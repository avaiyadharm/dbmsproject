import express from 'express'
import { supabase } from '../supabaseClient.js'

const router = express.Router()

// CREATE payment
router.post('/', async (req, res) => {
  const { booking_id, customer_id, amount, payment_date, mode } = req.body
  const { data, error } = await supabase
    .from('Payment')
    .insert([{ booking_id, customer_id, amount, payment_date, mode }])
    .select()
  if (error) return res.status(400).json({ error: error.message })
  res.json(data[0])
})

// READ all payments
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('Payment').select('*')
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

export default router
