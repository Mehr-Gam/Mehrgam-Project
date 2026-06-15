import { calculateDistanceMeters, estimateDurationSeconds } from '../../utils/distance.js';
import { callNeshanApi, hasNeshanApiKey } from './neshan.client.js';

const SIMPLE_ROUTE_PROVIDER = 'simple_haversine';
const NESHAN_ROUTE_PROVIDER = 'neshan_direction';

const toNumberOrNull = (value) => {
  return value === null || value === undefined ? null : Number(value);
};

const formatPoint = ({ lat, lng, address = null }) => ({
  lat: Number(lat),
  lng: Number(lng),
  address: address || null
});

const normalizeNeshanSearchItem = (item) => {
  const location = item.location || {};

  return {
    title: item.title || item.name || null,
    address: item.address || null,
    neighbourhood: item.neighbourhood || null,
    region: item.region || null,
    type: item.type || null,
    category: item.category || null,
    lat: toNumberOrNull(location.y ?? location.lat ?? item.lat),
    lng: toNumberOrNull(location.x ?? location.lng ?? item.lng)
  };
};

const sumLegValues = (legs, key) => {
  return Math.round(
    legs.reduce((total, leg) => {
      const value = Number(leg?.[key]?.value ?? 0);
      return total + value;
    }, 0)
  );
};

const flattenSteps = (legs) => {
  return legs.flatMap((leg) => {
    return (leg.steps || []).map((step) => ({
      name: step.name || null,
      instruction: step.instruction || null,
      type: step.type || null,
      modifier: step.modifier || null,
      distanceMeters: Math.round(Number(step.distance?.value ?? 0)),
      durationSeconds: Math.round(Number(step.duration?.value ?? 0)),
      polyline: step.polyline || null,
      startLocation: Array.isArray(step.start_location)
        ? {
            lng: toNumberOrNull(step.start_location[0]),
            lat: toNumberOrNull(step.start_location[1])
          }
        : null
    }));
  });
};

export const buildSimpleRouteEstimate = ({
  originLat,
  originLng,
  destinationLat,
  destinationLng,
  fallbackReason = null
}) => {
  const distanceMeters = calculateDistanceMeters({
    fromLat: originLat,
    fromLng: originLng,
    toLat: destinationLat,
    toLng: destinationLng
  });

  const durationSeconds = estimateDurationSeconds({ distanceMeters });

  return {
    provider: SIMPLE_ROUTE_PROVIDER,
    isFallback: Boolean(fallbackReason),
    fallbackReason,
    origin: formatPoint({ lat: originLat, lng: originLng }),
    destination: formatPoint({ lat: destinationLat, lng: destinationLng }),
    distanceMeters,
    durationSeconds,
    durationMinutes: Math.ceil(durationSeconds / 60),
    overviewPolyline: null,
    legs: [],
    steps: []
  };
};

export const reverseGeocode = async ({ lat, lng }) => {
  const data = await callNeshanApi({
    path: '/v5/reverse',
    queryParams: { lat, lng }
  });

  return {
    provider: 'neshan_reverse',
    lat: Number(lat),
    lng: Number(lng),
    address: data.formatted_address || null,
    routeName: data.route_name || null,
    routeType: data.route_type || null,
    neighbourhood: data.neighbourhood || null,
    city: data.city || null,
    state: data.state || null,
    place: data.place || null,
    municipalityZone: data.municipality_zone || null,
    inTrafficZone: data.in_traffic_zone ?? null,
    inOddEvenZone: data.in_odd_even_zone ?? null,
    raw: data
  };
};

export const tryReverseGeocodeAddress = async ({ lat, lng }) => {
  if (!hasNeshanApiKey()) {
    return null;
  }

  try {
    const result = await reverseGeocode({ lat, lng });
    return result.address;
  } catch {
    return null;
  }
};

export const searchPlaces = async ({ term, lat, lng }) => {
  const data = await callNeshanApi({
    path: '/v1/search',
    queryParams: { term, lat, lng }
  });

  return {
    provider: 'neshan_search',
    term,
    referencePoint: formatPoint({ lat, lng }),
    items: Array.isArray(data.items) ? data.items.map(normalizeNeshanSearchItem) : [],
    raw: data
  };
};

export const getNeshanRoute = async ({
  originLat,
  originLng,
  destinationLat,
  destinationLng,
  type = 'car'
}) => {
  const data = await callNeshanApi({
    path: '/v4/direction',
    queryParams: {
      type,
      origin: `${originLat},${originLng}`,
      destination: `${destinationLat},${destinationLng}`,
      alternative: false
    }
  });

  const route = data.routes?.[0] || null;
  const legs = route?.legs || [];
  const distanceMeters = sumLegValues(legs, 'distance');
  const durationSeconds = sumLegValues(legs, 'duration');

  return {
    provider: NESHAN_ROUTE_PROVIDER,
    isFallback: false,
    fallbackReason: null,
    type,
    origin: formatPoint({ lat: originLat, lng: originLng }),
    destination: formatPoint({ lat: destinationLat, lng: destinationLng }),
    distanceMeters,
    durationSeconds,
    durationMinutes: Math.ceil(durationSeconds / 60),
    overviewPolyline: route?.overview_polyline?.points || null,
    legs: legs.map((leg) => ({
      summary: leg.summary || null,
      distanceMeters: Math.round(Number(leg.distance?.value ?? 0)),
      distanceText: leg.distance?.text || null,
      durationSeconds: Math.round(Number(leg.duration?.value ?? 0)),
      durationText: leg.duration?.text || null
    })),
    steps: flattenSteps(legs),
    raw: data
  };
};

export const getRouteEstimate = async ({
  originLat,
  originLng,
  destinationLat,
  destinationLng,
  type = 'car',
  useExternalProvider = true,
  fallbackOnError = true
}) => {
  if (useExternalProvider && hasNeshanApiKey()) {
    try {
      return await getNeshanRoute({
        originLat,
        originLng,
        destinationLat,
        destinationLng,
        type
      });
    } catch (error) {
      if (!fallbackOnError) {
        throw error;
      }

      return buildSimpleRouteEstimate({
        originLat,
        originLng,
        destinationLat,
        destinationLng,
        fallbackReason: error.code || 'NESHAN_ROUTE_FAILED'
      });
    }
  }

  return buildSimpleRouteEstimate({
    originLat,
    originLng,
    destinationLat,
    destinationLng,
    fallbackReason: useExternalProvider ? 'NESHAN_API_KEY_MISSING' : null
  });
};
