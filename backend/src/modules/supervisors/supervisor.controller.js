import * as supervisorService from './supervisor.service.js';

export const getMyDisabled = async (req, res) => {
  const result = await supervisorService.getMyDisabled({
    user: req.user,
    query: req.validated.query
  });

  res.json({
    success: true,
    data: result
  });
};

export const attachDisabled = async (req, res) => {
  const disabled = await supervisorService.attachDisabledToMe({
    user: req.user,
    nationalCode: req.validated.body.nationalCode
  });

  res.status(201).json({
    success: true,
    data: {
      disabled
    }
  });
};

export const removeDisabled = async (req, res) => {
  const disabled = await supervisorService.removeDisabledFromMe({
    user: req.user,
    disId: req.validated.params.disId
  });

  res.json({
    success: true,
    data: {
      disabled
    }
  });
};
