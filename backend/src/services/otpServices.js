import Otp from "../models/Otp.js";

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Save OTP to DB with expiration time of 5 minutes
export const saveOtp = async (email, otp) => {

  await Otp.deleteMany({ email });

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 

  const res = await Otp.create({
    email,
    otp,
    expiresAt
  });
  console.log("otp crated",res);
};

// For testing purposes
export const verifyOtpService = async (email, otp) => {

  const record = await Otp.findOne({ email, otp });

  if (!record) {
    throw new Error("Invalid OTP");
  }

  if (record.expiresAt < new Date()) {
    throw new Error("OTP expired");
  }

  await Otp.deleteMany({ email });

  return true;
};