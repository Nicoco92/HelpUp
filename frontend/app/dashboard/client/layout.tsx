import Link from 'next/link';
import { Home, PlusCircle, ListTodo } from 'lucide-react';

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-6">
            Espace Client
          </h2>
          <nav className="space-y-2">
            <Link
              href="/dashboard/client"
              className="flex items-center space-x-3 px-4 py-3 text-sm font-semibold rounded-xl text-blue-700 bg-blue-50 transition-colors"
            >
              <Home size={20} />
              <span>Accueil</span>
            </Link>
            <Link
              href="/dashboard/client/missions"
              className="flex items-center space-x-3 px-4 py-3 text-sm font-semibold rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <ListTodo size={20} />
              <span>Mes annonces</span>
            </Link>
            <Link
              href="/dashboard/client/missions/new"
              className="flex items-center space-x-3 px-4 py-3 mt-4 text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
            >
              <PlusCircle size={20} />
              <span>Nouvelle annonce</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
