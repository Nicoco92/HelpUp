'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, DollarSign, Calendar, Info } from 'lucide-react';
import api from '@/services/api';

export default function NewMissionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultCategory = searchParams.get('category') || '';
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      price: '',
      address: '',
      categoryId: ''
    }
  });
  
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/missions/categories');
        setCategories(res.data);
        
        // If a default category name was passed, try to select its ID
        if (defaultCategory) {
          const match = res.data.find((c: any) => c.name.toLowerCase() === defaultCategory.toLowerCase());
          if (match) {
            // Need to set it in the form
          }
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, [defaultCategory]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // In a real app we'd geocode the address
      const payload = {
        title: data.title,
        description: data.description,
        price: Number(data.price),
        address: data.address,
        categoryId: data.categoryId,
        lat: 48.8566, // Mock Paris
        lng: 2.3522, // Mock Paris
      };
      
      const response = await api.post('/missions', payload);
      const missionId = response.data.id;
      
      // Auto-publish the mission so providers can see it immediately
      await api.patch(`/missions/${missionId}/publish`);

      router.push('/dashboard/client/missions');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la création de la mission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Nouvelle annonce</h1>
        <p className="text-gray-500 mt-2 font-medium">Détaillez votre besoin pour trouver le profil idéal.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Titre de l'annonce</label>
            <input
              type="text"
              {...register('title', { required: 'Le titre est requis' })}
              className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors"
              placeholder="Ex: Aide pour monter un meuble IKEA"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600 font-medium">{errors.title.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Catégorie</label>
            <select
              {...register('categoryId', { required: 'La catégorie est requise' })}
              className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors"
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="mt-1 text-sm text-red-600 font-medium">{errors.categoryId.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description détaillée</label>
            <textarea
              {...register('description', { required: 'La description est requise' })}
              rows={4}
              className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors resize-none"
              placeholder="Décrivez précisément ce qu'il faut faire..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600 font-medium">{errors.description.message as string}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Rémunération proposée (€)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  {...register('price', { required: 'Le prix est requis', min: 1 })}
                  className="appearance-none rounded-xl relative block w-full px-4 py-3 pl-11 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors"
                  placeholder="30"
                />
              </div>
              {errors.price && <p className="mt-1 text-sm text-red-600 font-medium">{errors.price.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Adresse (Auto-complétion)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register('address', { required: 'L\'adresse est requise' })}
                  className="appearance-none rounded-xl relative block w-full px-4 py-3 pl-11 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors"
                  placeholder="123 rue de la Paix, Paris"
                />
              </div>
              {errors.address && <p className="mt-1 text-sm text-red-600 font-medium">{errors.address.message as string}</p>}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start space-x-3 mt-4">
            <Info className="text-blue-500 mt-0.5 flex-shrink-0" size={20} />
            <p className="text-sm text-blue-800 font-medium">
              Votre paiement sera sécurisé par Stripe. Le montant ne sera débité que lorsque vous aurez validé un profil.
            </p>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 mr-4 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {loading ? 'Publication...' : 'Publier l\'annonce'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
