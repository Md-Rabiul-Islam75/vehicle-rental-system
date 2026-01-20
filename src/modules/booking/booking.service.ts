import { pool } from "../../config/db";

const createBooking = async (payload: Record<string, any>) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

  if (!customer_id || !vehicle_id || !rent_start_date || !rent_end_date) {
    throw new Error("Missing booking fields");
  }

  const start = new Date(rent_start_date);
  const end = new Date(rent_end_date);
  if (end <= start) {
    throw new Error("rent_end_date must be after rent_start_date");
  }

  // check vehicle availability
  const vehicleRes = await pool.query(`SELECT * FROM vehicles WHERE id=$1`, [vehicle_id]);
  if (vehicleRes.rows.length === 0) throw new Error("Vehicle not found");
  const vehicle = vehicleRes.rows[0];
  if (vehicle.availability_status !== "available") {
    throw new Error("Vehicle is not available");
  }

  // calculate days (inclusive)
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const total_price = Number(vehicle.daily_rent_price) * diffDays;

  // create booking
  const insert = await pool.query(
    `INSERT INTO bookings(customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) VALUES($1,$2,$3,$4,$5,'active') RETURNING *`,
    [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]
  );

  // mark vehicle as booked
  await pool.query(`UPDATE vehicles SET availability_status='booked' WHERE id=$1`, [vehicle_id]);

  const booking = insert.rows[0];

  return {
    id: booking.id,
    customer_id: booking.customer_id,
    vehicle_id: booking.vehicle_id,
    rent_start_date: booking.rent_start_date,
    rent_end_date: booking.rent_end_date,
    total_price: booking.total_price,
    status: booking.status,
    vehicle: { vehicle_name: vehicle.vehicle_name, daily_rent_price: vehicle.daily_rent_price },
  };
};

const getBookings = async (user: any) => {
  if (user.role === "admin") {
    const result = await pool.query(
      `SELECT b.*, u.name as customer_name, u.email as customer_email, v.vehicle_name, v.registration_number FROM bookings b JOIN users u ON b.customer_id=u.id JOIN vehicles v ON b.vehicle_id=v.id ORDER BY b.id`
    );
    return result.rows.map((r) => ({
      id: r.id,
      customer_id: r.customer_id,
      vehicle_id: r.vehicle_id,
      rent_start_date: r.rent_start_date,
      rent_end_date: r.rent_end_date,
      total_price: r.total_price,
      status: r.status,
      customer: { name: r.customer_name, email: r.customer_email },
      vehicle: { vehicle_name: r.vehicle_name, registration_number: r.registration_number },
    }));
  } else {
    const result = await pool.query(
      `SELECT b.*, v.vehicle_name, v.registration_number, v.type FROM bookings b JOIN vehicles v ON b.vehicle_id=v.id WHERE b.customer_id=$1 ORDER BY b.id`,
      [user.id]
    );

    return result.rows.map((r) => ({
      id: r.id,
      vehicle_id: r.vehicle_id,
      rent_start_date: r.rent_start_date,
      rent_end_date: r.rent_end_date,
      total_price: r.total_price,
      status: r.status,
      vehicle: { vehicle_name: r.vehicle_name, registration_number: r.registration_number, type: r.type },
    }));
  }
};

const updateBooking = async (bookingId: string, status: string, user: any) => {
  const bRes = await pool.query(`SELECT * FROM bookings WHERE id=$1`, [bookingId]);
  if (bRes.rows.length === 0) throw new Error("Booking not found");
  const booking = bRes.rows[0];

  if (status === "cancelled") {
    // only customer can cancel own booking and only before start date
    if (user.role !== "admin" && user.id !== booking.customer_id) {
      throw new Error("Forbidden");
    }
    const now = new Date();
    const start = new Date(booking.rent_start_date);
    if (now >= start && user.role !== "admin") {
      throw new Error("Cannot cancel booking on or after start date");
    }
    const result = await pool.query(`UPDATE bookings SET status='cancelled', updated_at=NOW() WHERE id=$1 RETURNING *`, [bookingId]);
    // free vehicle
    await pool.query(`UPDATE vehicles SET availability_status='available' WHERE id=$1`, [booking.vehicle_id]);
    return { message: "Booking cancelled successfully", data: result.rows[0] };
  }

  if (status === "returned") {
    // only admin can mark returned
    if (user.role !== "admin") throw new Error("Forbidden");
    const result = await pool.query(`UPDATE bookings SET status='returned', updated_at=NOW() WHERE id=$1 RETURNING *`, [bookingId]);
    await pool.query(`UPDATE vehicles SET availability_status='available' WHERE id=$1`, [booking.vehicle_id]);
    return { message: "Booking marked as returned. Vehicle is now available", data: result.rows[0] };
  }

  throw new Error("Invalid status update");
};

export const bookingService = {
  createBooking,
  getBookings,
  updateBooking,
};
