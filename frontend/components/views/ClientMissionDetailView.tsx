'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, DollarSign, Clock, ArrowLeft, Star, MessageSquare, CreditCard } from 'lucide-react';
import api from '@/services/api';

export default function MissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [mission, setMission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mock candidates for UI demonstration
  const mockCandidates = [
    { id: '1', name: 'Lucas D.', rating: 4.8, jobsDone: 12, comment: 'Disponible ce week-end !', avatar: 'LD' },
    { id: '2', name: 'Sophie M.', rating: 4.9, jobsDone: 34, comment: 'J\'habite à 5 min, je peux venir avec mes outils.', avatar: 'SM' },
  ];

  useEffect(() => {
    const fetchMission = async () => {
      try {
        const response = await api.get(`/missions/${id}`);
        setMission(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchMission();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!mission) {
    return <div>Mission introuvable.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <button 
        onClick={() => router.back()}
        className="flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={16} className="mr-2" /> Retour aux annonces
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-8 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full mb-4 inline-block">En attente</span>
              <h1 className="text-3xl font-black text-gray-900 mb-2">{mission.title}</h1>
              <div className="flex items-center text-gray-500 text-sm font-medium space-x-4">
                <span className="flex items-center"><MapPin size={16} className="mr-1" /> Paris</span>
                <span className="flex items-center"><Clock size={16} className="mr-1" /> Publiée le {new Date(mission.createdAt || new Date()).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
            <div className="text-right bg-gray-50 p-4 rounded-2xl">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Rémunération</p>
              <p className="text-3xl font-black text-blue-600">{mission.price}€</p>
            </div>
          </div>
        </div>
        <div className="p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Description</h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{mission.description || 'Aucune description fournie.'}</p>
        </div>
      </div>

      <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Candidatures reçues ({mockCandidates.length})</h2>

      <div className="space-y-4">
        {mockCandidates.map((candidate) => (
          <div key={candidate.id} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-inner">
                {candidate.avatar}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{candidate.name}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Star size={14} className="text-yellow-400 mr-1 fill-current" />
                  <span className="font-bold text-gray-700 mr-1">{candidate.rating}</span>
                  <span>({candidate.jobsDone} missions)</span>
                </div>
                <p className="text-sm text-gray-600 mt-2 italic">"{candidate.comment}"</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="flex items-center justify-center px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all">
                <MessageSquare size={16} className="mr-2" /> Discuter
              </button>
              <button className="flex items-center justify-center px-4 py-2 bg-blue-600 rounded-xl text-sm font-bold text-white hover:bg-blue-700 shadow-sm transition-all">
                <CreditCard size={16} className="mr-2" /> Choisir et Payer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
