import Link from 'next/link';
import { 
  Wrench, 
  Leaf, 
  Truck, 
  Dog, 
  Monitor, 
  BookOpen,
  ChevronRight
} from 'lucide-react';

const categories = [
  { id: 'bricolage', name: 'Bricolage', icon: Wrench, color: 'text-orange-500', bg: 'bg-orange-100', border: 'hover:border-orange-500' },
  { id: 'jardinage', name: 'Jardinage', icon: Leaf, color: 'text-green-500', bg: 'bg-green-100', border: 'hover:border-green-500' },
  { id: 'demenagement', name: 'Déménagement', icon: Truck, color: 'text-blue-500', bg: 'bg-blue-100', border: 'hover:border-blue-500' },
  { id: 'animaux', name: 'Garde d\'animaux', icon: Dog, color: 'text-purple-500', bg: 'bg-purple-100', border: 'hover:border-purple-500' },
  { id: 'informatique', name: 'Informatique', icon: Monitor, color: 'text-indigo-500', bg: 'bg-indigo-100', border: 'hover:border-indigo-500' },
  { id: 'soutien', name: 'Soutien Scolaire', icon: BookOpen, color: 'text-pink-500', bg: 'bg-pink-100', border: 'hover:border-pink-500' },
];

export default function ClientDashboardPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">De quelle aide avez-vous besoin ?</h1>
        <p className="text-gray-500 mt-2 font-medium">Sélectionnez une catégorie pour publier votre annonce rapidement.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={`/dashboard/client/missions/new?category=${cat.id}`}
              className={`group bg-white border-2 border-gray-100 rounded-2xl p-6 transition-all transform hover:-translate-y-1 hover:shadow-lg ${cat.border}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-4 rounded-2xl ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform`}>
                  <Icon size={32} />
                </div>
                <div className="text-gray-300 group-hover:text-gray-900 transition-colors">
                  <ChevronRight size={24} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{cat.name}</h3>
              <p className="text-sm text-gray-500 mt-1 font-medium">Créer une annonce</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-12 bg-blue-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-blue-500 rounded-full blur-3xl opacity-50"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Un besoin spécifique ?</h3>
            <p className="text-blue-100 max-w-lg">
              Décrivez votre demande librement et notre algorithme l'associera aux meilleurs profils disponibles près de chez vous.
            </p>
          </div>
          <div className="mt-6 sm:mt-0">
            <Link
              href="/dashboard/client/missions/new"
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold shadow-md hover:bg-gray-50 transition-colors inline-block"
            >
              Annonce personnalisée
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
