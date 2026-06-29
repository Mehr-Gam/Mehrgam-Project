import { ApiError } from '../../utils/ApiError.js';

import {
  assignDisabledToSupervisor,
  findDisabledById,
  findDisabledByNationalCode,
  findDisabledBySupervisor,
  removeDisabledFromSupervisor
} from './supervisor.repository.js';

const trimOrNull = (value) => {
  return typeof value === 'string' ? value.trim() : value || null;
};

const formatDisabled = (disabled) => {
  return {
    disId: disabled.dis_id,
    userId: disabled.user_id,
    user: {
      nationalCode: trimOrNull(disabled.national_code),
      firstName: disabled.first_name,
      lastName: disabled.last_name,
      phone: trimOrNull(disabled.phone),
      birthDate: disabled.birth_date || null,
      province: disabled.province || null,
      city: disabled.city || null,
      isActive: disabled.is_active,
      createdAt: disabled.user_created_at || null
    },
    supId: disabled.sup_id || null,
    accessibilityNeed: disabled.accessibility_need || null,
    homeAddress: disabled.home_address,
    createdAt: disabled.disabled_created_at || null
  };
};

const ensureSupervisor = (user) => {
  if (!user || user.role !== 'supervisor') {
    throw new ApiError(403, 'Supervisor role required', 'SUPERVISOR_ROLE_REQUIRED');
  }

  if (!user.supId) {
    throw new ApiError(403, 'Supervisor profile not found', 'SUPERVISOR_PROFILE_REQUIRED');
  }
};

export const getMyDisabled = async ({ user, query }) => {
  ensureSupervisor(user);

  const page = query.page || 1;
  const limit = query.limit || 20;
  const offset = (page - 1) * limit;

  const result = await findDisabledBySupervisor({
    supId: user.supId,
    search: query.search,
    limit,
    offset
  });

  return {
    disabled: result.disabled.map(formatDisabled),
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit)
    }
  };
};

export const attachDisabledToMe = async ({ user, nationalCode }) => {
  ensureSupervisor(user);

  const disabled = await findDisabledByNationalCode(nationalCode);

  if (!disabled) {
    throw new ApiError(404, 'Disabled user not found', 'DISABLED_NOT_FOUND');
  }

  if (!disabled.is_active) {
    throw new ApiError(409, 'Disabled user is not active', 'DISABLED_USER_NOT_ACTIVE');
  }

  if (disabled.sup_id === user.supId) {
    throw new ApiError(
      409,
      'Disabled user is already assigned to this supervisor',
      'DISABLED_ALREADY_ASSIGNED_TO_YOU'
    );
  }

  if (disabled.sup_id) {
    throw new ApiError(
      409,
      'Disabled user already has a supervisor',
      'DISABLED_ALREADY_HAS_SUPERVISOR'
    );
  }

  const updatedDisabled = await assignDisabledToSupervisor({
    disId: disabled.dis_id,
    supId: user.supId
  });

  if (!updatedDisabled) {
    throw new ApiError(
      409,
      'Disabled user could not be assigned to this supervisor',
      'DISABLED_ASSIGN_FAILED'
    );
  }

  return formatDisabled(updatedDisabled);
};

export const removeDisabledFromMe = async ({ user, disId }) => {
  ensureSupervisor(user);

  const disabled = await findDisabledById(disId);

  if (!disabled) {
    throw new ApiError(404, 'Disabled user not found', 'DISABLED_NOT_FOUND');
  }

  if (disabled.sup_id !== user.supId) {
    throw new ApiError(
      403,
      'This disabled user does not belong to this supervisor',
      'DISABLED_NOT_ASSIGNED_TO_SUPERVISOR'
    );
  }

  const updatedDisabled = await removeDisabledFromSupervisor({
    disId,
    supId: user.supId
  });

  if (!updatedDisabled) {
    throw new ApiError(
      409,
      'Disabled user could not be removed from this supervisor',
      'DISABLED_REMOVE_FAILED'
    );
  }

  return formatDisabled(updatedDisabled);
};
