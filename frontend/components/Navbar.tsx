'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuthStore();

  // Avoid hydration mismatch for Zustand persist
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">
                HELP'UP
              </span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-6">
            {mounted && user ? (
              <>
                <Link href={`/dashboard/${user.role?.toLowerCase()}`} className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-semibold transition-colors">
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <UserIcon size={16} className="text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700">{user.firstName}</span>
                </div>
                <button
                  onClick={logout}
                  className="text-gray-400 hover:text-red-500 p-2 rounded-full transition-colors hover:bg-red-50"
                  title="Déconnexion"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              mounted && (
                <>
                  <Link href="/login" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-semibold transition-colors">
                    Connexion
                  </Link>
                  <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                    S'inscrire
                  </Link>
                </>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none transition-colors"
            >
              <span className="sr-only">Ouvrir le menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md absolute w-full shadow-lg">
          <div className="pt-2 pb-4 space-y-1 px-4">
            {mounted && user ? (
              <>
                <Link href={`/dashboard/${user.role?.toLowerCase()}`} className="block px-3 py-3 text-base font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                  Dashboard
                </Link>
                <div className="px-3 py-3 text-sm text-gray-500 border-t border-gray-100 mt-2">
                  Connecté en tant que <span className="font-semibold text-gray-800">{user.firstName}</span>
                </div>
                <button
                  onClick={logout}
                  className="block w-full text-left px-3 py-3 text-base font-semibold text-red-500 hover:bg-red-50 rounded-lg mt-1"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              mounted && (
                <>
                  <Link href="/login" className="block px-3 py-3 text-base font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    Connexion
                  </Link>
                  <Link href="/register" className="block px-3 py-3 text-base font-semibold text-blue-600 hover:bg-blue-50 rounded-lg mt-1">
                    S'inscrire
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
