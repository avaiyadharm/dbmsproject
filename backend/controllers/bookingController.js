import { supabase } from "../supabaseClient.js";

/**
 * GET /api/bookings
 * Returns bookings with customer and cars relations
 */
export const getBookings = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("booking")
      .select(`
        *,
        customer:customer(*),
        booking_car:booking_car(
          car:car(*)
        )
      `)
      .order("booking_id", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ error: err.message || "Failed to fetch bookings" });
  }
};

/**
 * POST /api/bookings
 * Body: { customer_id, car_ids: [1,2], start_date, end_date, total_amount }
 * Accepts car_ids as array or car_id as single id.
 */
export const createBooking = async (req, res) => {
  const { customer_id = null, car_ids, car_id, start_date, end_date, total_amount = 0 } = req.body;
  const cars = Array.isArray(car_ids) ? car_ids : (car_id ? [car_id] : []);

  if (cars.length === 0 || !start_date || !end_date) {
    return res.status(400).json({ error: "Missing required fields: car_ids/car_id, start_date, end_date" });
  }

  let bookingId = null;
  try {
    // 1) insert booking
    const { data: bookingData, error: bookingError } = await supabase
      .from("booking")
      .insert([{ customer_id, start_date, end_date, total_amount }])
      .select();

    if (bookingError) throw bookingError;
    bookingId = bookingData[0].booking_id;

    // 2) insert booking_car entries
    const bookingCarRows = cars.map((c) => ({ booking_id: bookingId, car_id: c }));
    const { error: bcError } = await supabase.from("booking_car").insert(bookingCarRows);
    if (bcError) throw bcError;

    // 3) update car statuses to Booked
    const { error: updateError } = await supabase
      .from("car")
      .update({ status: "Booked" })
      .in("car_id", cars);
    if (updateError) throw updateError;

    // 4) return created booking with relations
    const { data: created, error: fetchError } = await supabase
      .from("booking")
      .select(`
        *,
        customer:customer(*),
        booking_car:booking_car(car:car(*))
      `)
      .eq("booking_id", bookingId)
      .maybeSingle();
    if (fetchError) throw fetchError;

    res.status(201).json(created);
  } catch (err) {
    console.error("Error creating booking:", err);
    // rollback if bookingId was created
    try {
      if (bookingId) {
        await supabase.from("booking_car").delete().eq("booking_id", bookingId);
        await supabase.from("booking").delete().eq("booking_id", bookingId);
      }
    } catch (rbErr) {
      console.error("Rollback error:", rbErr);
    }
    res.status(500).json({ error: err.message || "Failed to create booking" });
  }
};
