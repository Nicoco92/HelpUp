'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, ArrowLeft, Send, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function ApplyMissionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);

  // Mock mission data
  const mission = {
    id,
    title: 'Aide pour déménagement (canapé)',
    description: 'Bonjour, j\'ai besoin d\'aide pour descendre un canapé du 3ème étage (sans ascenseur). Il faut être deux. C\'est assez urgent pour ce samedi matin.',
    price: 40,
    clientName: 'Martin D.',
    location: 'Paris 11e (à 1.2 km)',
    createdAt: new Date().toISOString()
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setApplied(true);
    }, 1500);
  };

  if (applied) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl p-10 text-center shadow-xl border border-green-100">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Candidature envoyée !</h2>
          <p className="text-lg text-gray-600 mb-8 font-medium">
            Votre proposition a été transmise à {mission.clientName}. Vous serez notifié s'il accepte votre aide.
          </p>
          <button 
            onClick={() => router.push('/dashboard/provider')}
            className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold shadow-md hover:bg-gray-800 transition-colors"
          >
            Retour à la carte
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <button 
        onClick={() => router.back()}
        className="flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={16} className="mr-2" /> Retour
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Mission Details */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight leading-tight">{mission.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500 mb-6">
              <span className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <MapPin size={16} className="mr-2 text-gray-400" /> {mission.location}
              </span>
              <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-bold border border-blue-100">
                Par {mission.clientName}
              </span>
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-2xl">{mission.description}</p>
          </div>

          {/* Application Form */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
              <Send className="mr-3 text-blue-600" size={24} /> 
              Proposer mon aide
            </h2>
            
            <form onSubmit={handleApply}>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Message pour {mission.clientName}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  placeholder="Bonjour, je suis disponible et équipé pour vous aider..."
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 flex items-center font-medium max-w-xs">
                  <ShieldCheck size={16} className="mr-1 text-green-500 flex-shrink-0" />
                  Paiement garanti après réalisation via l'application.
                </p>
                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none"
                >
                  {loading ? 'Envoi...' : 'Envoyer ma proposition'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 rounded-3xl p-6 text-white sticky top-24 shadow-xl">
            <h3 className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-2">Rémunération</h3>
            <div className="text-5xl font-black mb-6">{mission.price}€</div>
            
            <div className="space-y-4 text-sm font-medium text-gray-300">
              <div className="flex items-start">
                <CheckCircle2 size={18} className="text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                <p>Versement sécurisé sur votre portefeuille HELP'UP après validation.</p>
              </div>
              <div className="flex items-start">
                <AlertCircle size={18} className="text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                <p>N'oubliez pas d'inclure les frais de déplacement si nécessaires.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
