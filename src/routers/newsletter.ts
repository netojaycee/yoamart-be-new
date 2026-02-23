

import { createNewsletter } from "#/controller/newsletter";
import { Router } from "express";

const router = Router();

router.post('/create-newsletter', createNewsletter);


export default router; 