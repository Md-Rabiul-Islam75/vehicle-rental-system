import { pool } from "../../config/db";

const createVehicle = async (payload: Record<string, any>) => {
  const { vehicle_name, type, registration_number, daily_rent_price, availability_status = "available" } = payload;

  if (!vehicle_name || !type || !registration_number || !daily_rent_price) {
    throw new Error("Missing required vehicle fields");
  }

  const result = await pool.query(
    `INSERT INTO vehicles(vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES($1,$2,$3,$4,$5) RETURNING *`,
    [vehicle_name, type, registration_number, daily_rent_price, availability_status]
  );

  return result;
};

const getAllVehicles = async () => {
  const result = await pool.query(`SELECT * FROM vehicles ORDER BY id`);
  return result;
};

const getVehicleById = async (id: string) => {
  const result = await pool.query(`SELECT * FROM vehicles WHERE id=$1`, [id]);
  return result;
};

const updateVehicle = async (id: string, payload: Record<string, any>) => {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;
  for (const key of ["vehicle_name", "type", "registration_number", "daily_rent_price", "availability_status"]) {
    if (payload[key] !== undefined) {
      fields.push(`${key}=$${idx}`);
      values.push(payload[key]);
      idx++;
    }
  }
  if (fields.length === 0) {
    throw new Error("No fields to update");
  }
  values.push(id);
  const result = await pool.query(`UPDATE vehicles SET ${fields.join(",")} , updated_at = NOW() WHERE id=$${idx} RETURNING *`, values);
  return result;
};

const deleteVehicle = async (id: string) => {
  // ensure no active bookings
  const active = await pool.query(`SELECT * FROM bookings WHERE vehicle_id=$1 AND status='active'`, [id]);
  if (active.rows.length > 0) {
    throw new Error("Cannot delete vehicle with active bookings");
  }
  await pool.query(`DELETE FROM vehicles WHERE id=$1`, [id]);
};

export const vehicleService = {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};
