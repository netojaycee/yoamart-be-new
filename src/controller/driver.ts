import DriverModel from "#/model/driver";
import { RequestHandler } from "express";

export const create: RequestHandler = async (req, res) => {
    const { name, phone } = req.body;
    const driver = await DriverModel.create({ name, phone });
    res.json({ message: "Record added successfully!", driver });
};

export const getAllDrivers: RequestHandler = async (req, res) => {
    const drivers = await DriverModel.find()
    if (!drivers) return res.status(400).json({ message: "No drivers found" })
    return res.json({ drivers });
}

export const getDriverById: RequestHandler = async (req, res) => {
    const { id } = req.params;
    const driver = await DriverModel.findById(id);
    if (!driver) return res.status(400).json({ message: "No driver found" })
    return res.json({ driver })
}

export const updateDriver: RequestHandler = async (req, res) => {
    const { id } = req.params;
    const { name, phone } = req.body;
    const driver = await DriverModel.findByIdAndUpdate(id, { name, phone })
    if (!driver) return res.status(400).json({ message: "No driver found" })
    return res.json({ message: "Record updated successfully!", driver })
}

export const deleteDriver: RequestHandler = async (req, res) => {
    const { id } = req.params;
    const driver = await DriverModel.findByIdAndDelete(id)
    if (!driver) return res.status(400).json({ message: "No driver found" })
    return res.json({ message: "Record deleted successfully!" })
}