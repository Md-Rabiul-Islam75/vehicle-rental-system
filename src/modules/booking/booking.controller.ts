import { Request, Response } from "express";
import { bookingService } from "./booking.service";

const createBooking = async (req: Request, res: Response) => {
  try {
    const result = await bookingService.createBooking(req.body);
    res.status(201).json({ success: true, message: "Booking created successfully", data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getBookings = async (req: Request, res: Response) => {
  try {
    // req.user contains id and role
    const user = req.user as any;
    const result = await bookingService.getBookings(user);
    const message = user.role === "admin" ? "Bookings retrieved successfully" : "Your bookings retrieved successfully";
    res.status(200).json({ success: true, message, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateBooking = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const bookingId = req.params.bookingId;
    const { status } = req.body;
    const result = await bookingService.updateBooking(bookingId, status, user);
    res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const bookingController = {
  createBooking,
  getBookings,
  updateBooking,
};
