const EARTH_RADIUS_METERS = 6371000

const toRadians = (value: number) => (value * Math.PI) / 180

const haversineDistanceMeters = (
  start: [number, number],
  end: [number, number]
) => {
  const [lat1, lon1] = start
  const [lat2, lon2] = end

  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const lat1Rad = toRadians(lat1)
  const lat2Rad = toRadians(lat2)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_METERS * c
}

export const calculatePolylineLengthMeters = (coords: [number, number][]) => {
  if (!coords || coords.length < 2) {
    return 0
  }

  let total = 0

  for (let i = 1; i < coords.length; i += 1) {
    total += haversineDistanceMeters(coords[i - 1], coords[i])
  }

  return total
}
