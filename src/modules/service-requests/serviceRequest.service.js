import { ApiError } from '../../utils/ApiError.js';
import { calculateDistanceMeters, estimateDurationSeconds } from '../../utils/distance.js';

import {
  acceptRequest,
  createServiceRequest,
  findAvailableRequestsForVolunteer,
  findDisabledBySupervisor,
  findServiceRequestById,
  findRequestsByDisabled,
  findRequestsBySupervisor,
  findVolunteerForMatching
} from './serviceRequest.repository.js';

const LOCATION_MAX_AGE_MINUTES = 15;
const ROUTE_PROVIDER = 'simple_haversine';

const toNumberOrNull = (value) => {
  return value === null || value === undefined ? null : Number(value);
};

const formatRequest = (request) => {
  return {
    requestId: request.request_id,
    disId: request.dis_id,
    supId: request.sup_id || null,
    requesterUserId: request.requester_user_id || null,
    requestType: request.request_type,
    requestedTime: request.requested_time,
    originAddress: request.origin_address || null,
    originLat: toNumberOrNull(request.origin_lat),
    originLng: toNumberOrNull(request.origin_lng),
    destinationAddress: request.destination_address || null,
    destinationLat: toNumberOrNull(request.destination_lat),
    destinationLng: toNumberOrNull(request.destination_lng),
    description: request.description || null,
    status: request.status,
    disabled: request.disabled_first_name
      ? {
          firstName: request.disabled_first_name,
          lastName: request.disabled_last_name
        }
      : null,
    createdAt: request.created_at,
    updatedAt: request.updated_at
  };
};

const formatRequestWithEstimate = ({ request, distanceMeters, durationSeconds }) => {
  return {
    ...formatRequest(request),
    approxDistanceMeters: distanceMeters,
    approxDurationSeconds: durationSeconds,
    approxDurationMinutes: Math.ceil(durationSeconds / 60),
    routeProvider: ROUTE_PROVIDER
  };
};

const formatAccept = ({ request, accept }) => {
  return {
    request: formatRequest(request),
    accept: {
      acceptId: accept.accept_id,
      requestId: accept.request_id,
      volId: accept.vol_id,
      volunteerLatAtAccept: toNumberOrNull(accept.volunteer_lat_at_accept),
      volunteerLngAtAccept: toNumberOrNull(accept.volunteer_lng_at_accept),
      estimatedDistanceMeters: accept.estimated_distance_meters,
      estimatedDurationSeconds: accept.estimated_duration_seconds,
      estimatedDurationMinutes: Math.ceil(accept.estimated_duration_seconds / 60),
      routeProvider: accept.route_provider,
      routeCalculatedAt: accept.route_calculated_at,
      acceptedAt: accept.accepted_at,
      startedAt: accept.started_at,
      finishedAt: accept.finished_at,
      status: accept.status
    }
  };
};

const ensureRequesterRole = (user) => {
  if (!user || !['disabled', 'supervisor'].includes(user.role)) {
    throw new ApiError(
      403,
      'Only disabled users or supervisors can create service requests',
      'REQUESTER_ROLE_REQUIRED'
    );
  }
};

const ensureVolunteerCanMatch = (volunteer) => {
  if (!volunteer) {
    throw new ApiError(404, 'Volunteer profile not found', 'VOLUNTEER_NOT_FOUND');
  }

  if (volunteer.verification_status !== 'approved') {
    throw new ApiError(403, 'Volunteer is not approved', 'VOLUNTEER_NOT_APPROVED');
  }

  if (!volunteer.is_online) {
    throw new ApiError(403, 'Volunteer must be online', 'VOLUNTEER_OFFLINE');
  }

  if (volunteer.current_lat === null || volunteer.current_lng === null) {
    throw new ApiError(400, 'Volunteer current location is required', 'LOCATION_REQUIRED');
  }

  if (!volunteer.location_updated_at) {
    throw new ApiError(400, 'Volunteer location update time is required', 'LOCATION_REQUIRED');
  }

  const locationAgeMs = Date.now() - new Date(volunteer.location_updated_at).getTime();
  const maxAgeMs = LOCATION_MAX_AGE_MINUTES * 60 * 1000;

  if (locationAgeMs > maxAgeMs) {
    throw new ApiError(
      400,
      'Volunteer location is too old, update your location again',
      'LOCATION_TOO_OLD'
    );
  }
};

