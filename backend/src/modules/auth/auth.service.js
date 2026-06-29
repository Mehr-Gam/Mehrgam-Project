import argon2 from 'argon2';

import { ApiError } from '../../utils/ApiError.js';

import {
  createAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiresAt,
  hashToken
} from '../../utils/token.js';

import {
  createUserWithProfile,
  findRefreshToken,
  findUserById,
  findUserByNationalCode,
  findUserByPhone,
  revokeRefreshToken,
  saveRefreshToken
} from '../users/user.repository.js';

const sanitizeUser = (user) => {
  return {
    userId: user.user_id,
    nationalCode: user.national_code,
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone,
    role: user.role,
    disId: user.dis_id || null,
    supId: user.sup_id || null,
    volId: user.vol_id || null,
    verificationStatus: user.verification_status || null
  };
};

const createAuthSession = async ({ user, userAgent, ipAddress }) => {
  const accessToken = await createAccessToken(user);
  const refreshToken = generateRefreshToken();
  const tokenHash = hashToken(refreshToken);
  const expiresAt = getRefreshTokenExpiresAt();

  await saveRefreshToken({
    userId: user.user_id,
    tokenHash,
    expiresAt,
    userAgent,
    ipAddress
  });

  return {
    accessToken,
    refreshToken,
    user: sanitizeUser(user)
  };
};

export const register = async ({
  nationalCode,
  firstName,
  lastName,
  phone,
  birthDate,
  province,
  city,
  password,
  role,
  homeAddress,
  accessibilityNeed,
  userAgent,
  ipAddress
}) => {
  const existingUserByNationalCode = await findUserByNationalCode(nationalCode);

  if (existingUserByNationalCode) {
    throw new ApiError(
      409,
      'National code already exists',
      'NATIONAL_CODE_ALREADY_EXISTS'
    );
  }

  const existingUserByPhone = await findUserByPhone(phone);

  if (existingUserByPhone) {
    throw new ApiError(
      409,
      'Phone number already exists',
      'PHONE_ALREADY_EXISTS'
    );
  }

  const passwordHash = await argon2.hash(password);

  let user;

  try {
    user = await createUserWithProfile({
      nationalCode,
      firstName,
      lastName,
      phone,
      birthDate,
      province,
      city,
      passwordHash,
      role,
      homeAddress,
      accessibilityNeed
    });
  } catch (error) {
    if (error.code === '23505') {
      throw new ApiError(
        409,
        'National code or phone number already exists',
        'DUPLICATE_USER'
      );
    }

    throw error;
  }

  return createAuthSession({
    user,
    userAgent,
    ipAddress
  });
};

export const login = async ({ nationalCode, password, userAgent, ipAddress }) => {
  const user = await findUserByNationalCode(nationalCode);

  if (!user) {
    throw new ApiError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
  }

  if (!user.is_active) {
    throw new ApiError(403, 'User is inactive', 'USER_INACTIVE');
  }

  const isPasswordValid = await argon2.verify(user.password_hash, password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
  }

  return createAuthSession({
    user,
    userAgent,
    ipAddress
  });
};

export const refresh = async ({ refreshToken, userAgent, ipAddress }) => {
  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token is required', 'REFRESH_TOKEN_REQUIRED');
  }

  const oldTokenHash = hashToken(refreshToken);
  const storedToken = await findRefreshToken(oldTokenHash);

  if (!storedToken) {
    throw new ApiError(401, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN');
  }

  if (storedToken.revoked_at) {
    throw new ApiError(401, 'Refresh token revoked', 'REFRESH_TOKEN_REVOKED');
  }

  if (new Date(storedToken.expires_at) < new Date()) {
    throw new ApiError(401, 'Refresh token expired', 'REFRESH_TOKEN_EXPIRED');
  }

  const user = await findUserById(storedToken.user_id);

  if (!user || !user.is_active) {
    throw new ApiError(401, 'User not available', 'USER_NOT_AVAILABLE');
  }

  await revokeRefreshToken(oldTokenHash);

  const newRefreshToken = generateRefreshToken();
  const newTokenHash = hashToken(newRefreshToken);
  const expiresAt = getRefreshTokenExpiresAt();

  await saveRefreshToken({
    userId: user.user_id,
    tokenHash: newTokenHash,
    expiresAt,
    userAgent,
    ipAddress
  });

  const accessToken = await createAccessToken(user);

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: sanitizeUser(user)
  };
};

export const logout = async (refreshToken) => {
  if (!refreshToken) {
    return;
  }

  const tokenHash = hashToken(refreshToken);
  await revokeRefreshToken(tokenHash);
};

export const getMe = async (userId) => {
  const user = await findUserById(userId);

  if (!user || !user.is_active) {
    throw new ApiError(401, 'User not available', 'USER_NOT_AVAILABLE');
  }

  return sanitizeUser(user);
};