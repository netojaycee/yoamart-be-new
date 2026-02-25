import {
    logAction,
    getActions,
    getActionById,
    getActionsByBatch,
} from "#/controller/action";
import { isAdmin, mustAuth } from "#/middleware/user";
import { Router } from "express";

const router = Router();

router.post("/log", mustAuth, isAdmin, logAction);
router.get("/", mustAuth, isAdmin, getActions);
router.get("/:actionId", mustAuth, isAdmin, getActionById);
router.get("/batch/:batchId", mustAuth, isAdmin, getActionsByBatch);

export default router;
