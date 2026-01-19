import Joi from "joi";

export const registerSchema = Joi.object({
  email: Joi.string().email().optional(),
  phoneNumber: Joi.string().min(8).optional(),
  password: Joi.string().min(8).required(),
}).or("email", "phoneNumber");

export const verifyOtpSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  otp: Joi.string().length(6).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().optional(),
  phoneNumber: Joi.string().min(8).optional(),
  password: Joi.string().required(),
}).or("email", "phoneNumber");
