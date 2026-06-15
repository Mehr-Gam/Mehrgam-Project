import { ApiError } from '../../utils/ApiError.js';
import { getRouteEstimate, tryReverseGeocodeAddress } from '../maps/map.service.js';

import {
  acceptRequest,
  cancelRequest,
  createServiceRequest,
  findAvailableRequestsForVolunteer,
  findDisabledBySupervisor,
  findRequestsByDisabled,
  findRequestsBySupervisor,
  findServiceRequestById,
  findVolunteerForMatching,
  finishRequest,
  startRequest
} from './serviceRequest.repository.js';

const LOCATION_MAX_AGE_MINUTES = Number(process.env.LOCATION_MAX_AGE_MINUTES || 15);
const MAX_MATCH_DISTANCE_METERS = Number(process.env.MAX_MATCH_DISTANCE_METERS || 5000);

const toNumberOrNull = (value) => {
  return value === null || value === undefined ? null : Number(value);
};

const normalizeOptionalText = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();
  return text ? text : null;
};

const formatPoint = ({ address, lat, lng }) => {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return null;
  }

  return {
    address: address || null,
    lat: toNumberOrNull(lat),
    lng: toNumberOrNull(lng)
  };
};

const formatRequest = (request) => {
  const origin = formatPoint({
    address: request.origin_address,
    lat: request.origin_lat,
    lng: request.origin_lng
  });

  const destination = formatPoint({
    address: request.destination_address,
    lat: request.destination_lat,
    lng: request.destination_lng
  });

  return {
    requestId: request.request_id,
    disId: request.dis_id,
    supId: request.sup_id || null,
    requesterUserId: request.requester_user_id || null,
    requestType: request.request_type,
    requestedTime: request.requested_time,

    // Backward compatible flat fields
    originAddress: origin?.address || null,
    originLat: origin?.lat ?? null,
    originLng: origin?.lng ?? null,
    destinationAddress: destination?.address || null,
    destinationLat: destination?.lat ?? null,
    destinationLng: destination?.lng ?? null,

    // Easier for frontend map forms
    points: {
      origin,
      destination
    },

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

const formatRequestWithEstimate = ({ request, routeEstimate, maxMatchDistanceMeters }) => {
  const distanceMeters = routeEstimate.distanceMeters;
  const durationSeconds = routeEstimate.durationSeconds;

  return {
    ...formatRequest(request),
    approxDistanceMeters: distanceMeters,
    approxDurationSeconds: durationSeconds,
    approxDurationMinutes: Math.ceil(durationSeconds / 60),
    routeProvider: routeEstimate.provider,
    routeIsFallback: routeEstimate.isFallback,
    maxMatchDistanceMeters,
    isInsideMatchRadius: distanceMeters <= maxMatchDistanceMeters
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
      estimatedDurationMinutes: accept.estimated_duration_seconds
        ? Math.ceil(accept.estimated_duration_seconds / 60)
        : null,
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

const ensureVolunteerRole = (user) => {
  if (!user || user.role !== 'volunteer' || !user.volId) {
    throw new ApiError(403, 'Volunteer role required', 'VOLUNTEER_ROLE_REQUIRED');
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

const resolveAddressIfMissing = async ({ address, lat, lng }) => {
  const normalizedAddress = normalizeOptionalText(address);

  if (normalizedAddress) {
    return normalizedAddress;
  }

  return tryReverseGeocodeAddress({ lat, lng });
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

  const originAddress = await resolveAddressIfMissing({
    address: data.originAddress,
    lat: data.originLat,
    lng: data.originLng
  });

  const hasDestination = data.destinationLat !== undefined && data.destinationLng !== undefined;
  const destinationAddress = hasDestination
    ? await resolveAddressIfMissing({
        address: data.destinationAddress,
        lat: data.destinationLat,
        lng: data.destinationLng
      })
    : normalizeOptionalText(data.destinationAddress);

  const request = await createServiceRequest({
    disId,
    supId,
    requesterUserId: user.userId,
    requestType: data.requestType,
    requestedTime: data.requestedTime,
    originAddress,
    originLat: data.originLat,
    originLng: data.originLng,
    destinationAddress,
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
  ensureVolunteerRole(user);

  const volunteer = await findVolunteerForMatching(user.volId);
  ensureVolunteerCanMatch(volunteer);

  const requests = await findAvailableRequestsForVolunteer(user.volId);

  const volunteerLat = Number(volunteer.current_lat);
  const volunteerLng = Number(volunteer.current_lng);

  const requestsWithEstimate = await Promise.all(
    requests.map(async (request) => {
      const routeEstimate = await getRouteEstimate({
        originLat: volunteerLat,
        originLng: volunteerLng,
        destinationLat: Number(request.origin_lat),
        destinationLng: Number(request.origin_lng),
        useExternalProvider: false
      });

      return formatRequestWithEstimate({
        request,
        routeEstimate,
        maxMatchDistanceMeters: MAX_MATCH_DISTANCE_METERS
      });
    })
  );

  return requestsWithEstimate
    .filter((request) => request.approxDistanceMeters <= MAX_MATCH_DISTANCE_METERS)
    .sort((first, second) => first.approxDistanceMeters - second.approxDistanceMeters);
};

export const acceptServiceRequestForMe = async ({ user, requestId }) => {
  ensureVolunteerRole(user);

  const volunteer = await findVolunteerForMatching(user.volId);
  ensureVolunteerCanMatch(volunteer);

  const volunteerLat = Number(volunteer.current_lat);
  const volunteerLng = Number(volunteer.current_lng);

  const request = await findServiceRequestById(requestId);

  if (!request) {
    throw new ApiError(404, 'Service request not found', 'SERVICE_REQUEST_NOT_FOUND');
  }

  const routeEstimate = await getRouteEstimate({
    originLat: volunteerLat,
    originLng: volunteerLng,
    destinationLat: Number(request.origin_lat),
    destinationLng: Number(request.origin_lng),
    useExternalProvider: true
  });

  if (routeEstimate.distanceMeters > MAX_MATCH_DISTANCE_METERS) {
    throw new ApiError(
      403,
      'Service request is outside volunteer matching radius',
      'REQUEST_OUTSIDE_MATCH_RADIUS'
    );
  }

  const requestCheck = await acceptRequest({
    requestId,
    volId: user.volId,
    volunteerLatAtAccept: volunteerLat,
    volunteerLngAtAccept: volunteerLng,
    estimatedDistanceMeters: routeEstimate.distanceMeters,
    estimatedDurationSeconds: routeEstimate.durationSeconds,
    routeProvider: routeEstimate.provider
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

export const startServiceRequestForMe = async ({ user, requestId }) => {
  ensureVolunteerRole(user);

  const result = await startRequest({
    requestId,
    volId: user.volId
  });

  if (result.type === 'not_found') {
    throw new ApiError(404, 'Service request not found', 'SERVICE_REQUEST_NOT_FOUND');
  }

  if (result.type === 'not_owner') {
    throw new ApiError(
      403,
      'This request was not accepted by this volunteer',
      'REQUEST_NOT_ACCEPTED_BY_VOLUNTEER'
    );
  }

  if (result.type === 'invalid_status') {
    throw new ApiError(409, 'Only accepted requests can be started', 'REQUEST_NOT_ACCEPTED');
  }

  return formatAccept({
    request: result.request,
    accept: result.accept
  });
};

export const finishServiceRequestForMe = async ({ user, requestId }) => {
  ensureVolunteerRole(user);

  const result = await finishRequest({
    requestId,
    volId: user.volId
  });

  if (result.type === 'not_found') {
    throw new ApiError(404, 'Service request not found', 'SERVICE_REQUEST_NOT_FOUND');
  }

  if (result.type === 'not_owner') {
    throw new ApiError(
      403,
      'This request was not accepted by this volunteer',
      'REQUEST_NOT_ACCEPTED_BY_VOLUNTEER'
    );
  }

  if (result.type === 'invalid_status') {
    throw new ApiError(409, 'Only in-progress requests can be finished', 'REQUEST_NOT_IN_PROGRESS');
  }

  return formatAccept({
    request: result.request,
    accept: result.accept
  });
};

export const cancelServiceRequestForMe = async ({ user, requestId }) => {
  if (!user || !['disabled', 'supervisor', 'volunteer'].includes(user.role)) {
    throw new ApiError(403, 'Access denied', 'ACCESS_DENIED');
  }

  const result = await cancelRequest({
    requestId,
    user
  });

  if (result.type === 'not_found') {
    throw new ApiError(404, 'Service request not found', 'SERVICE_REQUEST_NOT_FOUND');
  }

  if (result.type === 'not_owner') {
    throw new ApiError(403, 'You are not allowed to cancel this request', 'REQUEST_CANCEL_NOT_ALLOWED');
  }

  if (result.type === 'invalid_status') {
    throw new ApiError(409, 'This request cannot be cancelled', 'REQUEST_CANNOT_BE_CANCELLED');
  }

  return {
    request: formatRequest(result.request),
    accept: result.accept
      ? {
          acceptId: result.accept.accept_id,
          requestId: result.accept.request_id,
          volId: result.accept.vol_id,
          status: result.accept.status,
          acceptedAt: result.accept.accepted_at,
          startedAt: result.accept.started_at,
          finishedAt: result.accept.finished_at
        }
      : null
  };
};
