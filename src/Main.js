import { MapController } from "./Map.js";
import { WaypointManager } from "./Waypoints.js";
import { UIController } from "./UserInterface.js";
import { Modal } from "./Modal.js";

const map = new MapController();
const waypoints = new WaypointManager(map);
const modal = new Modal(waypoints);

new UIController(map, waypoints, modal);