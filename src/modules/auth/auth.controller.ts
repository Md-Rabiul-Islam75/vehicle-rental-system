import { Request, Response } from "express";
import { authServices } from "./auth.service";
import { userServices } from "../user/user.service";

const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await authServices.loginUser(email, password);
    if (!result) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const { token, user } = result;

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const signupUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const created = await userServices.createUser({ name, email, password, phone, role });
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: created.rows[0].id,
        name: created.rows[0].name,
        email: created.rows[0].email,
        phone: created.rows[0].phone,
        role: created.rows[0].role,
      },
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const authController = {
  loginUser,
  signupUser,
};
