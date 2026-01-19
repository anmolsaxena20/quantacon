import prisma from "../../prisma/client.js";

// ---------- User ----------

export function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export function findUserByPhone(phoneNumber) {
  return prisma.user.findUnique({
    where: { phoneNumber },
  });
}

export function createUser(data) {
  return prisma.user.create({
    data,
  });
}

export function markUserActive(userId, identifierType) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      status: "ACTIVE",
      emailVerified: identifierType === "email",
      phoneVerified: identifierType === "phone",
    },
  });
}

// ---------- OTP ----------

export function createOtp(data) {
  return prisma.oTP.create({
    data,
  });
}

export function getLatestOtp(userId) {
  return prisma.oTP.findFirst({
    where: {
      userId,
      verified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function markOtpVerified(otpId) {
  return prisma.oTP.update({
    where: { id: otpId },
    data: { verified: true },
  });
}

// ---------- Refresh Token ----------

export function storeRefreshToken(data) {
  return prisma.refreshToken.create({
    data,
  });
}
export function findRefreshTokensByUser(userId) {
  return prisma.refreshToken.findMany({
    where: { userId },
  });
}

export function deleteRefreshToken(id) {
  return prisma.refreshToken.delete({
    where: { id },
  });
}
