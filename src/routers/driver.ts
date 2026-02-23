import { create, deleteDriver, getAllDrivers, getDriverById, updateDriver } from "#/controller/driver";
import { isAdmin, mustAuth } from "#/middleware/user";
import { Router } from "express";

const router = Router()

router.post('/create', mustAuth, isAdmin, create)
router.get('/all-drivers', getAllDrivers)
router.get('/:id', getDriverById)
router.patch('/:id', mustAuth, isAdmin, updateDriver)
router.delete('/:id', mustAuth, isAdmin, deleteDriver)

export default router