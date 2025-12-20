import { computeDistance, computeBearing } from "./Utils.js";

export class WaypointManager {
  constructor(mapController) {
    this.map = mapController;
    this.list = [];
    this.bcList = [];
  }

  _createMarker(lat, lon, options = {}) {
    return L.marker([lat, lon], options).addTo(this.map.map);
  }

  add(lat, lon) {
    const wp = {
      name: "Waypoint " + (this.list.length + 1),
      hint: "",
      lat,
      lon
    };

    const marker = L.marker([lat, lon], { draggable: true }).addTo(this.map.map);

    marker.on("drag dragend", () => {
      const p = marker.getLatLng();
      wp.lat = p.lat;
      wp.lon = p.lng;
      this.update();
    });

    marker.on("click", () => {
      const i = this.list.indexOf(wp);
      if (i >= 0 && this.onEditRequested) this.onEditRequested(i);
    });

    wp.marker = marker;
    this.list.push(wp);
    this.update();
  }

  delete(i) {
    this.map.map.removeLayer(this.list[i].marker);
    this.list.splice(i, 1);
    this.update();
  }

  reorder(from, to) {
    const moved = this.list.splice(from, 1)[0];
    this.list.splice(to, 0, moved);
    this.update();
  }

  update() {
    this.map.updatePolyline(this.list.map(w => [w.lat, w.lon]));
    if (this.onListChanged) this.onListChanged();
  }

  importLantern(arr) {
    this.list.forEach(w => this.map.map.removeLayer(w.marker));
    this.list = [];

    arr.forEach(d => this.add(d.lat, d.lon));

    this.list.forEach((w, i) => {
      w.name = arr[i].name || "";
      w.hint = arr[i].hint || "";
    });

    this.update();
  }

  importBC(arr) {
    this.bcList.forEach(w => this.map.map.removeLayer(w.marker));
    this.bcList = [];

    const latlngs = [];

    arr.forEach(d => {
      const wp = {
        name: d.name || "",
        hint: d.hint || "",
        lat: d.lat,
        lon: d.lon
      };

      const marker = L.circleMarker([wp.lat, wp.lon], {
        radius: 4,
        color: "#ff8800",
        fillColor: "#ff8800",
        fillOpacity: 0.9
      }).addTo(this.map.map);

      wp.marker = marker;
      this.bcList.push(wp);
      latlngs.push([wp.lat, wp.lon]);
    });

    this.map.updateBCPolyline(latlngs);
  }

  clearBC() {
    this.bcList.forEach(w => this.map.map.removeLayer(w.marker));
    this.bcList = [];
    this.map.updateBCPolyline([]);
  }

  exportData() {
    return this.list.map(w => ({
      name: w.name,
      hint: w.hint,
      lat: w.lat,
      lon: w.lon
    }));
  }

  segmentInfo(i) {
    if (i >= this.list.length - 1) return null;
    const a = this.list[i], b = this.list[i + 1];
    return {
      distanceMiles: computeDistance(a.lat, a.lon, b.lat, b.lon) / 1609.34,
      bearing: computeBearing(a.lat, a.lon, b.lat, b.lon)
    };
  }
}