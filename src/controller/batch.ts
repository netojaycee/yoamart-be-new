// @ts-nocheck
import { RequestHandler } from "express";
import Batch from "#/model/batch";
import Product from "#/model/product";
import Alert from "#/model/alert";
import Action from "#/model/action";
import mongoose from "mongoose";
import { updateProductQuantityFromBatches } from "#/utils/inventorySync";

export const createBatch: RequestHandler = async (req, res) => {
    const { productId, expiryDate, productionDate, quantityTotal } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) return res.status(400).json({ message: "Product not found!" });

    // Validate dates
    const expiry = new Date(expiryDate);
    if (isNaN(expiry.getTime())) return res.status(400).json({ message: "Invalid expiry date!" });

    const batch = new Batch({
        productId,
        expiryDate: expiry,
        productionDate: productionDate ? new Date(productionDate) : undefined,
        quantityTotal,
        quantityAvailable: quantityTotal,
        status: "ACTIVE",
    });

    await batch.save();
    const populatedBatch = await batch.populate("productId");
    
    // Auto-update product quantity from batches
    await updateProductQuantityFromBatches(productId);
    
    res.json({ batch: populatedBatch });
};

export const getBatches: RequestHandler = async (req, res) => {
    const { status, productId, page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
        return res.status(400).json({ message: "Invalid pagination parameters." });
    }

    const query: any = {};

    if (status) {
        query.status = status;
    }

    if (productId && mongoose.Types.ObjectId.isValid(productId as string)) {
        query.productId = new mongoose.Types.ObjectId(productId as string);
    }

    const skip = (pageNumber - 1) * limitNumber;

    const batches = await Batch.find(query)
        .populate("productId")
        .sort({ expiryDate: 1 })
        .skip(skip)
        .limit(limitNumber);

    const total = await Batch.countDocuments(query);

    res.json({ batches, total, page: pageNumber, pages: Math.ceil(total / limitNumber) });
};

export const getBatchById: RequestHandler = async (req, res) => {
    const { batchId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(batchId)) {
        return res.status(400).json({ message: "Invalid batch ID!" });
    }

    const batch = await Batch.findById(batchId).populate("productId");
    if (!batch) return res.status(400).json({ message: "Batch not found!" });

    res.json({ batch });
};

export const updateBatchQuantity: RequestHandler = async (req, res) => {
    const { batchId } = req.params;
    const { quantityAvailable } = req.body;

    if (!mongoose.Types.ObjectId.isValid(batchId)) {
        return res.status(400).json({ message: "Invalid batch ID!" });
    }

    if (quantityAvailable < 0) {
        return res.status(400).json({ message: "Quantity cannot be negative!" });
    }

    const batch = await Batch.findByIdAndUpdate(
        batchId,
        { quantityAvailable },
        { new: true }

    ).populate("productId");

    if (!batch) return res.status(400).json({ message: "Batch not found!" });

        // Auto-update product quantity from batches
    await updateProductQuantityFromBatches(batch.productId);

    res.json({ batch });
};

export const getBatchesByStatus: RequestHandler = async (req, res) => {
    const { status } = req.params;

    const validStatuses = ["ACTIVE", "NEAR_EXPIRY", "EXPIRED", "REMOVED", "DISPOSED_RETURNED"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status!" });
    }

    const batches = await Batch.find({ status })
        .populate("productId")
        .sort({ expiryDate: 1 });

    res.json({ batches, count: batches.length });
};
