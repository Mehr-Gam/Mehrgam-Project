import crypto from 'crypto';
import { SignJWT, jwtVerify } from 'jose';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }

  return new TextEncoder().encode(secret);
};

//Create token
export const createAccessToken = async (user) => {
  return new SignJWT({
    role: user.role
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(user.user_id))
    .setIssuedAt()
    .setExpirationTime(process.env.ACCESS_TOKEN_EXPIRES_IN || '15m')
    .sign(getJwtSecret());
};

//Verify token
export const verifyAccessToken = async (token) => {
  const { payload } = await jwtVerify(token, getJwtSecret());
  return payload;
};

//Create refresh token
export const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

//Hashes the refresh token
export const hashToken = (token) => {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
};

//Create expire time for refresh token
export const getRefreshTokenExpiresAt = () => {
  const days = Number(process.env.REFRESH_TOKEN_DAYS || 7);
  const expiresAt = new Date();

  expiresAt.setDate(expiresAt.getDate() + days);

  return expiresAt;
};
