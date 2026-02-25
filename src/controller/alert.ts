// @ts-nocheck
import { RequestHandler } from "express";
import Alert from "#/model/alert";
import Batch from "#/model/batch";
import mongoose from "mongoose";

export const getAlerts: RequestHandler = async (req, res) => {
    const { acknowledged = false, page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
        return res.status(400).json({ message: "Invalid pagination parameters." });
    }

    const query: any = {};

    // Filter by acknowledged status
    if (acknowledged === "true" || acknowledged === true) {
        query.acknowledged = true;
    } else if (acknowledged === "false" || acknowledged === false) {
        query.acknowledged = false;
    }

    const skip = (pageNumber - 1) * limitNumber;

    const alerts = await Alert.find(query)
        .populate({
            path: "batchId",
            populate: { path: "productId" },
        })
        .populate("ruleId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber);

    const total = await Alert.countDocuments(query);

    res.json({ alerts, total, page: pageNumber, pages: Math.ceil(total / limitNumber) });
};

export const getOpenAlerts: RequestHandler = async (req, res) => {
    const alerts = await Alert.find({ acknowledged: false })
        .populate({
            path: "batchId",
            populate: { path: "productId" },
        })
        .populate("ruleId")
        .sort({ alertDate: -1 });

    res.json({ alerts, count: alerts.length });
};

export const getAlertById: RequestHandler = async (req, res) => {
    const { alertId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(alertId)) {
        return res.status(400).json({ message: "Invalid alert ID!" });
    }

    const alert = await Alert.findById(alertId)
        .populate({
            path: "batchId",
            populate: { path: "productId" },
        })
        .populate("ruleId");

    if (!alert) return res.status(400).json({ message: "Alert not found!" });

    res.json({ alert });
};

export const acknowledgeAlert: RequestHandler = async (req, res) => {
    const { alertId } = req.params;
    const { acknowledgedBy } = req.body;

    if (!mongoose.Types.ObjectId.isValid(alertId)) {
        return res.status(400).json({ message: "Invalid alert ID!" });
    }

    if (!acknowledgedBy) {
        return res.status(400).json({ message: "Staff name (acknowledgedBy) is required!" });
    }

    const alert = await Alert.findByIdAndUpdate(
        alertId,
        {
            acknowledged: true,
            acknowledgedAt: new Date(),
            acknowledgedBy,
        },
        { new: true }
    )
        .populate({
            path: "batchId",
            populate: { path: "productId" },
        })
        .populate("ruleId");

    if (!alert) return res.status(400).json({ message: "Alert not found!" });

    res.json({ message: "Alert acknowledged successfully!", alert });
};

export const getAlertsByBatch: RequestHandler = async (req, res) => {
    const { batchId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(batchId)) {
        return res.status(400).json({ message: "Invalid batch ID!" });
    }

    const alerts = await Alert.find({ batchId })
        .populate({
            path: "batchId",
            populate: { path: "productId" },
        })
        .populate("ruleId")
        .sort({ createdAt: -1 });

    res.json({ alerts, count: alerts.length });
};
