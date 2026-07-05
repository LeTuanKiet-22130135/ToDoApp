"use server";

import { redis } from './redis';
import { sendOtpEmail } from './resend';
import { prisma } from './prisma';
import { createSession, clearSession } from './session';
import { revalidatePath } from 'next/cache';

const OTP_TTL = 300; // 5 minutes

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function login(email: string, passwordHash: string) {
  if (!email || !passwordHash) throw new Error("Email and password are required");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== passwordHash) {
    throw new Error("Invalid credentials");
  }

  await createSession(user.id);
  revalidatePath('/');
  return { success: true, user };
}

export async function logout() {
  await clearSession();
  revalidatePath('/');
}

export async function requestSignupOtp(name: string, email: string, passwordHash: string) {
  if (!name || !email || !passwordHash) {
    throw new Error("Missing required fields");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const otp = generateOtp();
  
  const cacheKey = `signup:${email}`;
  const payload = JSON.stringify({ name, passwordHash, otp });
  await redis.setex(cacheKey, OTP_TTL, payload);

  await sendOtpEmail(email, otp);
  
  return { success: true, message: "OTP sent successfully" };
}

export async function verifySignupOtp(email: string, otpCode: string) {
  const cacheKey = `signup:${email}`;
  const cachedData = await redis.get(cacheKey);

  if (!cachedData) {
    throw new Error("OTP expired or invalid");
  }

  const { name, passwordHash, otp } = JSON.parse(cachedData);

  if (otp !== otpCode) {
    throw new Error("Incorrect OTP");
  }

  const user = await prisma.user.create({
    data: { name, email, password: passwordHash }
  });

  await redis.del(cacheKey);
  
  // Set session on success
  await createSession(user.id);
  revalidatePath('/');

  return { success: true, user };
}

export async function requestPasswordResetOtp(email: string) {
  if (!email) throw new Error("Email is required");

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (!existingUser) {
    throw new Error("User not found");
  }

  const otp = generateOtp();
  const cacheKey = `reset:${email}`;
  
  await redis.setex(cacheKey, OTP_TTL, otp);
  await sendOtpEmail(email, otp);

  return { success: true, message: "OTP sent successfully" };
}

export async function resetPasswordWithOtp(email: string, otpCode: string, newPasswordHash: string) {
  const cacheKey = `reset:${email}`;
  const cachedOtp = await redis.get(cacheKey);

  if (!cachedOtp) {
    throw new Error("OTP expired or invalid");
  }

  if (cachedOtp !== otpCode) {
    throw new Error("Incorrect OTP");
  }

  const user = await prisma.user.update({
    where: { email },
    data: { password: newPasswordHash }
  });

  await redis.del(cacheKey);
  
  // Optionally sign them in immediately
  await createSession(user.id);
  revalidatePath('/');

  return { success: true, message: "Password updated successfully" };
}
