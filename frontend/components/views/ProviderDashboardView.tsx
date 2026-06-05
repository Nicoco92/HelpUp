'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MapPin, DollarSign, ChevronRight, Filter } from 'lucide-react';
import api from '@/services/api';

// Dynamically import MapComponent to prevent SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 flex items-center justify-center animate-pulse rounded-2xl md:rounded-none">
      <div className="flex flex-col items-center">
        <MapPin size={32} className="text-gray-400 mb-2" />
        <span className="text-gray-500 font-medium">Chargement de la carte...</span>
      </div>
    </div>
  )
});

export default function ProviderDashboardPage() {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await api.get('/missions/published');
        const fetchedMissions = response.data.map((m: any) => ({
          ...m,
          // Extract lat/lng from PostGIS Point if available, else fallback to mock Paris coords
          latitude: m.location?.coordinates?.[1] || 48.8566 + (Math.random() - 0.5) * 0.02,
          longitude: m.location?.coordinates?.[0] || 2.3522 + (Math.random() - 0.5) * 0.02,
          distance: m.address ? 'À proximité' : 'Non précisé'
        }));
        setMissions(fetchedMissions);
      } catch (err) {
        console.error('Failed to fetch missions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMissions();
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
      {/* List Panel (Sidebar on desktop, bottom on mobile) */}
      <div className="w-full md:w-[400px] lg:w-[450px] bg-white border-r border-gray-200 flex flex-col h-[50vh] md:h-full z-10 shadow-xl md:shadow-none order-2 md:order-1">
        <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-20">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Missions autour de vous</h1>
          <p className="text-sm text-gray-500 font-medium mb-4">Gagnez de l'argent en aidant vos voisins.</p>
          
          <div className="flex space-x-2">
            <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-xl text-sm font-bold flex items-center justify-center transition-colors">
              <Filter size={16} className="mr-2" /> Filtrer
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {missions.map((mission) => (
            <Link
              key={mission.id}
              href={`/dashboard/provider/missions/${mission.id}`}
              className="block bg-white rounded-2xl border border-gray-100 p-5 hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                  {mission.title}
                </h3>
                <span className="bg-green-100 text-green-800 text-sm font-black px-3 py-1 rounded-full whitespace-nowrap ml-3">
                  {mission.price}€
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center text-sm font-medium text-gray-500">
                  <MapPin size={16} className="mr-1 text-gray-400" />
                  {mission.distance}
                </div>
                <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
                  <ChevronRight size={20} />
                </div>
              </div>
            </Link>
          ))}
          
          {missions.length === 0 && !loading && (
            <div className="text-center py-10">
              <p className="text-gray-500 font-medium">Aucune mission trouvée dans votre secteur.</p>
            </div>
          )}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative h-[50vh] md:h-full order-1 md:order-2 p-2 md:p-0">
        <MapComponent missions={missions} />
        
        {/* Overlay gradient for desktop map edge */}
        <div className="hidden md:block absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-gray-200/50 to-transparent pointer-events-none z-10"></div>
      </div>
    </div>
  );
}
