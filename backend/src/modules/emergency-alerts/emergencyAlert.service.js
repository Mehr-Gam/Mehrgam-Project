import { ApiError } from '../../utils/ApiError.js';

import {
  cancelEmergencyAlert,
  createEmergencyAlert,
  findAlertsByDisabled,
  findAlertsBySupervisor,
  findDisabledById,
  findDisabledBySupervisor,
  resolveEmergencyAlert
} from './emergencyAlert.repository.js';

const toNumberOrNull = (value) => {
  return value === null || value === undefined ? null : Number(value);
};

const formatAlert = (alert) => {
  return {
    alertId: alert.alert_id,
    disId: alert.dis_id,
    supId: alert.sup_id || null,
    requesterUserId: alert.requester_user_id || null,
    alertStatus: alert.alert_status,
    alertLat: toNumberOrNull(alert.alert_lat),
    alertLng: toNumberOrNull(alert.alert_lng),
    address: alert.address || null,
    disabled: alert.disabled_first_name
      ? {
          firstName: alert.disabled_first_name,
          lastName: alert.disabled_last_name
        }
      : null,
    supervisor: alert.supervisor_first_name
      ? {
          firstName: alert.supervisor_first_name,
          lastName: alert.supervisor_last_name
        }
      : null,
    requester: alert.requester_first_name
      ? {
          firstName: alert.requester_first_name,
          lastName: alert.requester_last_name,
          role: alert.requester_role
        }
      : null,
    triggeredAt: alert.triggered_at,
    resolvedAt: alert.resolved_at
  };
};

const ensureEmergencyRequesterRole = (user) => {
  if (!user || !['disabled', 'supervisor'].includes(user.role)) {
    throw new ApiError(
      403,
      'Only disabled users or supervisors can use emergency alerts',
      'EMERGENCY_REQUESTER_ROLE_REQUIRED'
    );
  }
};

const handleStatusChangeResult = ({ result, successType }) => {
  if (result.type === 'not_found') {
    throw new ApiError(404, 'Emergency alert not found', 'EMERGENCY_ALERT_NOT_FOUND');
  }

  if (result.type === 'not_owner') {
    throw new ApiError(
      403,
      'You are not allowed to update this emergency alert',
      'EMERGENCY_ALERT_ACCESS_DENIED'
    );
  }

  if (result.type === 'invalid_status') {
    throw new ApiError(
      409,
      'This emergency alert cannot be updated in its current status',
      'EMERGENCY_ALERT_INVALID_STATUS'
    );
  }

  if (result.type !== successType) {
    throw new ApiError(500, 'Unexpected emergency alert update result', 'UNEXPECTED_RESULT');
  }

  return formatAlert(result.alert);
};

export const createMyEmergencyAlert = async ({ user, data }) => {
  ensureEmergencyRequesterRole(user);

  let disId;
  let supId = null;

  if (user.role === 'disabled') {
    if (!user.disId) {
      throw new ApiError(403, 'Disabled profile not found', 'DISABLED_PROFILE_REQUIRED');
    }

    const disabled = await findDisabledById(user.disId);

    if (!disabled) {
      throw new ApiError(404, 'Disabled profile not found', 'DISABLED_PROFILE_NOT_FOUND');
    }

    disId = user.disId;
    supId = disabled.sup_id || null;
  }

  if (user.role === 'supervisor') {
    if (!user.supId) {
      throw new ApiError(403, 'Supervisor profile not found', 'SUPERVISOR_PROFILE_REQUIRED');
    }

    if (!data.disId) {
      throw new ApiError(400, 'Disabled id is required for supervisor', 'DISABLED_ID_REQUIRED');
    }

    const disabled = await findDisabledBySupervisor({
      disId: data.disId,
      supId: user.supId
    });

    if (!disabled) {
      throw new ApiError(
        403,
        'This disabled user does not belong to this supervisor',
        'DISABLED_NOT_ASSIGNED_TO_SUPERVISOR'
      );
    }

    disId = data.disId;
    supId = user.supId;
  }

  const alert = await createEmergencyAlert({
    disId,
    supId,
    requesterUserId: user.userId,
    alertLat: data.alertLat,
    alertLng: data.alertLng,
    address: data.address
  });

  return formatAlert(alert);
};

export const getMyEmergencyAlerts = async (user) => {
  ensureEmergencyRequesterRole(user);

  if (user.role === 'disabled') {
    if (!user.disId) {
      throw new ApiError(403, 'Disabled profile not found', 'DISABLED_PROFILE_REQUIRED');
    }

    const alerts = await findAlertsByDisabled(user.disId);
    return alerts.map(formatAlert);
  }

  if (!user.supId) {
    throw new ApiError(403, 'Supervisor profile not found', 'SUPERVISOR_PROFILE_REQUIRED');
  }

  const alerts = await findAlertsBySupervisor(user.supId);
  return alerts.map(formatAlert);
};

export const resolveMyEmergencyAlert = async ({ user, alertId }) => {
  ensureEmergencyRequesterRole(user);

  const result = await resolveEmergencyAlert({
    alertId,
    user
  });

  return handleStatusChangeResult({
    result,
    successType: 'resolved'
  });
};

export const cancelMyEmergencyAlert = async ({ user, alertId }) => {
  ensureEmergencyRequesterRole(user);

  const result = await cancelEmergencyAlert({
    alertId,
    user
  });

  return handleStatusChangeResult({
    result,
    successType: 'cancelled'
  });
};
