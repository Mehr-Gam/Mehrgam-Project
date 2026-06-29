import * as mapService from './map.service.js';

export const searchPlaces = async (req, res) => {
  const result = await mapService.searchPlaces(req.validated.query);

  res.json({
    success: true,
    data: result
  });
};

export const reverseGeocode = async (req, res) => {
  const result = await mapService.reverseGeocode(req.validated.query);

  res.json({
    success: true,
    data: result
  });
};

export const estimateDistance = async (req, res) => {
  const estimate = await mapService.getDistanceEstimate(req.validated.body);

  res.json({
    success: true,
    data: {
      estimate
    }
  });
};
