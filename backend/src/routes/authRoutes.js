import express from "express";
import { signup, login, logout, sendOtpController, verifyOtpController, getUsers, getMessages, purchasePlan, createRazorpayOrder, verifyRazorpayPayment } from "../controllers/authController.js";
import protect, { optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", optionalAuth, (req, res) => {
  res.json(req.user || null);
});
router.get("/users", protect, getUsers);
router.get("/messages", protect, getMessages);
router.post("/purchase-plan", protect, purchasePlan);
router.post("/create-razorpay-order", protect, createRazorpayOrder);
router.post("/verify-razorpay-payment", protect, verifyRazorpayPayment);
router.post("/logout", logout);
router.post("/send-otp", sendOtpController);
router.post("/verify-otp", verifyOtpController);

export default router;