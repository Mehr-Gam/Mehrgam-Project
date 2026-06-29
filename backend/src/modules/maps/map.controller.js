import * as mapService from './map.service.js';

export const estimateDistance = async (req, res) => {
  const estimate = await mapService.getDistanceEstimate(req.validated.body);

  res.json({
    success: true,
    data: {
      estimate
    }
  });
};
