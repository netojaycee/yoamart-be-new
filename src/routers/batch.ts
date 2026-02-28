import {
    createBatch,
    getBatches,
    getBatchById,
    updateBatchQuantity,
    getBatchesByStatus,
    deleteBatch,
} from "#/controller/batch";
import { isAdmin, mustAuth } from "#/middleware/user";
import { Router } from "express";

const router = Router();

router.post("/create", mustAuth, isAdmin, createBatch);
router.get("/", getBatches);
router.get("/:batchId", getBatchById);
router.patch("/:batchId/quantity", mustAuth, isAdmin, updateBatchQuantity);
router.get("/status/:status", getBatchesByStatus);
router.delete("/:batchId", mustAuth, isAdmin, deleteBatch);

export default router;
