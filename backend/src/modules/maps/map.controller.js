import * as mapService from './map.service.js';

export const reverse = async (req, res) => {
  const result = await mapService.reverseGeocode(req.validated.query);

  res.json({
    success: true,
    data: result
  });
};

export const search = async (req, res) => {
  const result = await mapService.searchPlaces(req.validated.query);

  res.json({
    success: true,
    data: result
  });
};

export const route = async (req, res) => {
  const result = await mapService.getRouteEstimate(req.validated.body);

  res.json({
    success: true,
    data: result
  });
};
