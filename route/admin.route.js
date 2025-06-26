import express from "express";
import { admin } from "../middleware/admin.js";
import auth from "../middleware/auth.js"; // Adjust to your JWT file
import { getAllOrders, getAllUsers, getReferralStatsController } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/referral-stats", auth, admin, getReferralStatsController);
router.get("/users", auth, admin, getAllUsers);
router.get("/orders", auth, admin, getAllOrders);


export default router;
