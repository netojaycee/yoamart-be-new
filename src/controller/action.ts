// @ts-nocheck
import { RequestHandler } from "express";
import Action from "#/model/action";
import Batch from "#/model/batch";
import Alert from "#/model/alert";
import mongoose from "mongoose";
import { updateProductQuantityFromBatches } from "#/utils/inventorySync";

export const logAction: RequestHandler = async (req, res) => {
    const { batchId, alertId, actionType, quantityAffected, performedBy, notes } = req.body;

    // Validate required fields
    if (!batchId || !actionType || !performedBy || quantityAffected === undefined) {
        return res.status(400).json({ 
            message: "batchId, actionType, quantityAffected, and performedBy are required!" 
        });
    }

    if (!mongoose.Types.ObjectId.isValid(batchId)) {
        return res.status(400).json({ message: "Invalid batch ID!" });
    }

    if (quantityAffected < 0) {
        return res.status(400).json({ message: "Quantity cannot be negative!" });
    }

    const validActionTypes = [
        "REMOVED_FROM_SHELF",
        "DISPOSED",
        "RETURNED_TO_SUPPLIER",
        "RECOUNTED",
        "OTHER",
    ];
    if (!validActionTypes.includes(actionType)) {
        return res.status(400).json({ message: "Invalid action type!" });
    }

    // Check if batch exists
    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(400).json({ message: "Batch not found!" });

    // Check if quantity affected doesn't exceed available quantity
    if (quantityAffected > batch.quantityAvailable) {
        return res.status(400).json({ 
            message: `Cannot remove ${quantityAffected} units. Only ${batch.quantityAvailable} available!` 
        });
    }

    // If alertId is provided, validate it
    if (alertId && !mongoose.Types.ObjectId.isValid(alertId)) {
        return res.status(400).json({ message: "Invalid alert ID!" });
    }

    const action = new Action({
        batchId,
        alertId: alertId || undefined,
        actionType,
        quantityAffected,
        performedBy,
        notes,
    });

    await action.save();

    // Update batch quantity
    const newQuantityAvailable = batch.quantityAvailable - quantityAffected;
    await Batch.findByIdAndUpdate(
        batchId,
        { quantityAvailable: newQuantityAvailable }
    );

    // If it's a terminal action, update batch status
    const terminalActions = ["DISPOSED", "RETURNED_TO_SUPPLIER", "REMOVED_FROM_SHELF"];
    if (terminalActions.includes(actionType) && newQuantityAvailable === 0) {
        const newStatus = actionType === "DISPOSED" ? "DISPOSED_RETURNED" : "REMOVED";
        await Batch.findByIdAndUpdate(batchId, { status: newStatus });
    }

    // Auto-update product quantity from batches
    await updateProductQuantityFromBatches(batch.productId);

    const populatedAction = await action.populate("batchId").populate("alertId");

    res.json({ 
        message: "Action logged successfully!",
        action: populatedAction,
        batchUpdated: {
            batchId,
            newQuantityAvailable,
        }
    });
};

export const getActions: RequestHandler = async (req, res) => {
    const { batchId, page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
        return res.status(400).json({ message: "Invalid pagination parameters." });
    }

    const query: any = {};

    if (batchId && mongoose.Types.ObjectId.isValid(batchId as string)) {
        query.batchId = new mongoose.Types.ObjectId(batchId as string);
    }

    const skip = (pageNumber - 1) * limitNumber;

    const actions = await Action.find(query)
        .populate("batchId")
        .populate("alertId")
        .sort({ performedAt: -1 })
        .skip(skip)
        .limit(limitNumber);

    const total = await Action.countDocuments(query);

    res.json({ actions, total, page: pageNumber, pages: Math.ceil(total / limitNumber) });
};

export const getActionById: RequestHandler = async (req, res) => {
    const { actionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(actionId)) {
        return res.status(400).json({ message: "Invalid action ID!" });
    }

    const action = await Action.findById(actionId)
        .populate("batchId")
        .populate("alertId");

    if (!action) return res.status(400).json({ message: "Action not found!" });

    res.json({ action });
};

export const getActionsByBatch: RequestHandler = async (req, res) => {
    const { batchId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(batchId)) {
        return res.status(400).json({ message: "Invalid batch ID!" });
    }

    const actions = await Action.find({ batchId })
        .populate("batchId")
        .populate("alertId")
        .sort({ performedAt: -1 });

    res.json({ actions, count: actions.length });
};
