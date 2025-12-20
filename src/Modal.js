const NAME_MAX = 32;
const HINT_MAX = 64;

export class Modal {
  constructor(waypoints) {
    this.waypoints = waypoints;
    this.editing = null;

    this.modal = document.getElementById("modal");
    this.nameEl = document.getElementById("wpName");
    this.hintEl = document.getElementById("wpHint");

    this.hintCounter = document.getElementById("hintCounter");
    this.nameEl.maxLength = NAME_MAX;
    this.hintEl.maxLength = HINT_MAX;
    this.hintEl.addEventListener("input", () => this.updateHintCounter());

    document.getElementById("saveModal").onclick = () => this.save();
    document.getElementById("cancelModal").onclick = () => this.close();
    this.modal.addEventListener("click", e => {
      if (e.target.id === "modal") this.close();
    });
  }

  open(i) {
    this.editing = i;
    const wp = this.waypoints.list[i];
    this.nameEl.value = wp.name.slice(0, NAME_MAX);
    this.hintEl.value = wp.hint.slice(0, HINT_MAX);
    this.updateHintCounter();
    this.modal.style.display = "flex";
  }

  close() {
    this.editing = null;
    this.modal.style.display = "none";
  }

  save() {
    if (this.editing != null) {
      const wp = this.waypoints.list[this.editing];
      wp.name = this.nameEl.value.slice(0, NAME_MAX);
      wp.hint = this.hintEl.value.slice(0, HINT_MAX);
      this.waypoints.update();
    }
    this.close();
  }

  updateHintCounter() {
    const used = this.hintEl.value.length;
    const remaining = HINT_MAX - used;
    this.hintCounter.textContent = `${used} / ${remaining}`;
    this.hintCounter.style.color = remaining <= 5 ? "#c00" : "#666";
  }
}