import { Router } from 'express';
import { registerUser } from '../controller/user.controller.js';

const router = Router();

router.route("/register").post(registerUser);  // Corrected method name from .rout() to .route()

export default router;
