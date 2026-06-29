import * as emergencyAlertService from './emergencyAlert.service.js';

export const create = async (req, res) => {
  const alert = await emergencyAlertService.createMyEmergencyAlert({
    user: req.user,
    data: req.validated.body
  });

  res.status(201).json({
    success: true,
    data: {
      alert
    }
  });
};

export const getMyAlerts = async (req, res) => {
  const alerts = await emergencyAlertService.getMyEmergencyAlerts(req.user);

  res.json({
    success: true,
    data: {
      alerts
    }
  });
};

export const resolve = async (req, res) => {
  const alert = await emergencyAlertService.resolveMyEmergencyAlert({
    user: req.user,
    alertId: req.validated.params.alertId
  });

  res.json({
    success: true,
    data: {
      alert
    }
  });
};

export const cancel = async (req, res) => {
  const alert = await emergencyAlertService.cancelMyEmergencyAlert({
    user: req.user,
    alertId: req.validated.params.alertId
  });

  res.json({
    success: true,
    data: {
      alert
    }
  });
};
