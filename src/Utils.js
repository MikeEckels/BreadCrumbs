export function computeDistance(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371000;
  const toRad = x => x * Math.PI / 180;
  const diffLat = toRad(lat2 - lat1);
  const diffLon = toRad(lon2 - lon1);
  const angularDist = Math.sin(diffLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(diffLon / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(angularDist), Math.sqrt(1 - angularDist));
}

export function computeBearing(lat1, lon1, lat2, lon2) {
  const toRad = x => x * Math.PI / 180;
  const toDeg = x => x * 180 / Math.PI;
  const diffLon = toRad(lon2 - lon1);
  const y = Math.sin(diffLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(diffLon);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  }[c]));
}