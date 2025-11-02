import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import styles from "./styles/EventMap.module.css";

// Fix for default marker icon issue with webpack
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41], // Half of icon width, full height
  popupAnchor: [1, -34], // Relative to iconAnchor
});

L.Marker.prototype.options.icon = DefaultIcon;

/**
 * A simple, non-interactive map to display a single event location.
 * @param {Array} position - [latitude, longitude]
 * @param {string} popupText - Text to display in the marker's popup
 * @param {number} zoom - Map zoom level (default: 13)
 */
const EventMap = ({ position, popupText = "Event Location", zoom = 13 }) => {
  // Ensure position is valid, fallback to a default
  const mapPosition =
    Array.isArray(position) && position.length === 2 && position[0] !== 0
      ? position
      : [51.505, -0.09]; // Default to London if no position

  return (
    <MapContainer
      center={mapPosition}
      zoom={zoom}
      className={styles.mapContainer}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={mapPosition}>
        <Popup>{popupText}</Popup>
      </Marker>
    </MapContainer>
  );
};

export default EventMap;
