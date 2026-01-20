import { pool } from "../../config/db";
import bcrypt from "bcryptjs";

const createUser = async (payload: Record<string, unknown>) => {
  const { name, role = "customer", email, password, phone } = payload;

  if (!name || !email || !password || !phone) {
    throw new Error("Missing required fields: name, email, password, phone");
  }

  if ((password as string).length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  const hashedPass = await bcrypt.hash(password as string, 10);
  const normalizedEmail = (email as string).toLowerCase();

  const result = await pool.query(
    `INSERT INTO users(name, email, password, phone, role) VALUES($1, $2, $3, $4, $5) RETURNING *`,
    [name, normalizedEmail, hashedPass, phone, role]
  );

  return result;
};

const getUser = async () => {
  const result = await pool.query(`SELECT * FROM users`);
  return result;
};

const getSingleuser = async (id: string) => {
  const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);

  return result;
};

const updateUser = async (payload: Record<string, any>, id: string) => {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;
  for (const key of ["name", "email", "phone", "role"]) {
    if (payload[key] !== undefined) {
      if (key === "email") values.push((payload[key] as string).toLowerCase());
      else values.push(payload[key]);
      fields.push(`${key}=$${idx}`);
      idx++;
    }
  }
  if (fields.length === 0) {
    throw new Error("No fields to update");
  }
  values.push(id);
  const result = await pool.query(`UPDATE users SET ${fields.join(",")} , updated_at=NOW() WHERE id=$${idx} RETURNING *`, values);
  return result;
};

const deleteUser = async (id: string) => {
  // ensure no active bookings
  const active = await pool.query(`SELECT * FROM bookings WHERE customer_id=$1 AND status='active'`, [id]);
  if (active.rows.length > 0) {
    throw new Error("Cannot delete user with active bookings");
  }
  const result = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING *`, [id]);
  return result;
};

export const userServices = {
  createUser,
  getUser,
  getSingleuser,
  updateUser,
  deleteUser,
};
