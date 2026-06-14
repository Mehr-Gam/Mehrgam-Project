import argon2 from 'argon2';

import { ApiError } from '../../utils/ApiError.js';

import {
  createAdminUser,
  findUserBasicById,
  findUserByNationalCodeOrPhone,
  findUserDetailsById,
  findUsers,
  findVolunteerDetailsById,
  findVolunteers,
  revokeAllRefreshTokensForUser,
  setUserActiveStatus,
  updateVolunteerVerificationStatus
} from './admin.repository.js';

const toNumberOrNull = (value) => {
  return value === null || value === undefined ? null : Number(value);
};

const trimOrNull = (value) => {
  return typeof value === 'string' ? value.trim() : value || null;
};

const formatUser = (user) => {
  return {
    userId: user.user_id,
    nationalCode: trimOrNull(user.national_code),
    firstName: user.first_name,
    lastName: user.last_name,
    phone: trimOrNull(user.phone),
    birthDate: user.birth_date || null,
    province: user.province || null,
    city: user.city || null,
    role: user.role,
    isActive: user.is_active,
    createdAt: user.created_at,
    updatedAt: user.updated_at || null,
    disabledProfile: user.dis_id
      ? {
          disId: user.dis_id,
          supId: user.disabled_sup_id || null,
          accessibilityNeed: user.accessibility_need || null,
          homeAddress: user.disabled_home_address || null
        }
      : null,
    supervisorProfile: user.sup_id
      ? {
          supId: user.sup_id
        }
      : null,
    volunteerProfile: user.vol_id
      ? {
          volId: user.vol_id,
          homeAddress: user.volunteer_home_address || null,
          currentLat: toNumberOrNull(user.current_lat),
          currentLng: toNumberOrNull(user.current_lng),
          locationUpdatedAt: user.location_updated_at || null,
          isOnline: user.is_online,
          verificationStatus: user.verification_status,
          verifiedAt: user.verified_at || null
        }
      : null
  };
};

const formatAdminUser = (user) => {
  return {
    userId: user.user_id,
    nationalCode: trimOrNull(user.national_code),
    firstName: user.first_name,
    lastName: user.last_name,
    phone: trimOrNull(user.phone),
    birthDate: user.birth_date || null,
    province: user.province || null,
    city: user.city || null,
    role: user.role,
    isActive: user.is_active,
    createdAt: user.created_at,
    updatedAt: user.updated_at || null
  };
};

const formatVolunteer = (volunteer) => {
  return {
    volId: volunteer.vol_id,
    userId: volunteer.user_id,
    user: {
      nationalCode: trimOrNull(volunteer.national_code),
      firstName: volunteer.first_name,
      lastName: volunteer.last_name,
      phone: trimOrNull(volunteer.phone),
      birthDate: volunteer.birth_date || null,
      province: volunteer.province || null,
      city: volunteer.city || null,
      isActive: volunteer.is_active,
      createdAt: volunteer.user_created_at || null
    },
    homeAddress: volunteer.home_address,
    currentLat: toNumberOrNull(volunteer.current_lat),
    currentLng: toNumberOrNull(volunteer.current_lng),
    locationUpdatedAt: volunteer.location_updated_at || null,
    isOnline: volunteer.is_online,
    verificationStatus: volunteer.verification_status,
    verifiedAt: volunteer.verified_at || null,
    createdAt: volunteer.volunteer_created_at || volunteer.created_at
  };
};

export const listUsers = async ({ query }) => {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const offset = (page - 1) * limit;

  const result = await findUsers({
    role: query.role,
    isActive: query.isActive,
    search: query.search,
    limit,
    offset
  });

  return {
    users: result.users.map(formatUser),
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit)
    }
  };
};

export const getUserDetails = async (userId) => {
  const user = await findUserDetailsById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  }

  return formatUser(user);
};

export const deactivateUser = async ({ adminUser, userId }) => {
  if (adminUser.userId === userId) {
    throw new ApiError(400, 'Admin cannot deactivate own account', 'CANNOT_DEACTIVATE_SELF');
  }

  const targetUser = await findUserBasicById(userId);

  if (!targetUser) {
    throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  }

  if (targetUser.role === 'admin') {
    throw new ApiError(403, 'Admin users cannot be deactivated in MVP', 'ADMIN_DEACTIVATE_NOT_ALLOWED');
  }

  const updatedUser = await setUserActiveStatus({
    userId,
    isActive: false
  });

  await revokeAllRefreshTokensForUser(userId);

  return formatAdminUser(updatedUser);
};

export const activateUser = async (userId) => {
  const targetUser = await findUserBasicById(userId);

  if (!targetUser) {
    throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
  }

  const updatedUser = await setUserActiveStatus({
    userId,
    isActive: true
  });

  return formatAdminUser(updatedUser);
};

export const createAdmin = async (data) => {
  const existingUser = await findUserByNationalCodeOrPhone({
    nationalCode: data.nationalCode,
    phone: data.phone
  });

  if (existingUser) {
    if (trimOrNull(existingUser.national_code) === data.nationalCode) {
      throw new ApiError(
        409,
        'National code already exists',
        'NATIONAL_CODE_ALREADY_EXISTS'
      );
    }

    throw new ApiError(409, 'Phone number already exists', 'PHONE_ALREADY_EXISTS');
  }

  const passwordHash = await argon2.hash(data.password);

  let admin;

  try {
    admin = await createAdminUser({
      nationalCode: data.nationalCode,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      birthDate: data.birthDate,
      province: data.province,
      city: data.city,
      passwordHash
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

  return formatAdminUser(admin);
};

export const listVolunteers = async ({ query }) => {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const offset = (page - 1) * limit;

  const result = await findVolunteers({
    status: query.status,
    search: query.search,
    limit,
    offset
  });

  return {
    volunteers: result.volunteers.map(formatVolunteer),
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit)
    }
  };
};

export const listPendingVolunteers = async ({ query }) => {
  return listVolunteers({
    query: {
      ...query,
      status: 'pending'
    }
  });
};

export const getVolunteerDetails = async (volId) => {
  const volunteer = await findVolunteerDetailsById(volId);

  if (!volunteer) {
    throw new ApiError(404, 'Volunteer not found', 'VOLUNTEER_NOT_FOUND');
  }

  return formatVolunteer(volunteer);
};

export const approveVolunteer = async (volId) => {
  const existingVolunteer = await findVolunteerDetailsById(volId);

  if (!existingVolunteer) {
    throw new ApiError(404, 'Volunteer not found', 'VOLUNTEER_NOT_FOUND');
  }

  const volunteer = await updateVolunteerVerificationStatus({
    volId,
    status: 'approved'
  });

  return formatVolunteer({
    ...existingVolunteer,
    ...volunteer
  });
};

export const rejectVolunteer = async (volId) => {
  const existingVolunteer = await findVolunteerDetailsById(volId);

  if (!existingVolunteer) {
    throw new ApiError(404, 'Volunteer not found', 'VOLUNTEER_NOT_FOUND');
  }

  const volunteer = await updateVolunteerVerificationStatus({
    volId,
    status: 'rejected'
  });

  return formatVolunteer({
    ...existingVolunteer,
    ...volunteer
  });
};
