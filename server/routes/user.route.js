import express from "express";
import {
  getProfile,
  editProfile,
  getSuggestedUser,
  followOrUnfollow,
} from "../controllers/user.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.get("/:id/profile", isAuthenticated, getProfile);
router.post(
  "/profile/edit",
  isAuthenticated,
  upload.single("profilePicture"),
  editProfile
);

router.get("/getSuggestedUser", isAuthenticated, getSuggestedUser);
router.post("/followorUnfollow/:id", isAuthenticated, followOrUnfollow);

export default router;
