

import { createContact } from "#/controller/contact";
import { Router } from "express";

const router = Router();

router.post('/create-contact', createContact);


export default router; 