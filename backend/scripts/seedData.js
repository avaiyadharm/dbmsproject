import { supabase } from '../supabaseClient.js';

const sampleCars = [
  {"car_id":1,"car_name":"BMW 5 Series","brand":"BMW","model":"530i","category":"Business","rent_per_day":129,"status":"Available"},
  {"car_id":2,"car_name":"Range Rover Sport","brand":"Land Rover","model":"Sport HSE","category":"Luxury","rent_per_day":199,"status":"Available"},
  {"car_id":3,"car_name":"Volkswagen Golf","brand":"Volkswagen","model":"Golf 8","category":"Economy","rent_per_day":59,"status":"Available"}
];

async function seedData() {
  try {
    // If your table uses SERIAL primary key, avoid inserting car_id explicitly.
    // If car_id is auto-generated, map to remove car_id:
    const rowsToInsert = sampleCars.map(({ car_id, ...rest }) => rest);

    const { data, error } = await supabase
      .from('car')
      .insert(rowsToInsert)
      .select();

    if (error) {
      console.error('Error seeding data:', error);
      process.exit(1);
    }

    console.log('✅ Sample cars added successfully:', data);
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error seeding data:', err);
    process.exit(1);
  }
}

seedData();
