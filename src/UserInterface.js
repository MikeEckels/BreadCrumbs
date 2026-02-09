import { escapeHtml } from "./Utils.js";

export class UIController {
  constructor(map, waypoints, modal) {
    this.map = map;
    this.waypoints = waypoints;
    this.modal = modal;

    this.menu = document.getElementById("actionMenu");
    this.sidebarToggle = document.getElementById("toggleSidebar");
    this.sidebarClose = document.getElementById("closeSidebarBtn");
    this.sidebar = document.getElementById("sidebar");
    this.sideList = document.getElementById("sidebarList");
    this.topBtns = document.getElementById("topBtns");

    this.searchInput = document.getElementById("searchInput");
    this.searchBtn = document.getElementById("searchBtn");
    this.searchBox = this.searchInput.closest(".search-box");
    this.lastSuggestions = [];

    if (this.searchInput && this.searchBtn) {
      this.searchBtn.onclick = () => {
        this.search();
        this.searchInput.blur();
      }
      this.searchInput.onkeydown = e => {
        if (e.key === "Enter") {
          this.search();
          this.searchInput.blur();
        }
      };

      let autocompleteTimeout;

      this.searchInput.addEventListener("input", () => {
        clearTimeout(autocompleteTimeout);
        const query = this.searchInput.value.trim();
        if (!query) {
          this.hideSuggestions();
          return;
        }

        autocompleteTimeout = setTimeout(async () => {
          const suggestions = await this.map.searchPlace(query);
          this.lastSuggestions = suggestions;
          this.showSuggestions(suggestions);
        }, 300);
      });

      this.searchInput.addEventListener("blur", () => {
        setTimeout(() => this.hideSuggestions(), 150);
      });

      this.searchInput.addEventListener("focus", () => {
        if (this.lastSuggestions.length > 0) {
          this.showSuggestions(this.lastSuggestions);
        }
      });
    }

    waypoints.onListChanged = () => this.render();
    waypoints.onEditRequested = i => modal.open(i);

    this.wireButtons();
    this.map.map.on("click", e => waypoints.add(e.latlng.lat, e.latlng.lng));

    setTimeout(() => this.checkRecenter(), 400);
    this.map.map.on("moveend zoomend", () => this.checkRecenter());
  }

