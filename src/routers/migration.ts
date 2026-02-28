import { Router } from "express";
import { isAdmin, mustAuth } from "#/middleware/user";
import { migrateProductTypes } from "#/controller/migration";

const router = Router();

/**
 * POST /api/migration/migrate-types
 * Migrate all products without a 'type' field to type: "regular"
 * Admin only
 */
router.post("/migrate-types", mustAuth, isAdmin, migrateProductTypes);

export default router;
