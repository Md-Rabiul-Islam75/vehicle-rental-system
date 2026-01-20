import { Request, Response } from "express";
import { todoServices } from "./todo.service";

const createTodo = async (req: Request, res: Response) => {
  try {
    const result = await todoServices.createTodo(req.body);

    res.status(201).json({
      success: true,
      message: "Todo created",
      data: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getTodos = async (req: Request, res: Response) => {
  try {
    const result = await todoServices.getTodos();

    res.status(200).json({
      success: true,
      message: "todos retrieved successfully",
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

const getSingleTodo = async (req: Request, res: Response) => {
  try {
    const result = await todoServices.getSingleTodo(req.params.id!);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Todo not found" });
    }

    res.status(200).json({ success: true, message: "Todo retrieved", data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateTodo = async (req: Request, res: Response) => {
  try {
    const result = await todoServices.updateTodo(req.body, req.params.id!);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Todo not found" });
    }

    res.status(200).json({ success: true, message: "Todo updated", data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteTodo = async (req: Request, res: Response) => {
  try {
    const result = await todoServices.deleteTodo(req.params.id!);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Todo not found" });
    }

    res.status(200).json({ success: true, message: "Todo deleted" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const todoControllers = {
  createTodo,
  getTodos,
  getSingleTodo,
  updateTodo,
  deleteTodo,
};
