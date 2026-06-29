import { ApiError } from '../../utils/ApiError.js';

import {
  activateAvailability,
  createAvailability,
  deactivateAvailability,
  deleteAvailability,
  findAvailabilityByVolunteer,
  findVolunteerById,
  setVolunteerOnlineStatus,
  updateVolunteerLocation
} from './volunteer.repository.js';

const ensureVolunteer = (user) => {
  if (!user || user.role !== 'volunteer' || !user.volId) {
    throw new ApiError(403, 'Volunteer role required', 'VOLUNTEER_ROLE_REQUIRED');
  }
};

const formatVolunteerStatus = (volunteer) => {
  return {
    volId: volunteer.vol_id,
    homeAddress: volunteer.home_address,
    currentLat: volunteer.current_lat === null ? null : Number(volunteer.current_lat),
    currentLng: volunteer.current_lng === null ? null : Number(volunteer.current_lng),
    locationUpdatedAt: volunteer.location_updated_at,
    isOnline: volunteer.is_online,
    verificationStatus: volunteer.verification_status,
    verifiedAt: volunteer.verified_at,
    createdAt: volunteer.created_at
  };
};

const formatLocation = (volunteer) => {
  return {
    volId: volunteer.vol_id,
    currentLat: volunteer.current_lat === null ? null : Number(volunteer.current_lat),
    currentLng: volunteer.current_lng === null ? null : Number(volunteer.current_lng),
    locationUpdatedAt: volunteer.location_updated_at,
    isOnline: volunteer.is_online
  };
};

const formatAvailability = (availability) => {
  return {
    availId: availability.avail_id,
    volId: availability.vol_id,
    weekday: availability.weekday,
    startTime: availability.start_time,
    endTime: availability.end_time,
    isActive: availability.is_active,
    createdAt: availability.created_at
  };
};

export const getMyVolunteerProfile = async (user) => {
  ensureVolunteer(user);

  const volunteer = await findVolunteerById(user.volId);

  if (!volunteer) {
    throw new ApiError(404, 'Volunteer profile not found', 'VOLUNTEER_NOT_FOUND');
  }

  return formatVolunteerStatus(volunteer);
};

export const updateMyLocation = async ({ user, currentLat, currentLng }) => {
  ensureVolunteer(user);

  const volunteer = await updateVolunteerLocation({
    volId: user.volId,
    currentLat,
    currentLng
  });

  if (!volunteer) {
    throw new ApiError(404, 'Volunteer profile not found', 'VOLUNTEER_NOT_FOUND');
  }

  return formatLocation(volunteer);
};

export const setMyOnlineStatus = async ({ user, isOnline }) => {
  ensureVolunteer(user);

  if (isOnline) {
    const currentVolunteer = await findVolunteerById(user.volId);

    if (!currentVolunteer) {
      throw new ApiError(404, 'Volunteer profile not found', 'VOLUNTEER_NOT_FOUND');
    }

    if (currentVolunteer.current_lat === null || currentVolunteer.current_lng === null) {
      throw new ApiError(
        400,
        'Update your current location before going online',
        'LOCATION_REQUIRED'
      );
    }
  }

  const volunteer = await setVolunteerOnlineStatus({
    volId: user.volId,
    isOnline
  });

  if (!volunteer) {
    throw new ApiError(404, 'Volunteer profile not found', 'VOLUNTEER_NOT_FOUND');
  }

  return formatLocation(volunteer);
};

export const addMyAvailability = async ({ user, weekday, startTime, endTime }) => {
  ensureVolunteer(user);

  const availability = await createAvailability({
    volId: user.volId,
    weekday,
    startTime,
    endTime
  });

  return formatAvailability(availability);
};

export const getMyAvailability = async (user) => {
  ensureVolunteer(user);

  const availabilityItems = await findAvailabilityByVolunteer(user.volId);

  return availabilityItems.map(formatAvailability);
};

export const deactivateMyAvailability = async ({ user, availId }) => {
  ensureVolunteer(user);

  const availability = await deactivateAvailability({
    volId: user.volId,
    availId
  });

  if (!availability) {
    throw new ApiError(404, 'Availability not found', 'AVAILABILITY_NOT_FOUND');
  }

  return formatAvailability(availability);
};

export const activateMyAvailability = async ({ user, availId }) => {
  ensureVolunteer(user);

  const availability = await activateAvailability({
    volId: user.volId,
    availId
  });

  if (!availability) {
    throw new ApiError(404, 'Availability not found', 'AVAILABILITY_NOT_FOUND');
  }

  return formatAvailability(availability);
};

export const deleteMyAvailability = async ({ user, availId }) => {
  ensureVolunteer(user);

  const availability = await deleteAvailability({
    volId: user.volId,
    availId
  });

  if (!availability) {
    throw new ApiError(404, 'Availability not found', 'AVAILABILITY_NOT_FOUND');
  }

  return formatAvailability(availability);
};
