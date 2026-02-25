import {
    createAlertRule,
    getAlertRules,
    getAlertRuleById,
    updateAlertRule,
    deleteAlertRule,
    getDefaultAlertRule,
} from "#/controller/alertRule";
import { isAdmin, mustAuth } from "#/middleware/user";
import { Router } from "express";

const router = Router();

router.post("/create", mustAuth, isAdmin, createAlertRule);
router.get("/", getAlertRules);
router.get("/default", getDefaultAlertRule);
router.get("/:ruleId", getAlertRuleById);
router.patch("/:ruleId", mustAuth, isAdmin, updateAlertRule);
router.delete("/:ruleId", mustAuth, isAdmin, deleteAlertRule);

export default router;
