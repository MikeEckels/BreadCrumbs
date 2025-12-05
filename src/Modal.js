export class Modal {
  constructor(waypoints) {
    this.waypoints = waypoints;
    this.editing = null;

    this.modal = document.getElementById("modal");
    this.nameEl = document.getElementById("wpName");
    this.hintEl = document.getElementById("wpHint");

    document.getElementById("saveModal").onclick = () => this.save();
    document.getElementById("cancelModal").onclick = () => this.close();
    this.modal.addEventListener("click", e => {
      if (e.target.id === "modal") this.close();
    });
  }

  open(i) {
    this.editing = i;
    const wp = this.waypoints.list[i];
    this.nameEl.value = wp.name;
    this.hintEl.value = wp.hint;
    this.modal.style.display = "flex";
  }

  close() {
    this.editing = null;
    this.modal.style.display = "none";
  }

  save() {
    if (this.editing != null) {
      const wp = this.waypoints.list[this.editing];
      wp.name = this.nameEl.value;
      wp.hint = this.hintEl.value;
      this.waypoints.update();
    }
    this.close();
  }
}