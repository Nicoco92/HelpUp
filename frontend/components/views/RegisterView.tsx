'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, Briefcase, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';

type Role = 'CLIENT' | 'PROVIDER';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get('type')?.toUpperCase() as Role) || null;
  
  const [step, setStep] = useState<number>(initialRole ? 2 : 1);
  const [selectedRole, setSelectedRole] = useState<Role | null>(initialRole);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setStep(2);
    if (role === 'PROVIDER') {
      api.get('/users/skills').then(res => setAvailableSkills(res.data)).catch(console.error);
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    setApiError('');
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: selectedRole,
        ...(selectedRole === 'PROVIDER' && { dateOfBirth: data.dateOfBirth })
      };
      
      const response = await api.post('/auth/signup', payload);
      const { access_token, user } = response.data;
      setAuth(access_token, user);

      if (selectedRole === 'PROVIDER' && data.skills && data.skills.length > 0) {
        // Configure api instance with new token immediately for the next request
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        // data.skills is already an array of selected IDs from the checkboxes
        await api.post('/users/me/skills', { skillIds: Array.isArray(data.skills) ? data.skills : [data.skills] });
      }
      
      router.push(`/dashboard/${selectedRole?.toLowerCase()}`);
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[100px] pointer-events-none"></div>

      <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl z-10 border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            {step === 1 ? 'Rejoignez HELP\'UP' : 'Création de votre compte'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-medium">
            {step === 1 ? 'Comment souhaitez-vous utiliser la plateforme ?' : 'Presque terminé, parlez-nous de vous.'}
          </p>
        </div>

        {step === 1 && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <button
              onClick={() => handleRoleSelect('CLIENT')}
              className="relative flex flex-col items-center p-8 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all group focus:outline-none"
            >
              <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <User size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Je cherche de l'aide</h3>
              <p className="text-sm text-gray-500 text-center font-medium">
                Trouvez des personnes de confiance pour vos besoins du quotidien.
              </p>
              <div className="absolute top-4 right-4 text-gray-300 group-hover:text-blue-500">
                <ChevronRight size={24} />
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect('PROVIDER')}
              className="relative flex flex-col items-center p-8 border-2 border-gray-200 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group focus:outline-none"
            >
              <div className="bg-indigo-100 text-indigo-600 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Briefcase size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Je propose mes services</h3>
              <p className="text-sm text-gray-500 text-center font-medium">
                Générez des revenus en aidant les personnes autour de vous.
              </p>
              <div className="absolute top-4 right-4 text-gray-300 group-hover:text-indigo-500">
                <ChevronRight size={24} />
              </div>
            </button>
          </div>
        )}

        {step === 2 && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {apiError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start space-x-3">
                <AlertCircle className="text-red-500 mt-0.5" size={18} />
                <p className="text-sm text-red-700 font-medium">{apiError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  {...register('firstName', { required: 'Ce champ est requis' })}
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50 transition-colors"
                />
                {errors.firstName && <p className="mt-1 text-sm text-red-600 font-medium">{errors.firstName.message as string}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  {...register('lastName', { required: 'Ce champ est requis' })}
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50 transition-colors"
                />
                {errors.lastName && <p className="mt-1 text-sm text-red-600 font-medium">{errors.lastName.message as string}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Adresse email</label>
              <input
                type="email"
                {...register('email', { required: 'Ce champ est requis' })}
                className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50 transition-colors"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600 font-medium">{errors.email.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mot de passe</label>
              <input
                type="password"
                {...register('password', { required: 'Ce champ est requis', minLength: { value: 8, message: 'Minimum 8 caractères' } })}
                className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50 transition-colors"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600 font-medium">{errors.password.message as string}</p>}
            </div>

            {selectedRole === 'PROVIDER' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date de naissance</label>
                  <input
                    type="date"
                    {...register('dateOfBirth', { required: 'La date de naissance est requise' })}
                    className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 transition-colors"
                  />
                  {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600 font-medium">{errors.dateOfBirth.message as string}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Vos compétences (sélectionnez au moins une)
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-xl bg-gray-50">
                    {availableSkills.map((skill) => (
                      <label key={skill.id} className="flex items-center space-x-3 bg-white p-2 rounded-lg border border-gray-100 shadow-sm cursor-pointer hover:border-indigo-300">
                        <input
                          type="checkbox"
                          value={skill.id}
                          {...register('skills', { required: 'Merci d\'indiquer au moins une compétence' })}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                      </label>
                    ))}
                  </div>
                  {errors.skills && <p className="mt-1 text-sm text-red-600 font-medium">{errors.skills.message as string}</p>}
                </div>
              </>
            )}

            <div className="pt-2 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex justify-center py-3.5 px-8 border border-transparent text-sm font-bold rounded-xl text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 ${
                  selectedRole === 'PROVIDER' ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                }`}
              >
                {loading ? 'Inscription en cours...' : 'Créer mon compte'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 font-medium">
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="font-bold text-blue-600 hover:text-blue-500">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