export const createMyServiceRequest = async ({ user, data }) => {
  ensureRequesterRole(user);

  let disId;
  let supId = null;

  if (user.role === 'disabled') {
    if (!user.disId) {
      throw new ApiError(403, 'Disabled profile not found', 'DISABLED_PROFILE_REQUIRED');
    }

    disId = user.disId;
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

  const request = await createServiceRequest({
    disId,
    supId,
    requesterUserId: user.userId,
    requestType: data.requestType,
    requestedTime: data.requestedTime,
    originAddress: data.originAddress,
    originLat: data.originLat,
    originLng: data.originLng,
    destinationAddress: data.destinationAddress,
    destinationLat: data.destinationLat,
    destinationLng: data.destinationLng,
    description: data.description
  });

  return formatRequest(request);
};

export const getMyServiceRequests = async (user) => {
  ensureRequesterRole(user);

  if (user.role === 'disabled') {
    if (!user.disId) {
      throw new ApiError(403, 'Disabled profile not found', 'DISABLED_PROFILE_REQUIRED');
    }

    const requests = await findRequestsByDisabled(user.disId);
    return requests.map(formatRequest);
  }

  if (!user.supId) {
    throw new ApiError(403, 'Supervisor profile not found', 'SUPERVISOR_PROFILE_REQUIRED');
  }

  const requests = await findRequestsBySupervisor(user.supId);
  return requests.map(formatRequest);
};

export const getAvailableRequestsForMe = async (user) => {
  if (!user || user.role !== 'volunteer' || !user.volId) {
    throw new ApiError(403, 'Volunteer role required', 'VOLUNTEER_ROLE_REQUIRED');
  }

  const volunteer = await findVolunteerForMatching(user.volId);
  ensureVolunteerCanMatch(volunteer);

  const requests = await findAvailableRequestsForVolunteer(user.volId);

  const volunteerLat = Number(volunteer.current_lat);
  const volunteerLng = Number(volunteer.current_lng);

  const requestsWithEstimate = requests.map((request) => {
    const distanceMeters = calculateDistanceMeters({
      fromLat: volunteerLat,
      fromLng: volunteerLng,
      toLat: Number(request.origin_lat),
      toLng: Number(request.origin_lng)
    });

    const durationSeconds = estimateDurationSeconds({ distanceMeters });

    return formatRequestWithEstimate({
      request,
      distanceMeters,
      durationSeconds
    });
  });

  return requestsWithEstimate.sort(
    (first, second) => first.approxDistanceMeters - second.approxDistanceMeters
  );
};

export const acceptServiceRequestForMe = async ({ user, requestId }) => {
  if (!user || user.role !== 'volunteer' || !user.volId) {
    throw new ApiError(403, 'Volunteer role required', 'VOLUNTEER_ROLE_REQUIRED');
  }

  const volunteer = await findVolunteerForMatching(user.volId);
  ensureVolunteerCanMatch(volunteer);

  const volunteerLat = Number(volunteer.current_lat);
  const volunteerLng = Number(volunteer.current_lng);

  const request = await findServiceRequestById(requestId);

  if (!request) {
    throw new ApiError(404, 'Service request not found', 'SERVICE_REQUEST_NOT_FOUND');
  }

  const distanceMeters = calculateDistanceMeters({
    fromLat: volunteerLat,
    fromLng: volunteerLng,
    toLat: Number(request.origin_lat),
    toLng: Number(request.origin_lng)
  });

  const durationSeconds = estimateDurationSeconds({ distanceMeters });

  const requestCheck = await acceptRequest({
    requestId,
    volId: user.volId,
    volunteerLatAtAccept: volunteerLat,
    volunteerLngAtAccept: volunteerLng,
    estimatedDistanceMeters: distanceMeters,
    estimatedDurationSeconds: durationSeconds,
    routeProvider: ROUTE_PROVIDER
  });

  if (requestCheck.type === 'not_found') {
    throw new ApiError(404, 'Service request not found', 'SERVICE_REQUEST_NOT_FOUND');
  }

  if (requestCheck.type === 'already_taken') {
    throw new ApiError(409, 'Service request is not pending', 'SERVICE_REQUEST_NOT_PENDING');
  }

  if (requestCheck.type === 'not_available_at_time') {
    throw new ApiError(
      403,
      'Volunteer is not available at the requested time',
      'VOLUNTEER_NOT_AVAILABLE_AT_REQUESTED_TIME'
    );
  }

  return formatAccept({
    request: requestCheck.request,
    accept: requestCheck.accept
  });
};
