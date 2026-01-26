import client from "../config/twilio.config.js";

const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

const isPhone = (value) => /^\+\d{10,15}$/.test(value);
const isEmail = (value) => /\S+@\S+\.\S+/.test(value);

export const sendOtp = async (destination) => {
  let channel;

  if (isPhone(destination)) {
    channel = "sms";
  } else if (isEmail(destination)) {
    channel = "email";
  } else {
    throw new Error("Invalid destination");
  }

  await client.verify.v2.services(serviceSid).verifications.create({
    to: destination,
    channel,
  });
};

export const verifyOtp = async (destination, code) => {
  const check = await client.verify.v2
    .services(serviceSid)
    .verificationChecks.create({
      to: destination,
      code,
    });

  if (check.status !== "approved") {
    throw new Error("Invalid OTP");
  }

  return true;
};
