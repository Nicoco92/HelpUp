'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ShieldCheck, Lock, CreditCard, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';

// Initialize Stripe (replace with real public key in production)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || 'pk_test_dummy');

const CheckoutForm = ({ missionId, price, onSuccess }: { missionId: string, price: number, onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    // Simulated API call to backend to create intent and validate payment
    try {
      // const response = await api.post(`/payments/create-intent`, { missionId });
      // const clientSecret = response.data.clientSecret;
      // const result = await stripe.confirmCardPayment(clientSecret, {
      //   payment_method: { card: elements.getElement(CardElement)! }
      // });
      
      // Simulate successful payment delay
      setTimeout(() => {
        setProcessing(false);
        onSuccess();
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors du paiement.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#1f2937',
                '::placeholder': { color: '#9ca3af' },
                fontFamily: 'system-ui, sans-serif'
              },
              invalid: { color: '#ef4444' },
            },
          }} 
        />
      </div>
      
      {error && (
        <div className="text-red-600 text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center disabled:opacity-50"
      >
        {processing ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            Traitement en cours...
          </div>
        ) : (
          <div className="flex items-center">
            <Lock size={18} className="mr-2" />
            Payer {price}€ de manière sécurisée
          </div>
        )}
      </button>
    </form>
  );
};

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const missionId = params.missionId as string;
  const [success, setSuccess] = useState(false);

  // Mock data
  const mission = {
    title: 'Aide pour déménagement (canapé)',
    price: 40,
    candidateName: 'Lucas D.'
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-lg w-full rounded-3xl p-10 text-center shadow-xl border border-green-100">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Paiement validé !</h1>
          <p className="text-gray-600 font-medium mb-8">
            La mission a été attribuée à <span className="font-bold text-gray-900">{mission.candidateName}</span>. 
            Le montant de {mission.price}€ est bloqué en sécurité et sera transféré au prestataire une fois la mission terminée.
          </p>
          <button 
            onClick={() => router.push('/dashboard/client/missions')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-md transition-all"
          >
            Retour à mes annonces
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" /> Retour à la mission
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Order Summary */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-wide">Récapitulatif</h2>
              
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Mission</span>
                  <span className="font-bold text-gray-900 text-right max-w-[150px] truncate">{mission.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Prestataire</span>
                  <span className="font-bold text-gray-900">{mission.candidateName}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-end mb-8">
                <span className="text-gray-900 font-black text-xl">Total à régler</span>
                <span className="text-3xl font-black text-blue-600">{mission.price}€</span>
              </div>

              <div className="bg-blue-50 text-blue-800 p-4 rounded-2xl text-sm font-medium flex items-start">
                <ShieldCheck size={20} className="mr-3 text-blue-500 flex-shrink-0 mt-0.5" />
                <p>
                  Paiement 100% sécurisé. Nous conservons l'argent jusqu'à ce que vous confirmiez que la mission est terminée.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-900">Paiement sécurisé</h1>
                  <p className="text-sm text-gray-500 font-medium">Propulsé par Stripe</p>
                </div>
              </div>

              <Elements stripe={stripePromise}>
                <CheckoutForm missionId={missionId} price={mission.price} onSuccess={() => setSuccess(true)} />
              </Elements>
              
              <div className="mt-8 text-center text-xs text-gray-400 font-medium flex justify-center items-center space-x-2">
                <Lock size={12} />
                <span>Toutes vos transactions sont chiffrées (SSL 256 bits).</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
