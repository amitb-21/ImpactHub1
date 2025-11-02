import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { useGeolocation } from "../../hooks/useGeolocation";
import styles from "./styles/LocationPicker.module.css";

// Fix for default marker icon
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

/**
 * A map component that recenters the view to a new position.
 */
function ChangeMapView({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 13);
    }
  }, [coords, map]);
  return null;
}

/**
 * A component to handle map click events for location picking.
 */
function LocationFinder({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

/**
 * A modal component for picking a location on a map.
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Function to close the modal
 * @param {function} onLocationSelect - Function called with [lat, lng] on confirm
 * @param {Array} initialPosition - Optional [lat, lng] to start with
 */
const LocationPicker = ({
  isOpen,
  onClose,
  onLocationSelect,
  initialPosition = null,
}) => {
  const [selectedPosition, setSelectedPosition] = useState(initialPosition);
  const [mapCenter, setMapCenter] = useState(
    initialPosition || [51.505, -0.09]
  ); // Default to London

  const { latitude, longitude, loading, error, requestLocation } =
    useGeolocation();

  // When geolocation is found, update map center and selected position
  useEffect(() => {
    if (latitude && longitude) {
      const newPos = [latitude, longitude];
      setMapCenter(newPos);
      setSelectedPosition(newPos);
    }
  }, [latitude, longitude]);

  const handleConfirm = () => {
    if (selectedPosition) {
      onLocationSelect(selectedPosition);
      onClose();
    } else {
      alert("Please select a location on the map.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Location" size="lg">
      <div className={styles.container}>
        <div className={styles.mapHeader}>
          <p>
            Click on the map to select a location, or use your current location.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={requestLocation}
            loading={loading}
            disabled={loading}
          >
            {loading ? "Getting Location..." : "Use My Current Location"}
          </Button>
        </div>
        {error && <p className={styles.errorText}>{error}</p>}

        <MapContainer
          center={mapCenter}
          zoom={13}
          className={styles.mapContainer}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationFinder onLocationSelect={setSelectedPosition} />
          <ChangeMapView coords={mapCenter} />
          {selectedPosition && (
            <Marker position={selectedPosition}>
              <Popup>Selected Location</Popup>
            </Marker>
          )}
        </MapContainer>

        <div className={styles.footer}>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!selectedPosition}
          >
            Confirm Location
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LocationPicker;
