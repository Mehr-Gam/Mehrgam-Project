import { ApiError } from '../../utils/ApiError.js';

const NESHAN_DISTANCE_MATRIX_URL = 'https://api.neshan.org/v1/distance-matrix';
const NESHAN_SEARCH_URL = 'https://api.neshan.org/v1/search';
const NESHAN_REVERSE_URL = 'https://api.neshan.org/v5/reverse';

const getNeshanServiceApiKey = () => {
  const apiKey = process.env.NESHAN_SERVICE_API_KEY;

  if (!apiKey) {
    throw new ApiError(
      500,
      'Neshan service API key is not configured',
      'NESHAN_SERVICE_API_KEY_MISSING'
    );
  }

  return apiKey;
};

const readJsonResponse = async (response) => {
  try {
    return await response.json();
  } catch {
    throw new ApiError(502, 'Invalid response from Neshan service', 'NESHAN_INVALID_RESPONSE');
  }
};

const callNeshanGet = async ({ url, errorCode }) => {
  let response;

  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        'Api-Key': getNeshanServiceApiKey()
      }
    });
  } catch {
    throw new ApiError(502, 'Could not connect to Neshan service', 'NESHAN_CONNECTION_FAILED');
  }

  const result = await readJsonResponse(response);

  if (!response.ok) {
    throw new ApiError(502, 'Neshan service returned an error', errorCode, result);
  }

  return result;
};

const formatCoordinate = ({ lat, lng }) => `${lat},${lng}`;

const buildDistanceMatrixUrl = ({ origins, destinations, type }) => {
  const url = new URL(NESHAN_DISTANCE_MATRIX_URL);

  url.searchParams.set('type', type);
  url.searchParams.set('origins', origins.map(formatCoordinate).join('|'));
  url.searchParams.set('destinations', destinations.map(formatCoordinate).join('|'));

  return url;
};

const buildSearchUrl = ({ term, lat, lng }) => {
  const url = new URL(NESHAN_SEARCH_URL);

  url.searchParams.set('term', term);
  url.searchParams.set('lat', lat);
  url.searchParams.set('lng', lng);

  return url;
};

const buildReverseUrl = ({ lat, lng }) => {
  const url = new URL(NESHAN_REVERSE_URL);

  url.searchParams.set('lat', lat);
  url.searchParams.set('lng', lng);

  return url;
};

const toFiniteNumber = (...values) => {
  for (const value of values) {
    const number = Number(value);

    if (Number.isFinite(number)) {
      return number;
    }
  }

  return null;
};

const normalizeSearchItem = (item, index) => {
  const location = item?.location || {};
  const lat = toFiniteNumber(location.y, location.lat, item?.lat, item?.latitude);
  const lng = toFiniteNumber(location.x, location.lng, location.lon, item?.lng, item?.lon, item?.longitude);

  if (lat === null || lng === null) {
    return null;
  }

  const title = item.title || item.name || item.address || 'موقعیت انتخابی';
  const address = item.address || item.formatted_address || item.region || title;

  return {
    id: item.id || item.place_id || `${lat},${lng},${index}`,
    title,
    address,
    lat,
    lng,
    neighbourhood: item.neighbourhood || null,
    region: item.region || null,
    category: item.category || null,
    type: item.type || null
  };
};

export const searchPlaces = async ({ term, lat, lng }) => {
  const result = await callNeshanGet({
    url: buildSearchUrl({ term, lat, lng }),
    errorCode: 'NESHAN_SEARCH_ERROR'
  });

  const rawItems = Array.isArray(result?.items)
    ? result.items
    : Array.isArray(result?.results)
      ? result.results
      : Array.isArray(result)
        ? result
        : [];

  return {
    provider: 'neshan',
    term,
    center: {
      lat: Number(lat),
      lng: Number(lng)
    },
    items: rawItems
      .map(normalizeSearchItem)
      .filter(Boolean)
      .slice(0, 30)
  };
};

export const reverseGeocode = async ({ lat, lng }) => {
  const result = await callNeshanGet({
    url: buildReverseUrl({ lat, lng }),
    errorCode: 'NESHAN_REVERSE_ERROR'
  });

  if (result?.status && result.status !== 'OK' && result.status !== 'Ok') {
    throw new ApiError(502, 'Could not reverse geocode this location', 'NESHAN_REVERSE_FAILED', result);
  }

  return {
    provider: 'neshan',
    lat: Number(lat),
    lng: Number(lng),
    formattedAddress: result.formatted_address || result.address || '',
    routeName: result.route_name || null,
    routeType: result.route_type || null,
    neighbourhood: result.neighbourhood || null,
    city: result.city || null,
    state: result.state || null,
    place: result.place || null,
    municipalityZone: result.municipality_zone || null,
    inTrafficZone: result.in_traffic_zone ?? null,
    inOddEvenZone: result.in_odd_even_zone ?? null,
    village: result.village || null,
    county: result.county || null,
    district: result.district || null
  };
};

const normalizeDistanceMatrixEstimate = ({ result, type, origin, destination, element, destinationIndex }) => {
  if (!element || element.status !== 'Ok' || !element.distance || !element.duration) {
    return null;
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
      address: result.destination_addresses?.[destinationIndex] || null
    },
    distance: {
      value: Number(element.distance.value),
      text: element.distance.text
    },
    duration: {
      value: Number(element.duration.value),
      text: element.duration.text,
      minutes: Math.ceil(Number(element.duration.value) / 60)
    }
  };
};

export const getDistanceMatrixEstimates = async ({ origin, destinations, type = 'car' }) => {
  if (!Array.isArray(destinations) || destinations.length === 0) {
    return [];
  }

  const result = await callNeshanGet({
    url: buildDistanceMatrixUrl({ origins: [origin], destinations, type }),
    errorCode: 'NESHAN_DISTANCE_MATRIX_ERROR'
  });

  if (result.status !== 'Ok') {
    throw new ApiError(502, 'Could not calculate route distances', 'NESHAN_DISTANCE_FAILED', result);
  }

  const elements = result?.rows?.[0]?.elements || [];

  return destinations.map((destination, index) =>
    normalizeDistanceMatrixEstimate({
      result,
      type,
      origin,
      destination,
      element: elements[index],
      destinationIndex: index
    })
  );
};

export const getDistanceEstimate = async ({ origin, destination, type = 'car' }) => {
  const [estimate] = await getDistanceMatrixEstimates({
    origin,
    destinations: [destination],
    type
  });

  if (!estimate) {
    throw new ApiError(502, 'Could not calculate route distance', 'NESHAN_DISTANCE_FAILED');
  }

  return estimate;
};