  wireButtons() {
    this.sidebarToggle.onclick = () => {
      this.sidebar.classList.add("open");
      document.querySelector('.top-bar-movable').style.right = "325px";
    };

    this.sidebarClose.onclick = () => {
      this.sidebar.classList.remove("open");
      document.querySelector('.top-bar-movable').style.right = "0px";
    };

    document.getElementById("actionToggle").onclick = (e) => {
      e.stopPropagation();
       this.menu.classList.toggle("open");
    };

    document.addEventListener("click", () => {
      this.menu.classList.remove("open");
    });

    this.menu.querySelector(".action-dropdown").addEventListener("click", e => {
      e.stopPropagation();
    })

    this.menu.querySelectorAll(".action-dropdown button").forEach(btn => {
      btn.addEventListener("click", () => {
        this.menu.classList.remove("open");
      });
    });

    document.getElementById("recenterBtn").onclick = () => {
      if (this.map.currentMarker)
        this.map.map.setView(this.map.currentMarker.getLatLng(), 16);
      this.checkRecenter();
    };

    document.getElementById("exportBtn").onclick = () => {
      const data = this.waypoints.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Lantern.json";
      a.click();
      URL.revokeObjectURL(url);
    };

    document.getElementById("importLantern").onclick = () => {
      const inp = document.createElement("input");
      inp.type = "file";
      inp.accept = ".json";
      inp.onchange = () => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            this.waypoints.importLantern(JSON.parse(reader.result));
          } catch {
            alert("Invalid JSON");
          }
        };
        reader.readAsText(inp.files[0]);
      };
      inp.click();
    };

    document.getElementById("importBC").onclick = () => {
      const inp = document.createElement("input");
      inp.type = "file";
      inp.accept = ".json";
      inp.onchange = () => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            this.waypoints.importBC(JSON.parse(reader.result));
          } catch {
            alert("Invalid JSON");
          }
        };
        reader.readAsText(inp.files[0]);
      };
      inp.click();
    };

    document.getElementById("clearBC").onclick = () => {
      this.waypoints.clearBC();
    };
  }

  checkRecenter() {
    const btn = document.getElementById("recenterBtn");
    if (!this.map.currentMarker) return;
    const inView = this.map.map.getBounds().contains(this.map.currentMarker.getLatLng());
    btn.style.display = inView ? "none" : "inline-block";
  }

  async search() {
    this.hideSuggestions();
    const q = this.searchInput.value.trim();
    if (!q) return;

    const result = await this.map.searchPlace(q, 10);
    if (!result.length) {
      alert("No results found");
      return;
    }

    const item = result[0];
    const lat = parseFloat(item.lat);
    const lon =parseFloat(item.lon);

    if (isNaN(lat) || isNaN(lon)) return;

    if (this.map.searchMarker)
      this.map.map.removeLayer(this.map.searchMarker);

    this.map.searchMarker = L.marker([lat, lon]).addTo(this.map.map).bindPopup(item.name).openPopup();
    this.map.map.setView([lat, lon], 15);
  }

  showSuggestions(list) {
    const container = this.searchBox.querySelector(".search-suggestions");
    container.innerHTML = "";
    if (!list.length) {
      container.style.display = "none";
      return;
    }

    list.forEach(item => {
      const div = document.createElement("div");
      div.textContent = item.name;
      div.addEventListener("mousedown", e => {
        e.preventDefault();
        this.selectSuggestion(item);
        this.hideSuggestions();
        this.searchInput.blur();
      });
      container.appendChild(div);
    });
    container.style.display = "block";
  }

  hideSuggestions() {
    const container = this.searchBox.querySelector(".search-suggestions");
    container.style.display = "none";
  }

  selectSuggestion(item) {
    this.hideSuggestions();

    if (this.map.searchMarker)
      this.map.map.removeLayer(this.map.searchMarker);

    this.map.searchMarker = window.L.marker([item.lat, item.lon]).addTo(this.map.map).bindPopup(item.name).openPopup();
    this.map.map.setView([item.lat, item.lon], 15);
  }

  render() {
    this.sideList.innerHTML = "";

    this.waypoints.list.forEach((w, i) => {
      const div = document.createElement("div");
      div.className = "waypoint";
      div.setAttribute("draggable", "true");
      div.dataset.index = i;

      let info = `Lat: ${w.lat.toFixed(5)}, Lon: ${w.lon.toFixed(5)}`;

      const segment = this.waypoints.segmentInfo(i);
      if (segment)
        info += `<br>Next: ${segment.distanceMiles.toFixed(2)} mi, Heading: ${segment.bearing.toFixed(0)}°`;

      div.innerHTML = `
        <h4>${w.name}</h4>
        <small>${info}</small>
        ${w.hint ? `<div class="hint">Hint: ${escapeHtml(w.hint)}</div>` : ""}
        <div style="margin-top:6px">
          <button class="edit">Edit</button>
          <button class="delete">Delete</button>
        </div>
      `;

      div.querySelector(".edit").onclick = () => this.modal.open(i);
      div.querySelector(".delete").onclick = () => this.waypoints.delete(i);

      div.addEventListener("dragstart", e => {
        div.classList.add("dragging");
        e.dataTransfer.setData("text/plain", String(i));
      });

      div.addEventListener("dragend", () => {
        div.classList.remove("dragging");
      });

      div.addEventListener("dragover", e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      });

      div.addEventListener("drop", e => {
        e.preventDefault();
        const from = parseInt(e.dataTransfer.getData("text/plain"), 10);
        const to = parseInt(div.dataset.index, 10);
        if (!isNaN(from) && !isNaN(to) && from !== to)
          this.waypoints.reorder(from, to);
      });

      this.sideList.appendChild(div);
    });
  }
}