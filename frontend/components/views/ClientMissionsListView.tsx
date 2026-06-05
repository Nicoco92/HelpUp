'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Clock, CheckCircle2, ChevronRight, PlusCircle } from 'lucide-react';
import api from '@/services/api';

interface Mission {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  createdAt: string;
}

export default function ClientMissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const response = await api.get('/missions/my-missions');
        setMissions(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMissions();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">En attente</span>;
      case 'ASSIGNED':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">Assignée</span>;
      case 'IN_PROGRESS':
        return <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">En cours</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">Terminée</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded-full">{status}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mes annonces</h1>
          <p className="text-gray-500 mt-2 font-medium">Suivez l'état de vos demandes et consultez les candidatures.</p>
        </div>
        <Link
          href="/dashboard/client/missions/new"
          className="hidden sm:flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all"
        >
          <PlusCircle size={18} />
          <span>Nouvelle annonce</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : missions.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="text-blue-500 w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune annonce en cours</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Vous n'avez pas encore publié d'annonce. Décrivez votre besoin et trouvez rapidement de l'aide.</p>
          <Link
            href="/dashboard/client/missions/new"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all"
          >
            Publier une annonce
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {missions.map((mission) => (
            <Link
              href={`/dashboard/client/missions/${mission.id}`}
              key={mission.id}
              className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-blue-200 transition-all group"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusBadge(mission.status)}
                    <span className="text-sm text-gray-400 font-medium">
                      {new Date(mission.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {mission.title}
                  </h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm font-medium text-gray-500">
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-1" /> Paris
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-0 flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-2xl font-black text-gray-900">{mission.price}€</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-full text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                    <ChevronRight size={24} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
