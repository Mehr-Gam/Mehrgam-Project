import * as volunteerService from './volunteer.service.js';

export const getMe = async (req, res) => {
  const volunteer = await volunteerService.getMyVolunteerProfile(req.user);

  res.json({
    success: true,
    data: {
      volunteer
    }
  });
};

export const updateLocation = async (req, res) => {
  const { currentLat, currentLng } = req.validated.body;

  const location = await volunteerService.updateMyLocation({
    user: req.user,
    currentLat,
    currentLng
  });

  res.json({
    success: true,
    data: {
      location
    }
  });
};

export const goOnline = async (req, res) => {
  const location = await volunteerService.setMyOnlineStatus({
    user: req.user,
    isOnline: true
  });

  res.json({
    success: true,
    data: {
      location
    }
  });
};

export const goOffline = async (req, res) => {
  const location = await volunteerService.setMyOnlineStatus({
    user: req.user,
    isOnline: false
  });

  res.json({
    success: true,
    data: {
      location
    }
  });
};

export const createAvailability = async (req, res) => {
  const { weekday, startTime, endTime } = req.validated.body;

  const availability = await volunteerService.addMyAvailability({
    user: req.user,
    weekday,
    startTime,
    endTime
  });

  res.status(201).json({
    success: true,
    data: {
      availability
    }
  });
};

export const getAvailability = async (req, res) => {
  const availability = await volunteerService.getMyAvailability(req.user);

  res.json({
    success: true,
    data: {
      availability
    }
  });
};

export const deactivateAvailability = async (req, res) => {
  const { availId } = req.validated.params;

  const availability = await volunteerService.deactivateMyAvailability({
    user: req.user,
    availId
  });

  res.json({
    success: true,
    data: {
      availability
    }
  });
};

export const activateAvailability = async (req, res) => {
  const { availId } = req.validated.params;

  const availability = await volunteerService.activateMyAvailability({
    user: req.user,
    availId
  });

  res.json({
    success: true,
    data: {
      availability
    }
  });
};

export const deleteAvailability = async (req, res) => {
  const { availId } = req.validated.params;

  const availability = await volunteerService.deleteMyAvailability({
    user: req.user,
    availId
  });

  res.json({
    success: true,
    data: {
      availability
    }
  });
};
