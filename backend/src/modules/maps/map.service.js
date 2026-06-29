import { ApiError } from '../../utils/ApiError.js';

const NESHAN_DISTANCE_MATRIX_URL = 'https://api.neshan.org/v1/distance-matrix';

const buildDistanceMatrixUrl = ({ origin, destination, type }) => {
  const url = new URL(NESHAN_DISTANCE_MATRIX_URL);

  url.searchParams.set('type', type);
  url.searchParams.set('origins', `${origin.lat},${origin.lng}`);
  url.searchParams.set('destinations', `${destination.lat},${destination.lng}`);

  return url;
};

export const getDistanceEstimate = async ({ origin, destination, type = 'car' }) => {
  const apiKey = process.env.NESHAN_SERVICE_API_KEY;

  if (!apiKey) {
    throw new ApiError(
      500,
      'Neshan service API key is not configured',
      'NESHAN_SERVICE_API_KEY_MISSING'
    );
  }

  let response;

  try {
    response = await fetch(buildDistanceMatrixUrl({ origin, destination, type }), {
      method: 'GET',
      headers: {
        'Api-Key': apiKey
      }
    });
  } catch {
    throw new ApiError(502, 'Could not connect to Neshan service', 'NESHAN_CONNECTION_FAILED');
  }

  let result;

  try {
    result = await response.json();
  } catch {
    throw new ApiError(502, 'Invalid response from Neshan service', 'NESHAN_INVALID_RESPONSE');
  }

  if (!response.ok) {
    throw new ApiError(502, 'Neshan service returned an error', 'NESHAN_SERVICE_ERROR', result);
  }

  const element = result?.rows?.[0]?.elements?.[0];

  if (result.status !== 'Ok' || !element || element.status !== 'Ok') {
    throw new ApiError(502, 'Could not calculate route distance', 'NESHAN_DISTANCE_FAILED', result);
  }

  return {
    provider: 'neshan',
    type,
    origin: {
      lat: origin.lat,
      lng: origin.lng,
      address: result.origin_addresses?.[0] || null
    },
    destination: {
      lat: destination.lat,
      lng: destination.lng,
      address: result.destination_addresses?.[0] || null
    },
    distance: {
      value: element.distance.value,
      text: element.distance.text
    },
    duration: {
      value: element.duration.value,
      text: element.duration.text,
      minutes: Math.ceil(element.duration.value / 60)
    }
  };
};
