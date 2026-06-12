/* Reading reqs
   calling service
   sending res */

import * as authService from './auth.service.js';

const getCookieOptions = () => {
  const days = Number(process.env.REFRESH_TOKEN_DAYS || 7);

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: days * 24 * 60 * 60 * 1000
  };
};

export const register = async (req, res) => {
  const result = await authService.register({
    ...req.validated.body,
    userAgent: req.get('user-agent') || null,
    ipAddress: req.ip
  });

  res.cookie('refreshToken', result.refreshToken, getCookieOptions());

  res.status(201).json({
    success: true,
    data: {
      accessToken: result.accessToken,
      user: result.user
    }
  });
};

export const login = async (req, res) => {
  const { nationalCode, password } = req.validated.body;

  const result = await authService.login({
    nationalCode,
    password,
    userAgent: req.get('user-agent') || null,
    ipAddress: req.ip
  });

  res.cookie('refreshToken', result.refreshToken, getCookieOptions());

  res.json({
    success: true,
    data: {
      accessToken: result.accessToken,
      user: result.user
    }
  });
};

export const refresh = async (req, res) => {
  const result = await authService.refresh({
    refreshToken: req.cookies.refreshToken,
    userAgent: req.get('user-agent') || null,
    ipAddress: req.ip
  });

  res.cookie('refreshToken', result.refreshToken, getCookieOptions());

  res.json({
    success: true,
    data: {
      accessToken: result.accessToken,
      user: result.user
    }
  });
};

export const logout = async (req, res) => {
  await authService.logout(req.cookies.refreshToken);

  res.clearCookie('refreshToken', getCookieOptions());

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

export const me = async (req, res) => {
  const user = await authService.getMe(req.user.userId);

  res.json({
    success: true,
    data: {
      user
    }
  });
};