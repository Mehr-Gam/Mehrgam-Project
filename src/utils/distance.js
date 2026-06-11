//

export const calculateDistanceMeters = ({ fromLat, fromLng, toLat, toLng }) => {
  const earthRadiusMeters = 6371000;

  const toRadians = (degree) => degree * (Math.PI / 180);

  const lat1 = toRadians(Number(fromLat));
  const lat2 = toRadians(Number(toLat));
  const deltaLat = toRadians(Number(toLat) - Number(fromLat));
  const deltaLng = toRadians(Number(toLng) - Number(fromLng));

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(earthRadiusMeters * c);
};

export const estimateDurationSeconds = ({ distanceMeters, averageSpeedKmh = 20 }) => {
  const speedMetersPerSecond = (averageSpeedKmh * 1000) / 3600;

  return Math.round(distanceMeters / speedMetersPerSecond);
};
