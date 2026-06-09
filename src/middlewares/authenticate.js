//Checks if user is login or not
//And then service and controller can find out who the current user is

import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/token.js';
import { findUserById } from '../modules/users/user.repository.js';

export const authenticate = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new ApiError(401, 'Access token is required', 'ACCESS_TOKEN_REQUIRED');
    }

    const token = authorization.split(' ')[1];
    const payload = await verifyAccessToken(token);

    const user = await findUserById(payload.sub);

    if (!user || !user.is_active) {
      throw new ApiError(401, 'User not available', 'USER_NOT_AVAILABLE');
    }

    req.user = {
      userId: user.user_id,
      role: user.role,
      disId: user.dis_id || null,
      supId: user.sup_id || null,
      volId: user.vol_id || null,
      verificationStatus: user.verification_status || null
    };

    next();
  } catch (error) {
    next(new ApiError(401, 'Invalid access token', 'INVALID_ACCESS_TOKEN'));
  }
};
