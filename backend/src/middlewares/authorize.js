//Checks user's accessibility

import { ApiError } from '../utils/ApiError.js';

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required', 'AUTHENTICATION_REQUIRED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'Access denied', 'ACCESS_DENIED'));
    }

    next();
  };
};

export const requireApprovedVolunteer = (req, res, next) => {
  if (req.user.role !== 'volunteer') {
    return next(new ApiError(403, 'Volunteer role required', 'VOLUNTEER_ROLE_REQUIRED'));
  }

  if (req.user.verificationStatus !== 'approved') {
    return next(new ApiError(403, 'Volunteer is not approved', 'VOLUNTEER_NOT_APPROVED'));
  }

  next();
};
