import { Router } from 'express';
import { logoutUser, loginUser, registerUser, refreshAccessToken } from '../controller/user.controller.js';
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1
    },
    {
      name: "coverImage",
      maxCount: 1
    }   
  ]),  
  registerUser
);
router.route("/login").post(loginUser); // No verifyJWT here
router.route("/logout").post(verifyJWT, logoutUser); // Requires authentication
router.route("/refreshToken").post(refreshAccessToken);



/*For protected routes where only authenticated users should access (e.g., profile updates, fetching user data).
For logout, to ensure only logged-in users can clear tokens.*/



export default router;
