export class MapController {
  constructor() {
    this.map = L.map("map").setView([0, 0], 2);
    this.searchMarker = null;

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
    this.bcPolyline = L.polyline([], { color: "#222", weight: 4, opacity: 0.9, dashArray: "6,6"}).addTo(this.map);

    this.currentMarker = null;
    this.accuracyCircle = null;

    this.setupGeolocation();
  }

  setupGeolocation() {
    this.map.locate({ setView: false, maxZoom: 16, watch: true });

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

        this.map.setView(e.latlng, 16);

      } else {
        this.currentMarker.setLatLng(e.latlng);
        this.accuracyCircle.setLatLng(e.latlng).setRadius(e.accuracy);
      }
    });
  }

  updatePolyline(latlngs) {
    this.polyline.setLatLngs(latlngs);
  }

  updateBCPolyline(latlngs) {
    this.bcPolyline.setLatLngs(latlngs);
  }

  async searchPlace(query, limit = 10) {
    const url = 'https://nominatim.openstreetmap.org/search?' +
      new URLSearchParams({q: query, format: "jsonv2", limit});
    
    const res = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "BreadCrumbs/1.0"
      }
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.map(d => ({
      name: d.display_name,
      lat: parseFloat(d.lat),
      lon: parseFloat(d.lon)
    }));
  }
}