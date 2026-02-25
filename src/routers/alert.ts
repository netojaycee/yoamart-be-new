import {
    getAlerts,
    getOpenAlerts,
    getAlertById,
    acknowledgeAlert,
    getAlertsByBatch,
} from "#/controller/alert";
import { isAdmin, mustAuth } from "#/middleware/user";
import { Router } from "express";

const router = Router();

router.get("/", mustAuth, isAdmin, getAlerts);
router.get("/open", mustAuth, isAdmin, getOpenAlerts);
router.get("/:alertId", mustAuth, isAdmin, getAlertById);
router.patch("/:alertId/acknowledge", mustAuth, isAdmin, acknowledgeAlert);
router.get("/batch/:batchId", mustAuth, isAdmin, getAlertsByBatch);

export default router;
