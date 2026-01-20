import { Request, Response } from "express";
import { vehicleService } from "./vehicle.service";
// import { vehicleService } from "./vehicle.service";

const createVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleService.createVehicle(req.body);
    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: result.rows[0],
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const result = await vehicleService.getAllVehicles();
    if (result.rows.length === 0) {
      return res.status(200).json({ success: true, message: "No vehicles found", data: [] });
    }
    res.status(200).json({ success: true, message: "Vehicles retrieved successfully", data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getVehicleById = async (req: Request, res: Response) => {
  try {
    const result = await vehicleService.getVehicleById(req.params.vehicleId);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }
    res.status(200).json({ success: true, message: "Vehicle retrieved successfully", data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleService.updateVehicle(req.params.vehicleId as string, req.body);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }
    res.status(200).json({ success: true, message: "Vehicle updated successfully", data: result.rows[0] });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteVehicle = async (req: Request, res: Response) => {
  try {
    await vehicleService.deleteVehicle(req.params.vehicleId);
    res.status(200).json({ success: true, message: "Vehicle deleted successfully" });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const vehicleController = {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};
