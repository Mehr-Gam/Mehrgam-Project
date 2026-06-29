import * as adminService from './admin.service.js';

export const listUsers = async (req, res) => {
  const result = await adminService.listUsers({
    query: req.validated.query
  });

  res.json({
    success: true,
    data: result
  });
};

export const getUserDetails = async (req, res) => {
  const user = await adminService.getUserDetails(req.validated.params.userId);

  res.json({
    success: true,
    data: {
      user
    }
  });
};

export const deactivateUser = async (req, res) => {
  const user = await adminService.deactivateUser({
    adminUser: req.user,
    userId: req.validated.params.userId
  });

  res.json({
    success: true,
    data: {
      user
    }
  });
};

export const activateUser = async (req, res) => {
  const user = await adminService.activateUser(req.validated.params.userId);

  res.json({
    success: true,
    data: {
      user
    }
  });
};

export const createAdmin = async (req, res) => {
  const admin = await adminService.createAdmin(req.validated.body);

  res.status(201).json({
    success: true,
    data: {
      admin
    }
  });
};

export const listDisabledProfiles = async (req, res) => {
  const result = await adminService.listDisabledProfiles({
    query: req.validated.query
  });

  res.json({
    success: true,
    data: result
  });
};

export const listSupervisorProfiles = async (req, res) => {
  const result = await adminService.listSupervisorProfiles({
    query: req.validated.query
  });

  res.json({
    success: true,
    data: result
  });
};

export const listVolunteers = async (req, res) => {
  const result = await adminService.listVolunteers({
    query: req.validated.query
  });

  res.json({
    success: true,
    data: result
  });
};

export const listPendingVolunteers = async (req, res) => {
  const result = await adminService.listPendingVolunteers({
    query: req.validated.query
  });

  res.json({
    success: true,
    data: result
  });
};

export const getVolunteerDetails = async (req, res) => {
  const volunteer = await adminService.getVolunteerDetails(req.validated.params.volId);

  res.json({
    success: true,
    data: {
      volunteer
    }
  });
};

export const approveVolunteer = async (req, res) => {
  const volunteer = await adminService.approveVolunteer(req.validated.params.volId);

  res.json({
    success: true,
    data: {
      volunteer
    }
  });
};

export const rejectVolunteer = async (req, res) => {
  const volunteer = await adminService.rejectVolunteer(req.validated.params.volId);

  res.json({
    success: true,
    data: {
      volunteer
    }
  });
};
