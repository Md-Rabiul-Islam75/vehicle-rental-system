import { Request, Response } from "express";
import { userServices } from "./user.service";

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await userServices.createUser(req.body);
    // console.log(result.rows[0]);
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        email: result.rows[0].email,
        phone: result.rows[0].phone,
        role: result.rows[0].role,
      },
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getUser = async (req: Request, res: Response) => {
  try {
    const result = await userServices.getUser();

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result.rows,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
      datails: err,
    });
  }
};

const getSingleUser = async (req: Request, res: Response) => {
  // console.log(req.params.id);
  try {
    const result = await userServices.getSingleuser(req.params.id as string);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "User fetched successfully",
        data: result.rows[0],
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const targetId = req.params.id;
    // only admin or owner
    if (user.role !== "admin" && Number(user.id) !== Number(targetId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // customers cannot change their role
    if (user.role !== "admin" && req.body.role && req.body.role !== user.role) {
      return res.status(403).json({ success: false, message: "Cannot change role" });
    }

    const result = await userServices.updateUser(req.body, targetId!);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: "User not found" });
    } else {
      const u = result.rows[0];
      res.status(200).json({ success: true, message: "User updated successfully", data: { id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role } });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const result = await userServices.deleteUser(req.params.id!);

    if (!result || result.rowCount === 0) {
      res.status(404).json({ success: false, message: "User not found" });
    } else {
      res.status(200).json({ success: true, message: "User deleted successfully" });
    }
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const userControllers = {
  createUser,
  getUser,
  getSingleUser,
  updateUser,
  deleteUser,
};
