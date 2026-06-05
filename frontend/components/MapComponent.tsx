'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useRouter } from 'next/navigation';

// Fix Leaflet default icon issue in Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapComponentProps {
  missions: any[];
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function MapComponent({ missions }: MapComponentProps) {
  const router = useRouter();
  // Default to Paris center
  const [center, setCenter] = useState<[number, number]>([48.8566, 2.3522]);

  useEffect(() => {
    // Attempt to get user's geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn('Geolocation error:', error);
        }
      );
    }
  }, []);

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="h-full w-full rounded-2xl md:rounded-none z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} />
        
        {/* User position marker */}
        <Marker position={center} icon={customIcon}>
          <Popup>
            <div className="font-bold">Votre position</div>
          </Popup>
        </Marker>

        {/* Missions markers */}
        {missions.map((mission) => (
          <Marker 
            key={mission.id} 
            position={[mission.latitude || 48.86, mission.longitude || 2.34]} 
            icon={customIcon}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-gray-900 mb-1">{mission.title}</h3>
                <p className="text-blue-600 font-bold mb-2">{mission.price}€</p>
                <button 
                  onClick={() => router.push(`/dashboard/provider/missions/${mission.id}`)}
                  className="w-full bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  Voir l'annonce
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
