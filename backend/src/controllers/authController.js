import User from "../models/User.js";
import { registerUser, loginUser } from "../services/authServices.js";
import { getMessagesBetween } from "../services/chatService.js";
import generateToken from "../utils/generateToken.js";
import { saveOtp } from "../services/otpServices.js";
import { sendEmail } from "../sendEmail.js";
import { verifyOtpService } from "../services/otpServices.js";
import { generateOtp } from "../services/otpServices.js";
import crypto from "crypto";

// Register new user
export const signup = async (req, res) => {
  try {
    const { user, token } = await registerUser(req.body);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax"
    });

    res.status(201).json({
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      tokens: user.tokens,
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Login user and set token cookie

export const login = async (req, res) => {
  try {
    const { user, token } = await loginUser(req.body);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax"
    });

    res.json({
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      tokens: user.tokens,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Logout user by clearing the token cookie
export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0)
  });

  res.json({ message: "Logged out" });
};

// Get all users (for chat - exclude current user)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("name email")
      .lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get chat history with another user
export const getMessages = async (req, res) => {
  try {
    const otherUserId = req.query.with;
    if (!otherUserId) {
      return res.status(400).json({ message: "Missing 'with' query parameter" });
    }
    const messages = await getMessagesBetween(req.user._id.toString(), otherUserId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const PLANS = {
  basic: { tokens: 10, name: "Basic", amountPaise: 10000 }, // Rs 100
  pro: { tokens: 50, name: "Pro", amountPaise: 29900 },
  platinum: { tokens: 200, name: "Platinum", amountPaise: 79900 },
};

export const purchasePlan = async (req, res) => {
  try {
    const { plan } = req.body;
    const planConfig = PLANS[plan];
    if (!planConfig) {
      return res.status(400).json({ message: "Invalid plan. Use basic, pro, or platinum" });
    }
    if (planConfig.amountPaise > 0) {
      return res.status(400).json({ message: "Use checkout for paid plans" });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { tokens: planConfig.tokens } },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createRazorpayOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    const planConfig = PLANS[plan];
    if (!planConfig || planConfig.amountPaise <= 0) {
      return res.status(400).json({ message: "Invalid paid plan. Use basic, pro, or platinum" });
    }
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      console.error("Razorpay keys missing", { keyId, keySecret });
      return res.status(500).json({ message: "Razorpay not configured" });
    }
    // Debug log
    console.log("Creating Razorpay order", { plan, amount: planConfig.amountPaise });
    const Razorpay = (await import("razorpay")).default;
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    // Shorten receipt to avoid Razorpay 40 char limit
    const shortReceipt = `plan_${plan}_${Date.now()}_${req.user._id.toString().slice(-6)}`;
    const order = await razorpay.orders.create({
      amount: planConfig.amountPaise,
      currency: "INR",
      receipt: shortReceipt,
      notes: { plan },
    });
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      plan,
    });
  } catch (error) {
    console.error("Razorpay order error:", error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
    const planConfig = PLANS[plan];
    if (!planConfig) {
      return res.status(400).json({ message: "Invalid plan" });
    }
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({ message: "Razorpay not configured" });
    }
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac("sha256", keySecret).update(body).digest("hex");
    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { tokens: planConfig.tokens } },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send OTP to email for registration
export const sendOtpController = async (req, res) => {
  try {
    const { email } = req.body;

    const otp =  generateOtp();
    console.log("otp",otp);
    await saveOtp(email, otp);
    console.log()
       await sendEmail(
      email, 
      "Your OTP Code",
      `Your OTP is ${otp}. It expires in 5 minutes.`
    );


    res.json({ message: "OTP sent successfully" });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// Verify OTP and register user
export const verifyOtpController = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    await verifyOtpService(email, otp);

    const { user, token } = await registerUser({
      name,
      email,
      password
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax"
    });

    res.status(201).json(user);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};