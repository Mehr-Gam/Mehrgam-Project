import * as serviceRequestService from './serviceRequest.service.js';

export const create = async (req, res) => {
  const request = await serviceRequestService.createMyServiceRequest({
    user: req.user,
    data: req.validated.body
  });

  res.status(201).json({
    success: true,
    data: {
      request
    }
  });
};

export const getMyRequests = async (req, res) => {
  const requests = await serviceRequestService.getMyServiceRequests(req.user);

  res.json({
    success: true,
    data: {
      requests
    }
  });
};

export const getAvailableRequests = async (req, res) => {
  const requests = await serviceRequestService.getAvailableRequestsForMe(req.user);

  res.json({
    success: true,
    data: {
      requests
    }
  });
};

export const accept = async (req, res) => {
  const result = await serviceRequestService.acceptServiceRequestForMe({
    user: req.user,
    requestId: req.validated.params.requestId
  });

  res.status(201).json({
    success: true,
    data: result
  });
};

export const finish = async (req, res) => {
  const result = await serviceRequestService.finishServiceRequestForMe({
    user: req.user,
    requestId: req.validated.params.requestId
  });

  res.json({
    success: true,
    data: result
  });
};

export const cancel = async (req, res) => {
  const result = await serviceRequestService.cancelServiceRequestForMe({
    user: req.user,
    requestId: req.validated.params.requestId
  });

  res.json({
    success: true,
    data: result
  });
};
