export class MapController {
  constructor() {
    this.map = L.map("map").setView([0, 0], 2);

    const satellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles © Esri" }
    ).addTo(this.map);

    const osm = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { attribution: "© OSM" }
    );

    L.control.layers({ Satellite: satellite, Streets: osm }, null, {
      position: "topleft",
      collapsed: true
    }).addTo(this.map);

    this.polyline = L.polyline([], { color: "#3fa9f5" }).addTo(this.map);

    this.currentMarker = null;
    this.accuracyCircle = null;

    this.setupGeolocation();
  }

  setupGeolocation() {
    this.map.locate({ setView: true, maxZoom: 16, watch: true });

    this.map.on("locationfound", e => {
      if (!this.currentMarker) {
        this.currentMarker = L.circleMarker(e.latlng, {
          radius: 8,
          fillColor: "#4285F4",
          color: "#fff",
          weight: 2,
          fillOpacity: 1
        }).addTo(this.map);

        this.accuracyCircle = L.circle(e.latlng, {
          radius: e.accuracy,
          color: "#4285F4",
          weight: 1,
          fillOpacity: 0.1
        }).addTo(this.map);
      } else {
        this.currentMarker.setLatLng(e.latlng);
        this.accuracyCircle.setLatLng(e.latlng).setRadius(e.accuracy);
      }
    });
  }

  updatePolyline(latlngs) {
    this.polyline.setLatLngs(latlngs);
  }
}